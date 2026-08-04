import { useState } from "react";
import { AnimatePresence } from "motion/react";
import type { AppView, AppTab } from "./types";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { MobileNav } from "./components/MobileNav";
import { MobileSidebarDrawer } from "./components/MobileSidebarDrawer";
import { PageWrapper } from "./components/PageWrapper";
import { LandingPage } from "./pages/LandingPage";
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

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (view === "landing") return <LandingPage onEnter={() => setView("app")} />;

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar active={activeTab} onChange={setActiveTab} collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile drawer */}
      <MobileSidebarDrawer
        active={activeTab}
        onChange={setActiveTab}
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={tabTitles[activeTab]}
          onToggle={() => { setSidebarCollapsed((p) => !p); setMobileDrawerOpen((p) => !p); }}
          onSignOut={() => setView("landing")}
        />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 ${activeTab === "copilot" ? "flex flex-col" : ""}`}>
          <div className={`max-w-6xl mx-auto w-full ${activeTab === "copilot" ? "flex flex-col flex-1 h-full" : ""}`}>
            <AnimatePresence mode="wait">
              <PageWrapper tabKey={activeTab}>
                {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
                {activeTab === "claims" && <ClaimsView onNavigate={setActiveTab} />}
                {activeTab === "auditor" && <BillAuditor />}
                {activeTab === "ocr" && <OCREngine />}
                {activeTab === "copilot" && <AICopilot />}
                {activeTab === "sla" && <SLATracker />}
                {activeTab === "reports" && <Reports />}
                {activeTab === "policies" && <Policies />}
                {activeTab === "settings" && <SettingsView />}
              </PageWrapper>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
