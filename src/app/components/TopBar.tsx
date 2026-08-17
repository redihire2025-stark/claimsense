import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Bell, LogOut, ChevronRight, User, ShieldCheck, Settings } from "lucide-react";
import { BrandLogo, LogoMark } from "./Logo";
import type { AppTab, UserProfile } from "../types";

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TopBar({ title, user, onToggle, onSignOut, onNavigate }: {
  title: string;
  user?: UserProfile | null;
  onToggle: () => void;
  onSignOut: () => void;
  onNavigate?: (tab: AppTab) => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const userName = user?.name || "Suvarna Raju";
  const userEmail = user?.email || "suvarnaraju494@gmail.com";
  const userPlan = user?.plan || "Family Pro";
  const avatarUrl = user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0 relative z-30"
    >
      <motion.button onClick={onToggle} whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.05)" }} whileTap={{ scale: 0.92 }} className="p-1.5 rounded-md transition-colors text-muted-foreground">
        <Menu size={16} />
      </motion.button>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate?.("dashboard")}>
        {/* Mobile: logo mark only; desktop: full brand + breadcrumb */}
        <span className="md:hidden"><LogoMark size={26} /></span>
        <span className="hidden md:flex items-center gap-2">
          <BrandLogo size={22} textSize="sm" />
          <ChevronRight size={13} className="text-muted-foreground" />
          <motion.span key={title} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-semibold text-foreground text-sm capitalize">
            {title}
          </motion.span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="relative p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground">
          <Bell size={16} />
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"
          />
        </motion.button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setProfileOpen(!profileOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 text-xs font-medium border border-border px-2.5 py-1 rounded-full hover:bg-muted/80 transition-colors"
          >
            {!imgError && avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-6 h-6 rounded-full object-cover border border-primary/40 shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">
                {getInitials(userName)}
              </div>
            )}
            <span className="hidden sm:inline font-semibold text-foreground">{userName}</span>
            <span className="hidden md:inline bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              {userPlan}
            </span>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl p-2 z-50 text-xs space-y-1"
              >
                <div className="px-3 py-2 border-b border-border">
                  <p className="font-bold text-foreground text-sm truncate">{userName}</p>
                  {userEmail && <p className="text-muted-foreground text-[11px] truncate">{userEmail}</p>}
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                    <ShieldCheck size={12} /> Verified Account
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => { setProfileOpen(false); onNavigate?.("policies"); }}
                    className="w-full text-left px-3 py-1.5 text-muted-foreground flex items-center gap-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <User size={14} /> Profile & Policy Docs
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); onNavigate?.("settings"); }}
                    className="w-full text-left px-3 py-1.5 text-muted-foreground flex items-center gap-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Settings size={14} /> Preferences
                  </button>
                </div>

                <div className="pt-1 border-t border-border">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-md font-semibold transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

