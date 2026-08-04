import { motion } from "motion/react";
import {
  TrendingUp, FileText, AlertCircle, Brain, Plus, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import type { AppTab } from "../types";
import { fadeUp, stagger } from "../lib/animations";
import { fmtShort } from "../lib/format";
import { chartTooltipStyle, pieTooltipFormatter } from "../lib/chart-utils";
import { savingsData, claimStatusData, claims, activityFeed } from "../lib/mock-data";
import { Badge } from "../components/Badge";
import { KPICard } from "../components/KPICard";

function SavingsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <div className="font-semibold text-foreground mb-1">{label}</div>
      <div className="text-emerald-600">Savings: {fmtShort(payload[0]?.value)}</div>
    </div>
  );
}

export function Dashboard({ onNavigate }: { onNavigate: (t: AppTab) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex items-center justify-between">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-foreground">Good morning, Priya</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your claims today</p>
        </motion.div>
        <motion.button
          variants={fadeUp}
          onClick={() => onNavigate("ocr")}
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={14} /> New Claim
        </motion.button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KPICard delay={0.05} label="Savings Recovered" value="₹94,700" sub="across 7 claims" trend={{ label: "+32% vs last month", positive: true }} icon={TrendingUp} color="green" />
        <KPICard delay={0.1} label="Active Claims" value="7" sub="4 require attention" icon={FileText} color="blue" />
        <KPICard delay={0.15} label="SLA Deadlines" value="2" sub="due in 48 hrs" trend={{ label: "Action needed", positive: false }} icon={AlertCircle} color="amber" />
        <KPICard delay={0.2} label="AI Health Score" value="84/100" sub="Good standing" icon={Brain} color="purple" />
      </div>

      {/* Charts row — stacks on mobile */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45 }}
          className="md:col-span-2 bg-card border border-border rounded-xl p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-foreground text-sm">Savings Recovery</h2>
              <p className="text-xs text-muted-foreground">Monthly · Jan–Jul 2024</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Savings
            </span>
          </div>
          {/* Explicit height wrapper — required for ResponsiveContainer on mobile */}
          <div className="h-44 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtShort(v)} width={44} />
                <Tooltip content={SavingsTooltip} />
                <Area name="savings" type="monotone" dataKey="savings" stroke="#059669" strokeWidth={2.5} fill="#059669" fillOpacity={0.12} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Claim Status Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }} className="bg-card border border-border rounded-xl p-4 md:p-5">
          <h2 className="font-bold text-foreground text-sm mb-0.5">Claim Status</h2>
          <p className="text-xs text-muted-foreground mb-3">All-time · 216 total</p>
          {/* Side-by-side on mobile: donut + legend */}
          <div className="flex items-center gap-4">
            <div className="h-36 flex-shrink-0" style={{ width: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={claimStatusData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {claimStatusData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={pieTooltipFormatter} contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {claimStatusData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-muted-foreground truncate">{d.name}</span>
                  </div>
                  <span className="font-bold text-foreground ml-2">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent claims + Activity — stack on mobile */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.45 }} className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <h2 className="font-bold text-foreground text-sm">Recent Claims</h2>
            <motion.button onClick={() => onNavigate("claims")} whileHover={{ x: 2 }} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight size={11} />
            </motion.button>
          </div>
          <div className="divide-y divide-border">
            {claims.slice(0, 4).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">{c.patient.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{c.patient}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.hospital}</div>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <div className="text-sm font-bold text-foreground font-mono">{fmtShort(c.amount)}</div>
                  {c.savings > 0 && <div className="text-xs text-emerald-600 font-semibold">-{fmtShort(c.savings)}</div>}
                </div>
                <Badge status={c.status} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.45 }} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border">
            <h2 className="font-bold text-foreground text-sm">Activity Feed</h2>
          </div>
          <div className="divide-y divide-border overflow-y-auto max-h-60">
            {activityFeed.map((a, i) => {
              const colors: Record<string, string> = { alert: "bg-amber-500", success: "bg-emerald-500", info: "bg-blue-500", warning: "bg-red-500" };
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.06 }} className="px-4 py-3 flex gap-3">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${colors[a.type]}`} />
                  <div>
                    <p className="text-xs text-foreground leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
