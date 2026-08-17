import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, MoreHorizontal, FileText } from "lucide-react";
import { toast } from "sonner";
import type { AppTab } from "../types";
import { fadeUp, stagger } from "../lib/animations";
import { fmtINR, fmtShort } from "../lib/format";
import { getClaimsList, generateAuditFromFields, setActiveAuditReport, ClaimItem } from "../lib/claimsStorage";
import { Badge } from "../components/Badge";

export function ClaimsView({ onNavigate }: { onNavigate: (t: AppTab) => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const claimsList = getClaimsList();
  const filtered = claimsList.filter((c) => {
    const matchSearch = c.patient.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleClaimClick = (claim: ClaimItem) => {
    const fields = [
      { label: "Patient Name", value: claim.patient },
      { label: "Hospital Name", value: claim.hospital },
      { label: "Total Billed Amount", value: `₹${claim.amount.toLocaleString()}` },
      { label: "Claim ID", value: claim.id },
    ];
    const docName = `${claim.id}_${claim.hospital.split(" ")[0]}_Bill.pdf`;
    const report = generateAuditFromFields(docName, fields);
    setActiveAuditReport(report);
    toast.info(`Opening audit report for ${claim.id}...`);
    onNavigate("auditor");
  };

  return (
    <div className="flex flex-col gap-5">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex items-center justify-between">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-foreground">Claims</h1>
          <p className="text-sm text-muted-foreground">{claimsList.length} total claims · {claimsList.filter(c => c.savings > 0).length} with savings recovered</p>
        </motion.div>
        <motion.button variants={fadeUp} onClick={() => onNavigate("ocr")} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={14} /> New Claim
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by patient or claim ID…" className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "approved", "pending", "in_review", "rejected"].map((s) => (
            <motion.button key={s} onClick={() => setFilterStatus(s)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${filterStatus === s ? "bg-primary text-white shadow-sm shadow-blue-200" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              {s === "all" ? "All" : s === "in_review" ? "In Review" : s.charAt(0).toUpperCase() + s.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mobile card list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:hidden flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              onClick={() => handleClaimClick(c)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2.5 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">{c.patient.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">{c.patient}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.type}</div>
                  </div>
                </div>
                <Badge status={c.status} />
              </div>
              <div className="text-xs text-muted-foreground truncate mb-3">{c.hospital}</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Billed amount</div>
                  <div className="font-bold text-foreground font-mono text-sm">{fmtINR(c.amount)}</div>
                </div>
                {c.savings > 0 ? (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Savings</div>
                    <div className="font-bold text-emerald-600 font-mono text-sm">{fmtINR(c.savings)}</div>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Insurer</div>
                    <div className="text-xs font-medium text-foreground">{c.insurer}</div>
                  </div>
                )}
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Filed</div>
                  <div className="text-xs font-medium text-foreground">{c.date}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-12 text-center bg-card rounded-xl border border-border">
            <FileText size={28} className="mx-auto text-muted-foreground mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No claims match your search</p>
          </div>
        )}
      </motion.div>

      {/* Desktop table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Claim ID", "Patient", "Type", "Insurer", "Amount", "Savings", "Status", ""].map((h, i) => (
                  <th key={i} className={`text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${i === 2 ? "hidden lg:table-cell" : ""} ${i === 3 ? "hidden lg:table-cell" : ""} ${i === 5 ? "text-right hidden lg:table-cell" : ""} ${i === 4 ? "text-right" : ""} ${i === 6 ? "text-center" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} onClick={() => handleClaimClick(c)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.04 }} whileHover={{ backgroundColor: "rgba(0,0,0,0.018)" }} className="cursor-pointer">
                    <td className="px-5 py-3.5"><span className="font-mono text-xs font-medium text-muted-foreground">{c.id}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{c.patient}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">{c.hospital}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground text-sm">{c.type}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground text-sm">{c.insurer}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-medium text-foreground">{fmtINR(c.amount)}</td>
                    <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                      {c.savings > 0 ? <span className="text-emerald-600 font-semibold font-mono">{fmtINR(c.savings)}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center"><Badge status={c.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <motion.button whileHover={{ scale: 1.1, rotate: 90 }} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors">
                        <MoreHorizontal size={14} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <FileText size={28} className="mx-auto text-muted-foreground mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No claims match your search</p>
          </div>
        )}
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {claimsList.length} claims</span>
          <div className="flex items-center gap-2">
            {["Previous", "Next"].map((l) => (
              <motion.button key={l} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors font-medium">{l}</motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
