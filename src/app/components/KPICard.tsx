import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { fadeUp } from "../lib/animations";

export function KPICard({ label, value, sub, trend, icon: Icon, color = "blue", delay = 0 }: {
  label: string; value: string; sub?: string;
  trend?: { label: string; positive: boolean };
  icon: React.ElementType; color?: string; delay?: number;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-violet-50 text-violet-600",
  };
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(0,0,0,0.09)" }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 cursor-default"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground font-medium leading-tight">{label}</span>
        <motion.span
          whileHover={{ rotate: 8, scale: 1.1 }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}
        >
          <Icon size={17} />
        </motion.span>
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
      {trend && (
        <div className={`text-xs font-semibold flex items-center gap-1 ${trend.positive ? "text-emerald-600" : "text-red-600"}`}>
          <ArrowUpRight size={12} />
          {trend.label}
        </div>
      )}
    </motion.div>
  );
}
