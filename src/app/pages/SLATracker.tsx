import { motion } from "motion/react";
import { Calendar, AlertCircle, Target } from "lucide-react";
import { fadeUp, stagger } from "../lib/animations";
import { fmtINR } from "../lib/format";
import { slaItems } from "../lib/mock-data";
import { Badge } from "../components/Badge";

export function SLATracker() {
  return (
    <div className="flex flex-col gap-5">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex items-center justify-between">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-foreground">SLA Tracker</h1>
          <p className="text-sm text-muted-foreground">IRDAI mandates 30-day claim resolution · Overdue claims earn 2% monthly interest</p>
        </motion.div>
        <motion.button variants={fadeUp} whileHover={{ scale: 1.02 }} className="flex items-center gap-2 bg-card border border-border text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <Calendar size={14} /> Calendar view
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}>
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
        </motion.div>
        <div className="text-sm text-red-800">
          <span className="font-semibold">Urgent:</span> CLM-2024-004 (Vikram Singh · Bajaj Allianz) deadline expires in <strong>2 days</strong>. File escalation immediately.
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="ml-auto text-xs font-bold text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0">
          Escalate now
        </motion.button>
      </motion.div>

      <div className="flex flex-col gap-3">
        {slaItems.map((item, i) => {
          const pct = Math.max(0, Math.min(100, (item.daysLeft / 30) * 100));
          const barColor = item.status === "critical" ? "bg-red-500" : item.daysLeft <= 7 ? "bg-amber-500" : "bg-emerald-500";
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
              className={`bg-card border rounded-xl p-5 transition-shadow ${item.status === "critical" ? "border-red-200" : "border-border"}`}
            >
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.status === "critical" ? "bg-red-100" : "bg-muted"}`}>
                    <span className={`text-xs font-bold ${item.status === "critical" ? "text-red-700" : "text-muted-foreground"}`}>{item.patient.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.patient}</div>
                    <div className="text-xs text-muted-foreground">{item.id} · {item.insurer}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-foreground font-mono">{fmtINR(item.amount)}</div>
                  <Badge status={item.status} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Submitted: {item.submitted}</span>
                <motion.span
                  animate={item.status === "critical" ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className={`font-bold text-sm ${item.status === "critical" ? "text-red-600" : "text-foreground"}`}
                >
                  {item.daysLeft} days left
                </motion.span>
                <span>Deadline: {item.deadline}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {["Send reminder", "View timeline"].map((l) => (
                  <motion.button key={l} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="text-xs font-semibold border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">{l}</motion.button>
                ))}
                {item.status === "critical" && (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} animate={{ boxShadow: ["0 0 0 0 rgba(220,38,38,0)", "0 0 0 6px rgba(220,38,38,0)"] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs font-bold bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-700 transition-colors">
                    Escalate to Ombudsman
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <Target size={15} className="text-primary" /> Overdue Interest Calculator
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          {[
            { label: "Principal overdue", value: "₹4,45,000" },
            { label: "Days overdue (est.)", value: "0 days" },
            { label: "Interest @ 2%/mo", value: "₹0" },
          ].map((r, i) => (
            <motion.div key={r.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.08 }} className="bg-muted/40 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">{r.label}</div>
              <div className="font-bold text-foreground">{r.value}</div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Per IRDAI Circular 11/2023, insurers must pay 2% monthly interest on delayed settlements beyond 30 days.</p>
      </motion.div>
    </div>
  );
}
