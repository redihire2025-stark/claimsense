import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, FileDown, Brain, AlertTriangle, BookOpen, Lightbulb, ShieldCheck, ChevronDown, ChevronUp, FileText, CheckCircle2, BookmarkCheck, XCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fadeUp, stagger } from "../lib/animations";
import { fmtINR, fmtShort } from "../lib/format";
import { billLineItems } from "../lib/mock-data";
import { getLatestAuditReport, addClaimToStorage } from "../lib/claimsStorage";
import { Badge } from "../components/Badge";
import type { AppTab } from "../types";

export function BillAuditor({ onNavigate }: { onNavigate?: (t: AppTab) => void }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  const activeAudit = getLatestAuditReport();
  const currentLineItems = activeAudit.lineItems || billLineItems;
  const totalSavings = activeAudit.totalSavings || currentLineItems.reduce((sum, i) => sum + i.saving, 0);
  const flaggedCount = activeAudit.flaggedCount || currentLineItems.filter((i) => i.flagged).length;
  const totalCharged = activeAudit.totalCharged || currentLineItems.reduce((sum, i) => sum + i.hospitalRate * i.qty, 0);

  const handleExportCSV = () => {
    const headers = ["Item", "Category", "Hospital Rate (INR)", "CGHS Benchmark Rate (INR)", "Quantity", "Estimated Savings (INR)", "Flagged Issue"];
    const rows = currentLineItems.map(item => [
      `"${item.item.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.hospitalRate,
      item.benchmarkRate,
      item.qty,
      item.saving,
      `"${(item.issue || "Clear").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ClaimSense_Audit_${activeAudit.docName.replace(/\.pdf$/i, "")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Bill Audit Report downloaded (CSV)!");
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("ClaimSense AI - Hospital Bill Audit Report", 14, 18);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 160, 18);

      // Metadata Section
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Document: ${activeAudit.docName}`, 14, 42);
      doc.text(`Patient Name: ${activeAudit.patientName}`, 14, 48);
      doc.text(`Hospital: ${activeAudit.hospitalName}`, 14, 54);

      doc.setFont("helvetica", "bold");
      doc.text(`Total Billed: Rs. ${totalCharged.toLocaleString("en-IN")}`, 130, 42);
      doc.setTextColor(16, 185, 129);
      doc.text(`Potential Savings: Rs. ${totalSavings.toLocaleString("en-IN")}`, 130, 48);
      doc.setTextColor(217, 119, 6);
      doc.text(`Flagged Overcharges: ${flaggedCount} items`, 130, 54);

      // Line Items Table
      const tableHead = [["Item Description", "Category", "Hospital Rate", "CGHS Rate", "Qty", "Savings", "Status"]];
      const tableRows = currentLineItems.map((item) => [
        item.item,
        item.category,
        `Rs. ${item.hospitalRate.toLocaleString("en-IN")}`,
        `Rs. ${item.benchmarkRate.toLocaleString("en-IN")}`,
        item.qty.toString(),
        item.saving > 0 ? `Rs. ${item.saving.toLocaleString("en-IN")}` : "-",
        item.flagged ? "Flagged" : "Clear",
      ]);

      autoTable(doc, {
        startY: 62,
        head: tableHead,
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 25 },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "center" },
          5: { halign: "right", fontStyle: "bold" },
          6: { halign: "center" },
        },
      });

      // Footer IRDAI guidance
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 200;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text("IRDAI Compliance Notice: Present this verified line-item audit summary to your hospital billing desk or insurer TPA.", 14, finalY);

      doc.save(`ClaimSense_Audit_${activeAudit.docName.replace(/\.pdf$/i, "")}.pdf`);
      toast.success("Bill Audit Report downloaded (PDF)!");
    } catch (e) {
      console.error("Failed to generate PDF", e);
      toast.error("Failed to generate PDF report.");
    }
  };

  const handleSaveAudit = () => {
    setIsSaved(true);
    addClaimToStorage({
      id: `CLM-2024-${Math.floor(100 + Math.random() * 900)}`,
      patient: activeAudit.patientName || "Suvarna Raju",
      hospital: activeAudit.hospitalName || "Apollo Hospitals, Delhi",
      amount: totalCharged,
      status: "approved",
      date: "Just now",
      insurer: "Star Health",
      savings: totalSavings,
      type: "Hospitalization Audit"
    });
    toast.success("Audit Report saved to your Recent Claims history!");
  };

  const handleCloseAudit = () => {
    toast.info("Closing audit report...");
    onNavigate?.("dashboard");
  };

  return (
    <div className="flex flex-col gap-5">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-foreground">Smart Bill Auditor</h1>
          <p className="text-sm text-muted-foreground">AI audit report for <span className="font-semibold text-primary">{activeAudit.docName}</span> ({activeAudit.patientName} · {activeAudit.hospitalName})</p>
        </motion.div>
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            onClick={() => setShowDisputeModal(true)}
            variants={fadeUp}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 bg-violet-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
          >
            <FileText size={14} /> Dispute Letter
          </motion.button>

          <motion.button
            onClick={handleExportPDF}
            variants={fadeUp}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FileDown size={14} /> Download PDF
          </motion.button>

          <motion.button
            onClick={handleExportCSV}
            variants={fadeUp}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={14} /> Export CSV
          </motion.button>

          <motion.button
            onClick={handleSaveAudit}
            variants={fadeUp}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors border shadow-sm ${
              isSaved
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            <BookmarkCheck size={14} className={isSaved ? "text-emerald-600 dark:text-emerald-400" : ""} />
            {isSaved ? "Audit Saved ✓" : "Save Audit"}
          </motion.button>

          <motion.button
            onClick={handleCloseAudit}
            variants={fadeUp}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            <XCircle size={14} /> Close
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Billed", val: fmtShort(totalCharged), cls: "bg-card border border-border", valCls: "text-foreground" },
          { label: "Potential Savings", val: fmtShort(totalSavings), cls: "bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/60", valCls: "text-emerald-700 dark:text-emerald-400" },
          { label: "Items Flagged", val: `${flaggedCount} / ${currentLineItems.length}`, cls: "bg-amber-50 border border-amber-100 dark:bg-amber-950/40 dark:border-amber-800/60", valCls: "text-amber-700 dark:text-amber-400" },
          { label: "AI Confidence", val: `${activeAudit.confidence || 94.2}%`, cls: "bg-blue-50 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-800/60", valCls: "text-blue-700 dark:text-blue-400" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -2 }} className={`rounded-xl p-4 ${card.cls}`}>
            <div className={`text-xs mb-1 ${card.valCls} opacity-70`}>{card.label}</div>
            <div className={`text-xl font-bold font-mono ${card.valCls}`}>{card.val}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 rounded-xl px-4 py-3 flex items-start gap-3">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>
          <Brain size={16} className="text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
        </motion.div>
        <div className="text-sm text-violet-800 dark:text-violet-300">
          <span className="font-semibold">AI Audit Complete for {activeAudit.docName}.</span> {activeAudit.hospitalName} bill analysed against CGHS rates. {flaggedCount} items flagged with estimated savings of <span className="font-bold">{fmtShort(totalSavings)}</span>. Review the patient explanation below before submitting your claim dispute.
        </div>
      </motion.div>

      {/* Patient Knowledge & Explanation Guide */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="bg-card border border-blue-500/40 rounded-xl overflow-hidden shadow-sm">
        <div
          onClick={() => setShowExplanation(!showExplanation)}
          className="px-5 py-3.5 bg-blue-50 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between cursor-pointer hover:bg-blue-100/60 dark:hover:bg-blue-900/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h2 className="font-bold text-foreground text-sm">Patient Guide: How to Understand & Dispute This Audit Report</h2>
              <p className="text-[11px] text-muted-foreground">Clear explanation of flagged overcharges & step-by-step resolution guide</p>
            </div>
          </div>
          <button className="text-foreground font-semibold flex items-center gap-1 text-xs">
            {showExplanation ? (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">Hide Guide <ChevronUp size={16} /></span>
            ) : (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">View Guide <ChevronDown size={16} /></span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-5 space-y-4 text-xs">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Card 1: Room Rent Overcharge */}
                <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 space-y-2">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    1. Room Rent Overcharge ({activeAudit.hospitalName.includes("Sunrise") ? "₹4,500 Saved" : "Room Cap Violation"})
                  </div>
                  <p className="text-amber-950 dark:text-slate-200 text-[11px] leading-relaxed font-normal">
                    {activeAudit.hospitalName.includes("Sunrise") ? (
                      <>Private Room charged at <strong>₹4,500/day</strong> vs CGHS ceiling of <strong>₹3,000/day</strong> for 3 days. Dispute the ₹1,500/day room rent overcharge to prevent proportionate fee deductions.</>
                    ) : (
                      <>Hospitals often charge room rent higher than policy caps. This triggers <strong>proportionate deductions</strong> across doctor fees & ICU rates.</>
                    )}
                  </p>
                </div>

                {/* Card 2: Prohibited Fees / Unbundled Consumables */}
                <div className="p-4 rounded-xl bg-blue-50/90 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700/60 space-y-2">
                  <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                    <Lightbulb size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    2. {activeAudit.hospitalName.includes("Sunrise") ? "Banned Admin & Discharge Fees (₹950 Saved)" : "Unbundled Consumables"}
                  </div>
                  <p className="text-blue-950 dark:text-slate-200 text-[11px] leading-relaxed font-normal">
                    {activeAudit.hospitalName.includes("Sunrise") ? (
                      <>Registration (<strong>₹500</strong>) and Discharge Processing (<strong>₹450</strong>) are explicitly prohibited under IRDAI circulars. Hospitals cannot charge for admission/discharge admin fees.</>
                    ) : (
                      <>Items like gloves, syringes, & surgical masks are legally included in package rates under GIPSA guidelines. Hospitals cannot charge for them separately.</>
                    )}
                  </p>
                </div>

                {/* Card 3: Unbundled Consumables & Legal Rights */}
                <div className="p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 space-y-2">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                    <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    3. {activeAudit.hospitalName.includes("Sunrise") ? "Unbundled Syringes & Gloves (₹916 Saved)" : "Your IRDAI Legal Rights"}
                  </div>
                  <p className="text-emerald-950 dark:text-slate-200 text-[11px] leading-relaxed font-normal">
                    {activeAudit.hospitalName.includes("Sunrise") ? (
                      <>Syringes (<strong>₹216</strong>), Surgical Gloves (<strong>₹250</strong>), and Gauze (<strong>₹450</strong>) were unbundled separately despite GIPSA package rate rules.</>
                    ) : (
                      <>Under IRDAI regulations, hospitals must provide itemized tariffs, and insurance companies cannot reject claims without written itemized justification.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Plan Banner */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-foreground bg-muted/40 p-3 rounded-lg w-full">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-[12px] font-medium">
                    <strong className="text-foreground font-bold">Action Plan:</strong> Click <strong className="text-primary font-bold">Export Report</strong> at top right → Download the CSV spreadsheet → Present it to the Hospital Billing Desk before paying final settlement.
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile card list for bill items */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="md:hidden flex flex-col gap-3">
        {currentLineItems.map((item, idx) => (
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
          <span className="text-lg font-bold text-emerald-600 font-mono">{fmtINR(totalSavings)}</span>
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
              {currentLineItems.map((item, idx) => (
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

      {/* IRDAI Dispute Letter Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-4 max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-violet-600 dark:text-violet-400" size={20} />
                  <h2 className="text-base font-bold text-foreground">Official IRDAI Dispute Letter</h2>
                </div>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="bg-muted/40 border border-border rounded-xl p-4 overflow-y-auto font-mono text-xs text-foreground space-y-3 leading-relaxed max-h-[50vh]">
                <p className="font-bold text-primary">FORMAL NOTICE OF DISPUTE: MEDICAL BILL OVERCHARGES</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</p>
                <p><strong>To:</strong> The Billing Manager / TPA Desk</p>
                <p><strong>Hospital:</strong> {activeAudit.hospitalName}</p>
                <p><strong>Patient:</strong> {activeAudit.patientName}</p>
                <p><strong>Document:</strong> {activeAudit.docName}</p>
                <hr className="border-border" />
                <p><strong>SUBJECT:</strong> Formal Dispute of Unauthorized Tariff Charges & Request for Refund</p>
                <p>Dear Sir/Madam,</p>
                <p>I am writing to formally dispute unauthorized line-item overcharges identified in hospital bill (<strong>{activeAudit.docName}</strong>) totaling <strong>₹{totalCharged.toLocaleString("en-IN")}</strong>.</p>
                <p>Following audit verification against official CGHS tariff schedules, GIPSA PPN package guidelines, and IRDAI Circular Ref: IRDAI/HLT/CIR/PRO/095/05/2020, we have flagged <strong>₹{totalSavings.toLocaleString("en-IN")}</strong> in non-compliant charges across {flaggedCount} items:</p>
                <div className="pl-3 border-l-2 border-amber-500 space-y-1 py-1">
                  {currentLineItems.filter(i => i.flagged).map((item, idx) => (
                    <div key={idx} className="text-[11px]">
                      <strong>{idx + 1}. {item.item}</strong> — Billed ₹{item.hospitalRate.toLocaleString("en-IN")} vs Benchmark ₹{item.benchmarkRate.toLocaleString("en-IN")} (Disputed: <span className="text-amber-600 font-bold">₹{item.saving.toLocaleString("en-IN")}</span>)
                    </div>
                  ))}
                </div>
                <p><strong>REQUIRED ACTION:</strong></p>
                <p>1. Re-issue an updated final settlement invoice waiving ₹{totalSavings.toLocaleString("en-IN")} in flagged overcharges.</p>
                <p>2. Provide written itemized justification for any non-waived tariffs as required under IRDAI Policyholder Protection Rules.</p>
                <p>Sincerely,<br /><strong>{activeAudit.patientName}</strong> / Authorized Representative<br />Email: suvarnaraju494@gmail.com</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => {
                    const text = `FORMAL NOTICE OF DISPUTE: MEDICAL BILL OVERCHARGES\nDate: ${new Date().toLocaleDateString("en-IN")}\nTo: Billing Manager / TPA Desk\nHospital: ${activeAudit.hospitalName}\nPatient: ${activeAudit.patientName}\nDocument: ${activeAudit.docName}\n\nDisputed Amount: Rs. ${totalSavings.toLocaleString("en-IN")} across ${flaggedCount} items.\n\nPlease re-issue an updated final invoice waiving flagged overcharges per IRDAI & CGHS tariff guidelines.`;
                    navigator.clipboard.writeText(text);
                    setCopiedLetter(true);
                    toast.success("Dispute letter copied to clipboard!");
                    setTimeout(() => setCopiedLetter(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors"
                >
                  {copiedLetter ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedLetter ? "Copied ✓" : "Copy Text"}
                </button>
                <button
                  onClick={() => {
                    handleExportPDF();
                    setShowDisputeModal(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <FileDown size={14} /> Download PDF Notice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
