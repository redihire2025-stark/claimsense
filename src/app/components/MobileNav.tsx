import { motion } from "motion/react";
import { LayoutDashboard, FileText, FileSearch, Bot, Clock } from "lucide-react";
import type { AppTab } from "../types";

export function MobileNav({ active, onChange }: { active: AppTab; onChange: (t: AppTab) => void }) {
  const items: { id: AppTab; icon: React.ElementType; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Home" },
    { id: "claims", icon: FileText, label: "Claims" },
    { id: "auditor", icon: FileSearch, label: "Auditor" },
    { id: "copilot", icon: Bot, label: "Copilot" },
    { id: "sla", icon: Clock, label: "SLA" },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(item.id)}
              whileTap={{ scale: 0.88 }}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              <motion.div animate={isActive ? { y: -2 } : { y: 0 }} transition={{ duration: 0.2 }}>
                <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
              </motion.div>
              <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{item.label}</span>
              {isActive && (
                <motion.div layoutId="mobileActiveTab" className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
