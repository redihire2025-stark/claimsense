import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, CheckCircle, Clock, Menu, Sparkles, ScanText,
  Eye, FileSearch, Bot, Star, Clipboard, Target, Layers,
} from "lucide-react";
import { BrandLogo, LogoMark } from "../components/Logo";
import { fadeUp, stagger, scaleIn } from "../lib/animations";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: ScanText, title: "AI-Powered OCR", desc: "Extract structured data from hospital bills with 99.2% accuracy across Hindi, English, and regional language documents.", color: "blue" },
    { icon: FileSearch, title: "Smart Bill Auditor", desc: "Detect unbundling, duplicate charges, room rent multipliers, and inflated consumable costs in seconds.", color: "purple" },
    { icon: Target, title: "Benchmark Engine", desc: "Compare every line item against CGHS, GIPSA, PMJAY, and private hospital averages to quantify overcharging.", color: "green" },
    { icon: Bot, title: "Rejection Decoder", desc: "Translate cryptic IRDAI rejection codes into plain English with legal protection pathways and appeal recommendations.", color: "amber" },
    { icon: Clipboard, title: "Appeal Generator", desc: "Draft legally sound appeal letters citing IRDAI mandates, with multilingual support and e-signature integration.", color: "red" },
    { icon: Clock, title: "SLA Tracker", desc: "Never miss a deadline. Track the 30-day IRDAI resolution window with automated escalation triggers.", color: "blue" },
  ];

  const stats = [
    { value: "₹4.2Cr+", label: "Savings recovered" },
    { value: "98.4%", label: "Audit accuracy" },
    { value: "2,800+", label: "Claims resolved" },
    { value: "4.7×", label: "Average ROI" },
  ];

  const plans = [
    {
      name: "Individual", price: "₹499", period: "/month",
      desc: "For patients managing personal claims",
      cta: "Start free trial",
      features: ["Up to 5 active claims", "AI Bill Auditor", "Rejection Decoder", "Appeal Generator (3/mo)", "Email support"],
      highlight: false,
    },
    {
      name: "Family", price: "₹1,199", period: "/month",
      desc: "Cover your entire family's healthcare",
      cta: "Start free trial",
      features: ["Up to 20 active claims", "Up to 8 family members", "Unlimited AI Audits", "SLA Tracker", "WhatsApp alerts", "Priority support"],
      highlight: true,
    },
    {
      name: "Enterprise", price: "Custom", period: "",
      desc: "For hospitals, TPAs, and insurers",
      cta: "Contact sales",
      features: ["Unlimited claims & users", "API access", "White-label option", "Custom integrations", "Dedicated CSM", "SLA guarantee"],
      highlight: false,
    },
  ];

  const testimonials = [
    { name: "Dr. Kavitha Nair", role: "Oncologist, Chennai", text: "ClaimSense recovered ₹1.8 lakhs from a rejected cancer treatment claim my insurer refused twice. The AI found a waiting-period loophole no one else caught.", stars: 5 },
    { name: "Sanjay Bhatia", role: "CFO, Medtech Startup", text: "We process 200+ employee claims monthly. The Bill Auditor alone saves us 40+ hours of manual review. ROI was evident within the first week.", stars: 5 },
    { name: "Lakshmi Venkataraman", role: "Retired Teacher, Bengaluru", text: "My ₹2.6L hospital bill had ₹47,000 in inflated charges I had no idea about. ClaimSense flagged every one with evidence I could show my insurer.", stars: 5 },
  ];

  const colorIcons: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <motion.header
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.03 }}>
            <BrandLogo size={28} textSize="base" />
          </motion.div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {["Features", "Product", "Pricing", "Enterprise", "Resources"].map((item) => (
              <motion.a key={item} href="#" whileHover={{ color: "#0B0D17" }} className="hover:text-foreground transition-colors">{item}</motion.a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <motion.button onClick={onEnter} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5">
              Sign in
            </motion.button>
            <motion.button onClick={onEnter} whileHover={{ scale: 1.03, backgroundColor: "#1640c8" }} whileTap={{ scale: 0.97 }} className="text-sm font-semibold bg-primary text-white px-4 py-1.5 rounded-lg transition-colors shadow-lg shadow-blue-200">
              Get started free
            </motion.button>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={18} />
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-3 overflow-hidden"
            >
              {["Features", "Product", "Pricing", "Enterprise"].map((item) => (
                <a key={item} href="#" className="text-sm font-medium text-muted-foreground py-1">{item}</a>
              ))}
              <button onClick={onEnter} className="mt-2 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg">Get started free</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles size={11} />
              AI-powered claim recovery platform
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.12] tracking-tight text-foreground mb-6">
              Fight back against{" "}
              <span className="text-primary">overcharging</span>{" "}
              and unfair claim rejections
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              ClaimSense AI audits your hospital bills, decodes insurance rejections, generates legally-sound appeal letters, and tracks every deadline — so you recover what you are owed.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <motion.button onClick={onEnter} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-lg shadow-blue-200">
                Start recovering for free <ArrowRight size={15} />
              </motion.button>
              <motion.button onClick={onEnter} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-2 bg-card border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-muted transition-colors text-sm">
                <Eye size={15} /> View live demo
              </motion.button>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs text-muted-foreground mt-4">No credit card required · Free for the first 3 claims</motion.p>
          </motion.div>

          {/* Mock app preview */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-foreground rounded-2xl p-1 shadow-2xl shadow-black/25"
            >
              <div className="bg-[#0f1117] rounded-xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-2 flex items-center gap-1.5">
                    <LogoMark size={14} />
                    <span className="text-white/40 text-xs font-mono">claimsense.ai/dashboard</span>
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Savings Recovered", val: "₹94,700", color: "text-emerald-400" },
                    { label: "Active Claims", val: "7", color: "text-blue-400" },
                    { label: "Flags Detected", val: "23", color: "text-amber-400" },
                    { label: "AI Health Score", val: "84/100", color: "text-violet-400" },
                  ].map((k, i) => (
                    <motion.div
                      key={k.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-white/5 rounded-lg p-3"
                    >
                      <div className="text-white/40 text-xs mb-1">{k.label}</div>
                      <div className={`text-lg font-bold ${k.color}`}>{k.val}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mx-4 mb-4 bg-white/5 rounded-lg p-3">
                  <div className="text-white/40 text-xs mb-2">Savings this month</div>
                  <div className="flex items-end gap-1 h-12">
                    {[35, 50, 40, 65, 80, 60, 94].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${(h / 94) * 100}%`, opacity: 1 }}
                        transition={{ delay: 0.7 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                        className="flex-1 bg-blue-500/40 rounded-sm relative"
                      >
                        <div className="absolute inset-x-0 bottom-0 bg-blue-400 rounded-sm h-1/3" />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mx-4 mb-4 space-y-1.5">
                  {[
                    { id: "CLM-001", status: "Flagged", color: "text-amber-400" },
                    { id: "CLM-002", status: "Approved", color: "text-emerald-400" },
                    { id: "CLM-003", status: "In Review", color: "text-blue-400" },
                  ].map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="bg-white/5 rounded px-3 py-2 flex items-center justify-between"
                    >
                      <span className="text-white/50 text-xs font-mono">{c.id}</span>
                      <span className={`text-xs font-semibold ${c.color}`}>{c.status}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-28 h-28 bg-blue-400/15 rounded-full blur-2xl pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 w-36 h-36 bg-violet-400/15 rounded-full blur-2xl pointer-events-none"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
        variants={stagger(0.1)}
        className="py-12 border-y border-border bg-card"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger(0.06)} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Layers size={11} /> Full product suite
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Every tool you need to win your claim
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto text-base">
            From the moment you receive a bill to final settlement — ClaimSense handles the entire claim lifecycle with AI precision.
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
          variants={stagger(0.08)}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={scaleIn}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
              className="bg-card border border-border rounded-xl p-6 cursor-default"
            >
              <motion.div whileHover={{ rotate: 8, scale: 1.1 }} className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorIcons[f.color]}`}>
                <f.icon size={20} />
              </motion.div>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-foreground text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.1)} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">How ClaimSense works</motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 max-w-xl mx-auto text-base">From upload to recovery in four steps</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.12)} className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Upload your bill", desc: "Drag-drop or WhatsApp your hospital bill. We accept PDF, images, and scanned documents." },
              { step: "02", title: "AI audits every line", desc: "Our engine benchmarks each charge against CGHS, GIPSA, and PMJAY rates and flags anomalies." },
              { step: "03", title: "Review your report", desc: "See exactly what was overcharged, with evidence and confidence scores for every flag." },
              { step: "04", title: "File & recover", desc: "We generate your appeal, track the SLA, and escalate automatically if the insurer delays." },
            ].map((s) => (
              <motion.div key={s.step} variants={fadeUp}>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-5xl font-black text-white/10 mb-3 font-mono"
                >
                  {s.step}
                </motion.div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.08)} className="text-center mb-16">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-4">Simple, transparent pricing</motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground max-w-md mx-auto text-base">Cancel anytime. No hidden fees. Pays for itself with the first recovered claim.</motion.p>
        </motion.div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.1)} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={scaleIn}
              whileHover={{ y: -6, boxShadow: plan.highlight ? "0 20px 60px rgba(27,72,232,0.25)" : "0 16px 40px rgba(0,0,0,0.1)" }}
              className={`rounded-2xl p-7 flex flex-col gap-5 ${plan.highlight ? "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background" : "bg-card border border-border"}`}
            >
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${plan.highlight ? "text-blue-200" : "text-muted-foreground"}`}>{plan.name}</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-blue-200" : "text-muted-foreground"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm ${plan.highlight ? "text-blue-100" : "text-muted-foreground"}`}>{plan.desc}</p>
              </div>
              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className={plan.highlight ? "text-blue-200 flex-shrink-0" : "text-emerald-500 flex-shrink-0"} />
                    <span className={plan.highlight ? "text-blue-50" : "text-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                onClick={onEnter}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className={`mt-auto w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? "bg-white text-primary hover:bg-blue-50" : "bg-primary text-white hover:bg-blue-700"}`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.08)} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-foreground tracking-tight mb-3">Trusted by patients and providers</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.1)} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }} className="bg-card rounded-xl p-6 border border-border cursor-default">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-primary text-white overflow-hidden relative">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-violet-300 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger(0.1)} className="max-w-2xl mx-auto text-center relative z-10">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Start recovering what you are owed</motion.h2>
          <motion.p variants={fadeUp} className="text-blue-100 mb-8 text-base">Upload your first bill in under 60 seconds. No technical knowledge required.</motion.p>
          <motion.button
            variants={fadeUp}
            onClick={onEnter}
            whileHover={{ scale: 1.04, y: -2, boxShadow: "0 16px 40px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl text-sm shadow-xl"
          >
            Get started for free <ArrowRight size={15} />
          </motion.button>
          <motion.p variants={fadeUp} className="text-blue-200 text-xs mt-4">Free for the first 3 claims · Cancel anytime</motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <BrandLogo size={24} textSize="sm" dark />
          <div className="flex flex-wrap justify-center gap-5 text-xs">
            {["Privacy Policy", "Terms of Service", "Security", "IRDAI Compliance", "Contact"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <div className="text-xs">© 2024 ClaimSense AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
