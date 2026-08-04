import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, RefreshCw, CheckCircle, FileText } from "lucide-react";
import { fadeUp } from "../lib/animations";
import { Badge } from "../components/Badge";

export function OCREngine() {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (processing) {
      const interval = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 18, 95)), 200);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [processing]);

  const handleTrigger = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); }, 2600);
  };

  const extracted = [
    { label: "Patient Name", value: "Priya Sharma", confidence: 99 },
    { label: "Hospital", value: "Apollo Hospitals, Delhi", confidence: 98 },
    { label: "Admission Date", value: "10 Jul 2024", confidence: 99 },
    { label: "Discharge Date", value: "15 Jul 2024", confidence: 99 },
    { label: "Diagnosis", value: "Acute Myocardial Infarction (I21.9)", confidence: 97 },
    { label: "Surgeon", value: "Dr. Ramesh Chandra (MS, MCh)", confidence: 94 },
    { label: "Total Bill Amount", value: "₹1,82,500", confidence: 99 },
    { label: "Insurance Policy No.", value: "HDFE-IND-2024-00234", confidence: 96 },
  ];

  return (
    <div className="flex flex-col gap-5">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-xl font-bold text-foreground">OCR Engine</h1>
        <p className="text-sm text-muted-foreground">Upload a hospital bill or insurance document for AI extraction</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleTrigger(); }}
            onClick={!processing ? handleTrigger : undefined}
          >
            <motion.div
              animate={dragOver ? { scale: 1.02, borderColor: "#1B48E8" } : {}}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragOver ? "border-primary bg-blue-50" : "border-border hover:border-primary/50 hover:bg-muted/20"} ${processing ? "pointer-events-none" : ""}`}
            >
              {processing ? (
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center"
                  >
                    <RefreshCw size={24} className="text-primary" />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Processing document…</div>
                    <div className="text-sm text-muted-foreground">AI extracting and validating all fields</div>
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
                    <div className="font-semibold text-foreground mb-1">Drag & drop your bill here</div>
                    <div className="text-sm text-muted-foreground">or click to browse · PDF, JPG, PNG, TIFF supported</div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {["Bank-grade encryption", "HIPAA compliant", "99.2% accuracy"].map((f) => (
                      <span key={f} className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> {f}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.1 }}>
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
              </motion.div>
              <div>
                <span className="font-semibold text-emerald-800 text-sm">Extraction complete</span>
                <span className="text-emerald-700 text-sm"> · Apollo_Bill_Jul2024.pdf · 99.2% confidence</span>
              </div>
              <button onClick={() => setDone(false)} className="ml-auto text-xs text-emerald-700 font-semibold hover:underline">Upload another</button>
            </motion.div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground text-sm">Extracted Fields</h2>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} className="text-xs font-semibold text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Edit fields</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Run Audit</motion.button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {extracted.map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="px-5 py-3.5 flex items-center justify-between"
                  >
                    <div className="text-sm text-muted-foreground font-medium w-48">{f.label}</div>
                    <div className="flex-1 font-semibold text-foreground text-sm">{f.value}</div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.06 + 0.3, type: "spring" }}
                      className={`text-xs font-bold ml-4 ${f.confidence >= 97 ? "text-emerald-600" : f.confidence >= 90 ? "text-amber-600" : "text-red-600"}`}
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
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-foreground text-sm">Recent Documents</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { name: "Apollo_Bill_Jul2024.pdf", size: "1.2 MB", date: "Just now", conf: "99.2%" },
            { name: "MaxHospital_Discharge_Jul2024.pdf", size: "876 KB", date: "2 days ago", conf: "97.8%" },
            { name: "StarHealth_Policy_2024.pdf", size: "2.4 MB", date: "1 week ago", conf: "98.5%" },
          ].map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.07 }}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.015)" }}
              className="px-5 py-3.5 flex items-center gap-3 transition-colors"
            >
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-blue-600" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.size} · {d.date}</div>
              </div>
              <div className="text-xs font-semibold text-emerald-600">{d.conf}</div>
              <Badge status="approved" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
