import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, FileText, Shield, Clock, BarChart3,
  ScanText, Bot, FileSearch, Settings,
} from "lucide-react";
import type { AppTab } from "../types";
import { LogoMark, LogoText } from "./Logo";

const navItems: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "claims", label: "Claims", icon: FileText },
  { id: "auditor", label: "Bill Auditor", icon: FileSearch },
  { id: "ocr", label: "OCR Engine", icon: ScanText },
  { id: "copilot", label: "AI Copilot", icon: Bot },
  { id: "sla", label: "SLA Tracker", icon: Clock },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "policies", label: "Policies", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Sidebar({ active, onChange, collapsed, user }: {
  active: AppTab;
  onChange: (t: AppTab) => void;
  collapsed: boolean;
  user?: UserProfile | null;
}) {
  const userName = user?.name || "Suvarna Raju";
  const userPlan = user?.plan || "Family Pro";

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 224 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full bg-[#0B0D17] border-r border-white/5 overflow-hidden flex-shrink-0"
    >
      <div className={`h-14 flex items-center border-b border-white/5 ${collapsed ? "justify-center px-2" : "px-4"}`}>
        <motion.div whileHover={{ scale: 1.05 }} onClick={() => onChange("dashboard")} className="flex items-center gap-2.5 overflow-hidden cursor-pointer">
          <LogoMark size={collapsed ? 26 : 28} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -8, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <LogoText size="sm" dark />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 + 0.1 }}
              onClick={() => onChange(item.id)}
              title={collapsed ? item.label : undefined}
              whileHover={{ backgroundColor: isActive ? undefined : "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.97 }}
              className={`w-[calc(100%-12px)] mx-1.5 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium mb-0.5 ${
                isActive ? "bg-white/10 text-white" : "text-white/45 hover:text-white/75"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.id === "copilot" && (
                <motion.span
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="ml-auto bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                >
                  AI
                </motion.span>
              )}
              {isActive && (
                <motion.div layoutId="activeIndicator" className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full" />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className={`border-t border-white/5 p-3 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
        {user?.avatar ? (
          <img src={user.avatar} alt={userName} className="w-7 h-7 rounded-full object-cover border border-blue-400/40 flex-shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{getInitials(userName)}</span>
          </div>
        )}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{userName}</div>
              <div className="text-white/40 text-xs truncate">{userPlan}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
