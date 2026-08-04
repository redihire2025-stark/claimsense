import { motion } from "motion/react";
import { Download, Brain, AlertTriangle } from "lucide-react";
import { fadeUp, stagger } from "../lib/animations";
import { fmtINR, fmtShort } from "../lib/format";
import { billLineItems } from "../lib/mock-data";
import { Badge } from "../components/Badge";

export function BillAuditor() {
  const totalSavings = billLineItems.reduce((sum, i) => sum + i.saving, 0);
  const flaggedCount = billLineItems.filter((i) => i.flagged).length;
  const totalCharged = billLineItems.reduce((sum, i) => sum + i.hospitalRate * i.qty, 0);

  return (
    <div className="flex flex-col gap-5">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex items-center justify-between">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-foreground">Smart Bill Auditor</h1>
          <p className="text-sm text-muted-foreground">AI-powered line-item analysis with CGHS, GIPSA & PMJAY benchmarks</p>
        </motion.div>
        <motion.button variants={fadeUp} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 bg-card border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <Download size={14} /> Export Report
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Billed", val: fmtShort(totalCharged), cls: "bg-card border border-border", valCls: "text-foreground" },
          { label: "Potential Savings", val: fmtShort(totalSavings), cls: "bg-emerald-50 border border-emerald-100", valCls: "text-emerald-700" },
          { label: "Items Flagged", val: `${flaggedCount} / ${billLineItems.length}`, cls: "bg-amber-50 border border-amber-100", valCls: "text-amber-700" },
          { label: "AI Confidence", val: "93.4%", cls: "bg-blue-50 border border-blue-100", valCls: "text-blue-700" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -2 }} className={`rounded-xl p-4 ${card.cls}`}>
            <div className={`text-xs mb-1 ${card.valCls} opacity-70`}>{card.label}</div>
            <div className={`text-xl font-bold font-mono ${card.valCls}`}>{card.val}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>
          <Brain size={16} className="text-violet-600 mt-0.5 flex-shrink-0" />
        </motion.div>
        <div className="text-sm text-violet-800">
          <span className="font-semibold">AI Audit Complete.</span> Apollo Hospitals bill analysed against CGHS rates. {flaggedCount} items flagged with estimated savings of <span className="font-bold">{fmtShort(totalSavings)}</span>. Review and approve each flag to include in your dispute.
        </div>
      </motion.div>

      {/* Mobile card list for bill items */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="md:hidden flex flex-col gap-3">
        {billLineItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.05 }}
            className={`bg-card border rounded-xl p-4 ${item.flagged ? "border-amber-200" : "border-border"}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-semibold text-sm text-foreground leading-snug flex-1">{item.item}</div>
              {item.flagged ? <Badge status="flagged" /> : <Badge status="clear" />}
            </div>
            <div className="text-xs text-muted-foreground mb-2">{item.category} · ×{item.qty}</div>
            {item.flagged && item.issue && (
              <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5 mb-2 flex items-start gap-1.5">
                <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" />
                {item.issue}
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground">Hospital</div>
                <div className="font-mono text-sm font-semibold text-foreground">{fmtINR(item.hospitalRate)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">CGHS Rate</div>
                <div className="font-mono text-sm text-muted-foreground">{fmtINR(item.benchmarkRate)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Savings</div>
                {item.saving > 0
                  ? <div className="font-mono text-sm font-bold text-emerald-600">{fmtINR(item.saving)}</div>
                  : <div className="text-sm text-muted-foreground">—</div>}
              </div>
            </div>
          </motion.div>
        ))}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-800">Total estimated savings</span>
          <span className="text-lg font-bold text-emerald-600 font-mono">{fmtINR(billLineItems.reduce((s, i) => s + i.saving, 0))}</span>
        </div>
      </motion.div>

      {/* Desktop table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hospital Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">CGHS Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Savings</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {billLineItems.map((item, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.06 }}
                  whileHover={{ backgroundColor: item.flagged ? "rgba(245,158,11,0.04)" : "rgba(0,0,0,0.015)" }}
                  className="transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground text-sm">{item.item}</div>
                    {item.flagged && item.issue && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs text-amber-700 mt-0.5 flex items-center gap-1">
                        <AlertTriangle size={10} className="flex-shrink-0" />
                        {item.issue}
                      </motion.div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-muted-foreground text-xs">{item.category}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-sm font-medium text-foreground">{fmtINR(item.hospitalRate)}</td>
                  <td className="px-4 py-3.5 text-right hidden lg:table-cell font-mono text-sm text-muted-foreground">{fmtINR(item.benchmarkRate)}</td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell text-muted-foreground">×{item.qty}</td>
                  <td className="px-4 py-3.5 text-right">
                    {item.saving > 0 ? <span className="font-bold text-emerald-600 font-mono">{fmtINR(item.saving)}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {item.flagged ? (
                      <div className="flex items-center justify-center gap-1">
                        <Badge status="flagged" />
                        <span className="text-xs text-muted-foreground">{item.confidence}%</span>
                      </div>
                    ) : <Badge status="clear" />}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 bg-muted/30 border-t border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Total estimated savings</span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
            className="text-lg font-bold text-emerald-600 font-mono"
          >
            {fmtINR(totalSavings)}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
