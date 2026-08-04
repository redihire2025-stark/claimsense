import { motion } from "motion/react";

export function Badge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    pending: { label: "Pending Review", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    rejected: { label: "Rejected", cls: "bg-red-50 text-red-700 border border-red-200" },
    in_review: { label: "In Review", cls: "bg-blue-50 text-blue-700 border border-blue-100" },
    on_track: { label: "On Track", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    critical: { label: "Critical", cls: "bg-red-50 text-red-700 border border-red-200" },
    at_risk: { label: "At Risk", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    flagged: { label: "Flagged", cls: "bg-red-50 text-red-700 border border-red-200" },
    clear: { label: "Clear", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-50 text-gray-700 border border-gray-200" };
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}
    >
      {label}
    </motion.span>
  );
}
