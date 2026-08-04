import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, Send, Mic } from "lucide-react";
import { stagger, fadeUp } from "../lib/animations";
import { initialMessages, suggestedPrompts } from "../lib/mock-data";

export function AICopilot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const responses: Record<string, string> = {
    default: "I've analysed your question against your active claims and policy documents. Based on IRDAI Regulation 2016 (Amendment 2023) and your HDFC ERGO policy terms:\n\n**Key finding:** The situation falls under a commonly disputed category where insurers frequently misapply exclusion clauses.\n\n**Recommended action:** File a formal written complaint within 15 days citing Circular No. IRDA/HLT/REG/CIR/022/01/2020. Would you like me to draft that letter now?",
    reject: "I've reviewed claim CLM-2024-003 for Anita Patel (₹2,67,800 · Max Healthcare).\n\n**Rejection code:** Pre-existing condition exclusion — IRDAI Code 3.14(b)\n\n**Plain English:** The insurer claims Type 2 Diabetes complications existed before your policy start date. However, your policy has crossed the **2-year waiting period**, making this legally challengeable.\n\n**Recovery probability:** 78% based on similar cases.\n\n**Recommended steps:**\n1. Request the full rejection letter within 7 days\n2. Obtain HbA1c records showing diagnosis date\n3. File an appeal citing IRDAI Circular 11/2023\n\nShall I draft the appeal letter?",
    appeal: "Here is a draft appeal letter for Anita Patel's claim CLM-2024-003:\n\n---\n**To: The Grievance Officer**\nICICI Lombard General Insurance Co. Ltd.\n\n**Re: Appeal against rejection of Claim — Policy No. [Your Policy No.]**\n\nDear Sir/Madam,\n\nI formally appeal the rejection of my hospitalisation claim at Max Healthcare (Admission: 12 July 2024).\n\nThe rejection cites pre-existing condition exclusion under Clause 3.14(b). However, per IRDAI (Health Insurance) Regulations 2016 (Amendment 2023), the 24-month waiting period has been satisfied.\n\nI enclose:\n1. Original discharge summary\n2. Medical records establishing diagnosis date\n3. Premium payment receipts confirming continuous coverage\n\nI request reconsideration within 30 days as mandated by IRDAI Regulation 17(1).\n\nYours faithfully,\nAnita Patel\n\n---\n\nShall I personalise this further or convert it to PDF?",
  };

  const send = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const lower = msg.toLowerCase();
      const reply = lower.includes("reject") ? responses.reject : lower.includes("appeal") || lower.includes("draft") ? responses.appeal : responses.default;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full gap-0">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex items-center justify-between mb-4">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            AI Copilot
            <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">Beta</motion.span>
          </h1>
          <p className="text-sm text-muted-foreground">Powered by ClaimSense AI · Specialised in Indian healthcare claims</p>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 overflow-x-auto flex-shrink-0">
          <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Try:</span>
          {suggestedPrompts.map((p, i) => (
            <motion.button
              key={p}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              onClick={() => send(p)}
              whileHover={{ scale: 1.03, borderColor: "#1B48E8", color: "#1B48E8" }}
              whileTap={{ scale: 0.96 }}
              className="text-xs font-medium border border-border rounded-full px-3 py-1 bg-muted/40 hover:bg-blue-50 transition-colors flex-shrink-0"
            >
              {p}
            </motion.button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, x: m.role === "user" ? 12 : -12 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {m.role === "assistant" && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5"
                  >
                    <Bot size={15} className="text-violet-600" />
                  </motion.div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${m.role === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                  {m.content.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={15} className="text-violet-600" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-3 flex items-end gap-2">
          <div className="flex-1 min-h-[40px] max-h-32 bg-muted/50 border border-border rounded-xl px-4 py-2.5 flex items-center focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask about your claims, bills, or policies…" rows={1} className="flex-1 bg-transparent text-sm text-foreground resize-none focus:outline-none placeholder:text-muted-foreground leading-relaxed" />
          </div>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="w-9 h-9 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center flex-shrink-0">
            <Mic size={15} />
          </motion.button>
          <motion.button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            whileHover={{ scale: input.trim() ? 1.08 : 1 }}
            whileTap={{ scale: input.trim() ? 0.92 : 1 }}
            className="w-9 h-9 rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
