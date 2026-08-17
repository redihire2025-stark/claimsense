import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import type { AppView, AppTab, AuthMode, UserProfile } from "./types";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { MobileNav } from "./components/MobileNav";
import { MobileSidebarDrawer } from "./components/MobileSidebarDrawer";
import { PageWrapper } from "./components/PageWrapper";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { ClaimsView } from "./pages/ClaimsView";
import { BillAuditor } from "./pages/BillAuditor";
import { OCREngine } from "./pages/OCREngine";
import { AICopilot } from "./pages/AICopilot";
import { SLATracker } from "./pages/SLATracker";
import { Reports } from "./pages/Reports";
import { Policies } from "./pages/Policies";
import { SettingsView } from "./pages/SettingsView";

const tabTitles: Record<AppTab, string> = {
  dashboard: "Dashboard", claims: "Claims", auditor: "Bill Auditor",
  ocr: "OCR Engine", copilot: "AI Copilot", sla: "SLA Tracker",
  reports: "Reports", policies: "Policies", settings: "Settings",
};

const defaultUser: UserProfile = {
  name: "Suvarna Raju",
  email: "suvarnaraju494@gmail.com",
  role: "family",
  plan: "Family Pro",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("claimsense_user");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse user session", e);
    }
    return defaultUser;
  });
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Sync state with browser hash for smooth Back & Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash || hash === "landing") {
        setView("landing");
      } else if (hash === "auth" || hash === "signin" || hash === "signup") {
        if (hash === "signup") setAuthMode("signup");
        else setAuthMode("signin");
        setView("auth");
      } else if (tabTitles[hash as AppTab]) {
        setView("app");
        setActiveTab(hash as AppTab);
      }
    };

    window.addEventListener("popstate", handlePopState);
    if (window.location.hash) {
      handlePopState();
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToHash = (newHash: string) => {
    if (window.location.hash !== `#${newHash}`) {
      window.history.pushState(null, "", `#${newHash}`);
    }
  };

  const handleOpenAuth = (mode?: AuthMode) => {
    const selectedMode = mode || "signin";
    setAuthMode(selectedMode);
    setView("auth");
    navigateToHash(selectedMode);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("claimsense_user", JSON.stringify(user));
    } catch (e) {}
    setView("app");
    setActiveTab("dashboard");
    navigateToHash("dashboard");
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem("claimsense_user");
    } catch (e) {}
    setCurrentUser(defaultUser);
    setView("landing");
    navigateToHash("landing");
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    navigateToHash(tab);
  };

  if (view === "landing") {
    return <LandingPage onEnter={handleOpenAuth} />;
  }

  if (view === "auth") {
    return (
      <AuthPage
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
        onBackToHome={() => {
          setView("landing");
          navigateToHash("landing");
        }}
      />
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar active={activeTab} onChange={handleTabChange} collapsed={sidebarCollapsed} user={currentUser} />
      </div>

      {/* Mobile drawer */}
      <MobileSidebarDrawer
        active={activeTab}
        onChange={handleTabChange}
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        user={currentUser}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={tabTitles[activeTab]}
          user={currentUser}
          onToggle={() => { setSidebarCollapsed((p) => !p); setMobileDrawerOpen((p) => !p); }}
          onSignOut={handleSignOut}
          onNavigate={handleTabChange}
        />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 ${activeTab === "copilot" ? "flex flex-col" : ""}`}>
          <div className={`max-w-6xl mx-auto w-full ${activeTab === "copilot" ? "flex flex-col flex-1 h-full" : ""}`}>
            <AnimatePresence mode="wait">
              <PageWrapper tabKey={activeTab}>
                {activeTab === "dashboard" && <Dashboard onNavigate={handleTabChange} user={currentUser} />}
                {activeTab === "claims" && <ClaimsView onNavigate={handleTabChange} />}
                {activeTab === "auditor" && <BillAuditor onNavigate={handleTabChange} />}
                {activeTab === "ocr" && <OCREngine onNavigate={handleTabChange} />}
                {activeTab === "copilot" && <AICopilot />}
                {activeTab === "sla" && <SLATracker />}
                {activeTab === "reports" && <Reports />}
                {activeTab === "policies" && <Policies />}
                {activeTab === "settings" && <SettingsView user={currentUser} />}
              </PageWrapper>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav active={activeTab} onChange={handleTabChange} />
    </div>
  );
}

