import { motion } from "motion/react";
import { Download, TrendingUp, Activity, Clock, Brain } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { fadeUp, stagger } from "../lib/animations";
import { fmtShort } from "../lib/format";
import { chartTooltipStyle, barTooltipFormatter } from "../lib/chart-utils";
import { savingsData } from "../lib/mock-data";
import { KPICard } from "../components/KPICard";

export function Reports() {
  return (
    <div className="flex flex-col gap-5">
      <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex items-center justify-between">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Year-to-date performance · January – July 2024</p>
        </motion.div>
        <motion.div variants={fadeUp} className="flex items-center gap-2">
          {["Export PDF", "Export CSV"].map((l) => (
            <motion.button key={l} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 bg-card border border-border text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors">
              <Download size={14} /> {l}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KPICard delay={0.05} label="Total Savings YTD" value="₹4,55,000" sub="216 claims" trend={{ label: "+41% vs 2023", positive: true }} icon={TrendingUp} color="green" />
        <KPICard delay={0.1} label="Recovery Rate" value="73.8%" sub="Avg: 48%" trend={{ label: "+25.8pp above avg", positive: true }} icon={Activity} color="blue" />
        <KPICard delay={0.15} label="Avg Settlement" value="18.4 days" sub="Mandate: 30 days" icon={Clock} color="purple" />
        <KPICard delay={0.2} label="AI Accuracy" value="98.4%" sub="Human: 91.2%" icon={Brain} color="amber" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border rounded-xl p-4 md:p-5">
          <h2 className="font-bold text-foreground text-sm mb-4">Monthly Savings Recovery</h2>
          <div className="h-44 md:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={40} />
                <Tooltip formatter={barTooltipFormatter} contentStyle={chartTooltipStyle} />
                <Bar name="monthly-savings" dataKey="savings" fill="#1B48E8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="bg-card border border-border rounded-xl p-4 md:p-5">
          <h2 className="font-bold text-foreground text-sm mb-4">Claims by Insurer</h2>
          <div className="flex flex-col gap-3.5 mt-2">
            {[
              { name: "HDFC ERGO", claims: 48, savings: 112000, pct: 68 },
              { name: "Star Health", claims: 37, savings: 89000, pct: 72 },
              { name: "ICICI Lombard", claims: 29, savings: 67000, pct: 58 },
              { name: "Bajaj Allianz", claims: 22, savings: 54000, pct: 81 },
              { name: "New India Assurance", claims: 18, savings: 42000, pct: 75 },
            ].map((ins, i) => (
              <motion.div key={ins.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground">{ins.name}</span>
                  <span className="text-muted-foreground">{ins.claims} claims · {fmtShort(ins.savings)} saved</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${ins.pct}%` }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.08, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
