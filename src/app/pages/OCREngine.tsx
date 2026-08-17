import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, RefreshCw, CheckCircle, FileText, Sparkles, Edit3, Save, Play, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { fadeUp } from "../lib/animations";
import { Badge } from "../components/Badge";
import { parseDocumentWithOcrSpace, type ExtractedField, type OcrResult } from "../lib/ocr";
import type { AppTab } from "../types";

const recentDocumentsData: Record<string, OcrResult> = {
  "Apollo_Bill_Jul2024.pdf": {
    fileName: "Apollo_Bill_Jul2024.pdf",
    fileSize: "1.2 MB",
    confidence: 99.2,
    rawText: "Apollo Hospitals Delhi Inpatient Bill Patient: Suvarna Raju Total: Rs 2,72,500",
    fields: [
      { label: "Patient Name", value: "Suvarna Raju", confidence: 99.8 },
      { label: "Hospital", value: "Apollo Hospitals, Delhi", confidence: 99.5 },
      { label: "Total Billed Amount", value: "₹2,72,500", confidence: 99.2 },
      { label: "Invoice Date", value: "18 Jul 2024", confidence: 98.6 },
      { label: "Admission Date", value: "12 Jul 2024", confidence: 97.9 },
      { label: "Discharge Date", value: "18 Jul 2024", confidence: 98.1 },
      { label: "Policy / Claim ID", value: "CLM-994821", confidence: 99.0 },
    ],
  },
  "MaxHospital_Discharge_Jul2024.pdf": {
    fileName: "MaxHospital_Discharge_Jul2024.pdf",
    fileSize: "876 KB",
    confidence: 97.8,
    rawText: "Max Super Speciality Hospital Saket Discharge Summary Patient: Suvarna Raju Total: Rs 1,45,800",
    fields: [
      { label: "Patient Name", value: "Suvarna Raju", confidence: 99.2 },
      { label: "Hospital", value: "Max Super Speciality Hospital, Saket", confidence: 98.7 },
      { label: "Total Billed Amount", value: "₹1,45,800", confidence: 97.8 },
      { label: "Invoice Date", value: "10 Jul 2024", confidence: 96.5 },
      { label: "Admission Date", value: "05 Jul 2024", confidence: 97.0 },
      { label: "Discharge Date", value: "10 Jul 2024", confidence: 98.2 },
      { label: "Policy / Claim ID", value: "CLM-883204", confidence: 98.9 },
    ],
  },
  "StarHealth_Policy_2024.pdf": {
    fileName: "StarHealth_Policy_2024.pdf",
    fileSize: "2.4 MB",
    confidence: 98.5,
    rawText: "Star Health & Allied Insurance Policy Schedule Insured: Suvarna Raju Sum Insured: Rs 1,00,00,000",
    fields: [
      { label: "Insured Name", value: "Suvarna Raju", confidence: 99.5 },
      { label: "Insurance Provider", value: "Star Health & Allied Insurance", confidence: 99.1 },
      { label: "Sum Insured", value: "₹1,00,00,000", confidence: 98.5 },
      { label: "Policy Type", value: "Family Optima Plan", confidence: 99.0 },
      { label: "Policy Number", value: "SH-992019482", confidence: 98.8 },
      { label: "Expiry Date", value: "31 Dec 2025", confidence: 97.9 },
    ],
  },
};

import { generateAuditFromFields, setActiveAuditReport } from "../lib/claimsStorage";

