// ─── Mock Data ──────────────────────────────────────────────────────────────

export const savingsData = [
  { month: "Jan", savings: 42000, claims: 18 },
  { month: "Feb", savings: 58000, claims: 24 },
  { month: "Mar", savings: 35000, claims: 15 },
  { month: "Apr", savings: 72000, claims: 31 },
  { month: "May", savings: 89000, claims: 38 },
  { month: "Jun", savings: 65000, claims: 27 },
  { month: "Jul", savings: 94000, claims: 42 },
];

export const claimStatusData = [
  { name: "Approved", value: 124, color: "#059669" },
  { name: "Pending", value: 43, color: "#D97706" },
  { name: "In Review", value: 31, color: "#1B48E8" },
  { name: "Rejected", value: 18, color: "#DC2626" },
];

export const claims = [
  { id: "CLM-2024-001", patient: "Priya Sharma", hospital: "Apollo Hospitals, Delhi", amount: 182500, status: "approved", date: "15 Jul 2024", insurer: "HDFC ERGO", savings: 24300, type: "Cardiac Surgery" },
  { id: "CLM-2024-002", patient: "Rahul Mehta", hospital: "Fortis Healthcare, Mumbai", amount: 94200, status: "pending", date: "18 Jul 2024", insurer: "Star Health", savings: 0, type: "Orthopaedic" },
  { id: "CLM-2024-003", patient: "Anita Patel", hospital: "Max Healthcare, Gurugram", amount: 267800, status: "rejected", date: "12 Jul 2024", insurer: "ICICI Lombard", savings: 0, type: "Diabetic Care" },
  { id: "CLM-2024-004", patient: "Vikram Singh", hospital: "Medanta, Gurugram", amount: 445000, status: "in_review", date: "20 Jul 2024", insurer: "Bajaj Allianz", savings: 0, type: "Cancer Treatment" },
  { id: "CLM-2024-005", patient: "Sunita Rao", hospital: "Columbia Asia, Bengaluru", amount: 128900, status: "approved", date: "10 Jul 2024", insurer: "New India Assurance", savings: 18700, type: "General Surgery" },
  { id: "CLM-2024-006", patient: "Arun Kumar", hospital: "Narayana Health, Bengaluru", amount: 312000, status: "pending", date: "22 Jul 2024", insurer: "HDFC ERGO", savings: 0, type: "Cardiac Surgery" },
  { id: "CLM-2024-007", patient: "Meena Iyer", hospital: "Christian Medical College, Vellore", amount: 156400, status: "approved", date: "08 Jul 2024", insurer: "Star Health", savings: 31200, type: "Neurology" },
];

export const billLineItems = [
  { item: "ICU Room Rent — 5 days", category: "Room Charges", hospitalRate: 12000, benchmarkRate: 8000, qty: 5, flagged: true, issue: "Exceeds policy room rent limit by ₹20,000", confidence: 96, saving: 20000 },
  { item: "Cardiology Consultation", category: "Professional Fees", hospitalRate: 3500, benchmarkRate: 2200, qty: 3, flagged: true, issue: "Per-visit fee above CGHS benchmark by ₹1,300", confidence: 91, saving: 3900 },
  { item: "Echocardiography (2D)", category: "Diagnostics", hospitalRate: 4800, benchmarkRate: 3200, qty: 1, flagged: true, issue: "Billed separately — included in OT package under GIPSA", confidence: 88, saving: 4800 },
  { item: "Streptokinase 1.5MU injection", category: "Medicines", hospitalRate: 8500, benchmarkRate: 7200, qty: 2, flagged: false, issue: null, confidence: 99, saving: 0 },
  { item: "Surgical gloves (sterile pair)", category: "Consumables", hospitalRate: 450, benchmarkRate: 180, qty: 8, flagged: true, issue: "Consumable charged 2.5× above MRP", confidence: 94, saving: 2160 },
  { item: "Anaesthesia charges", category: "Professional Fees", hospitalRate: 18000, benchmarkRate: 14000, qty: 1, flagged: false, issue: null, confidence: 97, saving: 0 },
  { item: "ICU Monitoring & Vitals", category: "Services", hospitalRate: 2500, benchmarkRate: 2500, qty: 5, flagged: false, issue: null, confidence: 99, saving: 0 },
  { item: "Wound dressing charges", category: "Services", hospitalRate: 1200, benchmarkRate: 600, qty: 4, flagged: true, issue: "Duplicate charge — subsumed in daily nursing care", confidence: 89, saving: 4800 },
];

export const slaItems = [
  { id: "CLM-2024-002", patient: "Rahul Mehta", insurer: "Star Health", submitted: "18 Jul 2024", deadline: "03 Aug 2024", daysLeft: 12, amount: 94200, status: "on_track" },
  { id: "CLM-2024-004", patient: "Vikram Singh", insurer: "Bajaj Allianz", submitted: "20 Jul 2024", deadline: "30 Jul 2024", daysLeft: 2, amount: 445000, status: "critical" },
  { id: "CLM-2024-006", patient: "Arun Kumar", insurer: "HDFC ERGO", submitted: "22 Jul 2024", deadline: "05 Aug 2024", daysLeft: 14, amount: 312000, status: "on_track" },
];

export const activityFeed = [
  { time: "2 min ago", text: "Bill Auditor flagged ₹35,660 in potential overcharges on CLM-2024-001", type: "alert" },
  { time: "14 min ago", text: "OCR completed for Max Healthcare bill — 99.2% confidence", type: "success" },
  { time: "1 hr ago", text: "Appeal letter generated for CLM-2024-003 — ready to send", type: "info" },
  { time: "3 hr ago", text: "CLM-2024-005 approved by New India Assurance — ₹1,28,900 settled", type: "success" },
  { time: "5 hr ago", text: "SLA deadline in 2 days for CLM-2024-004 — escalation recommended", type: "warning" },
  { time: "Yesterday", text: "Meena Iyer onboarded — Star Health policy verified", type: "info" },
];

export const initialMessages = [
  { role: "assistant" as const, content: "Hello! I'm your ClaimSense AI Copilot. I can explain medical bills, decode rejection letters, draft appeal letters, and guide you through the claim recovery process. How can I help you today?" },
];

export const suggestedPrompts = [
  "Why was CLM-2024-003 rejected?",
  "Draft an appeal letter for Anita Patel",
  "Explain the room rent multiplier issue",
  "What is IRDAI's 30-day mandate?",
];
