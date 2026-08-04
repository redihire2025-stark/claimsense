import { motion } from "motion/react";
import { Plus, CheckCircle, ChevronRight } from "lucide-react";
import { fadeUp, stagger } from "../lib/animations";
import { Badge } from "../components/Badge";

export function Policies() {
  return (
    <div className="flex flex-col gap-5">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex items-center justify-between">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-foreground">Policy Management</h1>
          <p className="text-sm text-muted-foreground">Manage your insurance policies and coverage details</p>
        </motion.div>
        <motion.button variants={fadeUp} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add Policy
        </motion.button>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: "HDFC ERGO Optima Restore", type: "Individual Health", premium: "₹18,400/yr", sumInsured: "₹10,00,000", expires: "31 Dec 2024", features: ["No room rent limit", "Day care: 586 procedures", "Restore benefit: ₹10L", "2yr waiting: PED"] },
          { name: "Star Health Comprehensive", type: "Family Floater", premium: "₹32,800/yr", sumInsured: "₹25,00,000", expires: "15 Mar 2025", features: ["3 adults + 2 children", "Maternity: ₹50,000", "OPD: ₹15,000/yr", "4yr waiting: PED"] },
        ].map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.12, duration: 0.4 }}
            whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-bold text-foreground">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.type}</div>
              </div>
              <Badge status="approved" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[{ label: "Sum Insured", value: p.sumInsured }, { label: "Annual Premium", value: p.premium }].map((r) => (
                <div key={r.label} className="bg-muted/40 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="font-bold text-foreground">{r.value}</div>
                </div>
              ))}
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {p.features.map((f) => (
                <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                  <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Expires: {p.expires}</span>
              <motion.button whileHover={{ x: 2 }} className="text-primary font-semibold hover:underline flex items-center gap-0.5">View details <ChevronRight size={11} /></motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