export function OCREngine({ onNavigate }: { onNavigate?: (t: AppTab) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeResult, setActiveResult] = useState<OcrResult | null>(null);
  const [editableFields, setEditableFields] = useState<ExtractedField[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [recentDocsList, setRecentDocsList] = useState([
    { name: "Apollo_Bill_Jul2024.pdf", size: "1.2 MB", date: "Just now", conf: "99.2%" },
    { name: "MaxHospital_Discharge_Jul2024.pdf", size: "876 KB", date: "2 days ago", conf: "97.8%" },
    { name: "StarHealth_Policy_2024.pdf", size: "2.4 MB", date: "1 week ago", conf: "98.5%" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (processing) {
      const interval = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 18, 95)), 180);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [processing]);

  const processFile = async (file: File) => {
    setProcessing(true);
    setProgress(20);
    const result = await parseDocumentWithOcrSpace(file);
    setProgress(100);

    // Save result to lookup map
    recentDocumentsData[file.name] = result;

    const formattedSize = file.size > 0 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "1.1 MB";
    const newDocItem = {
      name: file.name,
      size: formattedSize,
      date: "Just now",
      conf: `${result.confidence}%`
    };

    setRecentDocsList(prev => [newDocItem, ...prev.filter(d => d.name !== file.name)]);

    setTimeout(() => {
      setActiveResult(result);
      setEditableFields(result.fields);
      setIsEditing(false);
      setProcessing(false);
    }, 400);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleResetUpload = () => {
    setActiveResult(null);
    setEditableFields([]);
    setIsEditing(false);
    setProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenRecentDocument = (docName: string) => {
    const docData = recentDocumentsData[docName];
    if (docData) {
      toast.info(`Opening ${docName} report...`);
      setActiveResult(docData);
      setEditableFields(docData.fields);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.info(`Opening ${docName} report...`);
      // Fallback default result if lookup missing
      const fallbackResult: OcrResult = {
        fileName: docName,
        fileSize: "1.1 MB",
        confidence: 99.2,
        rawText: `Extracted text from ${docName}`,
        fields: [
          { label: "Patient Name", value: "Suvarna Raju", confidence: 99.5 },
          { label: "Hospital Name", value: "Apollo Hospitals, Delhi", confidence: 99.1 },
          { label: "Total Billed Amount", value: "₹1,30,000", confidence: 98.9 },
          { label: "Invoice Date", value: "12 Aug 2024", confidence: 98.2 },
          { label: "Claim ID", value: "CLM-109283", confidence: 99.4 },
        ]
      };
      setActiveResult(fallbackResult);
      setEditableFields(fallbackResult.fields);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFieldChange = (index: number, newValue: string) => {
    setEditableFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: newValue };
      return updated;
    });
  };

  const handleSaveFields = () => {
    setIsEditing(false);
    toast.success("Extracted fields updated & saved!");
  };

  const handleRunAudit = () => {
    if (activeResult) {
      const report = generateAuditFromFields(activeResult.fileName, editableFields);
      setActiveAuditReport(report);
      toast.success(`Generated AI Bill Audit for ${activeResult.fileName}!`);
    } else {
      toast.success("Running AI Bill Audit against CGHS & GIPSA benchmarks...");
    }
    setTimeout(() => {
      onNavigate?.("auditor");
    }, 400);
  };

  return (
    <div className="flex flex-col gap-5">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*,.pdf"
        className="hidden"
      />

      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          OCR Engine <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">OCR.space API Active</span>
        </h1>
        <p className="text-sm text-muted-foreground">Upload a hospital bill or insurance document for AI extraction</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!activeResult ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
          >
            <motion.div
              onClick={!processing ? () => fileInputRef.current?.click() : undefined}
              animate={dragOver ? { scale: 1.02, borderColor: "#1B48E8" } : {}}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragOver ? "border-primary bg-blue-50" : "border-border hover:border-primary/50 hover:bg-muted/20"} ${processing ? "pointer-events-none opacity-80" : ""}`}
            >
              {processing ? (
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center"
                  >
                    <RefreshCw size={24} className="text-primary" />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">OCR.space API Scanning File…</div>
                    <div className="text-sm text-muted-foreground">Extracting text & medical fields from document</div>
                  </div>
                  <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{Math.round(progress)}% complete</div>
                </div>
              ) : (
                <motion.div className="flex flex-col items-center gap-4" whileHover={{ scale: 1.02 }}>
                  <motion.div whileHover={{ y: -4 }} className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                    <Upload size={24} className="text-muted-foreground" />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Drag & drop your hospital bill here</div>
                    <div className="text-sm text-muted-foreground">or click to browse · PDF, JPG, PNG, TIFF supported</div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {["OCR.space Powered", "HIPAA compliant", "99.2% accuracy"].map((f) => (
                      <span key={f} className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> {f}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.1 }}>
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
              </motion.div>
              <div>
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">OCR.space Extraction Complete</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-sm"> · {activeResult.fileName} ({activeResult.fileSize})</span>
              </div>
              <button onClick={handleResetUpload} className="ml-auto text-xs text-emerald-700 dark:text-emerald-300 font-semibold hover:underline bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-md transition-colors">
                Upload Another Document
              </button>
            </motion.div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground text-sm">Extracted Fields ({activeResult.fileName})</h2>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <motion.button
                      onClick={handleSaveFields}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Save size={13} /> Save Fields
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5"
                    >
                      <Edit3 size={13} /> Edit fields
                    </motion.button>
                  )}

                  <motion.button
                    onClick={handleRunAudit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-xs font-semibold bg-primary text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                  >
                    <Play size={13} className="fill-current" /> Run Audit
                  </motion.button>
                </div>
              </div>

              <div className="divide-y divide-border">
                {editableFields.map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="px-5 py-3 flex items-center justify-between gap-4"
                  >
                    <div className="text-sm text-muted-foreground font-medium w-48 shrink-0">{f.label}</div>
                    <div className="flex-1 font-semibold text-foreground text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={f.value}
                          onChange={(e) => handleFieldChange(i, e.target.value)}
                          className="w-full bg-slate-900 border border-blue-500/60 rounded-lg px-3 py-1.5 text-sm text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      ) : (
                        <span>{f.value}</span>
                      )}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.04 + 0.2, type: "spring" }}
                      className={`text-xs font-bold shrink-0 ${f.confidence >= 97 ? "text-emerald-600" : f.confidence >= 90 ? "text-amber-600" : "text-red-600"}`}
                    >
                      {f.confidence}%
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground text-sm">Recent Documents</h2>
          <span className="text-xs text-muted-foreground">Click any document to view its report</span>
        </div>
        <div className="divide-y divide-border">
          {recentDocsList.map((d, i) => (
            <motion.div
              key={d.name}
              onClick={() => handleOpenRecentDocument(d.name)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.07 }}
              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.06)", scale: 1.002 }}
              whileTap={{ scale: 0.998 }}
              className="px-5 py-3.5 flex items-center gap-3 transition-all cursor-pointer group"
            >
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-blue-600 dark:text-blue-400" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.size} · {d.date}</div>
              </div>
              <div className="text-xs font-semibold text-emerald-600">{d.conf}</div>
              <Badge status="approved" />
              <button className="text-xs text-primary font-semibold group-hover:translate-x-0.5 transition-transform hidden sm:block">
                View Report →
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
