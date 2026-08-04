import { useState } from "react";
import { motion } from "motion/react";
import { fadeUp } from "../lib/animations";
import { Badge } from "../components/Badge";

export function SettingsView() {
  const [notifications, setNotifications] = useState({ email: true, sms: true, whatsapp: false, push: true });
  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, notifications, and preferences</p>
      </motion.div>
      {[
        <motion.div key="profile" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h2 className="font-bold text-foreground text-sm">Profile</h2></div>
          <div className="p-5 flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center cursor-pointer">
              <span className="text-white text-xl font-bold">PS</span>
            </motion.div>
            <div>
              <div className="font-bold text-foreground">Priya Sharma</div>
              <div className="text-sm text-muted-foreground">priya.sharma@email.com · +91 98765 43210</div>
              <div className="text-xs text-muted-foreground mt-0.5">Individual Plan · Member since Jan 2024</div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} className="ml-auto text-sm font-semibold border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors">Edit profile</motion.button>
          </div>
        </motion.div>,
        <motion.div key="notifs" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h2 className="font-bold text-foreground text-sm">Notifications</h2></div>
          <div className="divide-y divide-border">
            {(Object.keys(notifications) as (keyof typeof notifications)[]).map((key) => (
              <div key={key} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground text-sm capitalize">{key === "sms" ? "SMS" : key === "whatsapp" ? "WhatsApp" : key.charAt(0).toUpperCase() + key.slice(1)} notifications</div>
                  <div className="text-xs text-muted-foreground">Receive claim updates and SLA alerts</div>
                </div>
                <motion.button
                  onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifications[key] ? "bg-primary" : "bg-muted"}`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${notifications[key] ? "left-4" : "left-0.5"}`}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>,
        <motion.div key="security" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h2 className="font-bold text-foreground text-sm">Security</h2></div>
          <div className="p-5 flex flex-col gap-3">
            {[
              { label: "Two-factor authentication", desc: "Add an extra layer of security", enabled: true },
              { label: "Login alerts", desc: "Get notified of new sign-ins", enabled: true },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                <Badge status={s.enabled ? "approved" : "pending"} />
              </div>
            ))}
          </div>
        </motion.div>
      ]}
    </div>
  );
}
