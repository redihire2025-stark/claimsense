import { motion, AnimatePresence } from "motion/react";
import type { AppTab } from "../types";
import { Sidebar } from "./Sidebar";

export function MobileSidebarDrawer({ active, onChange, open, onClose }: {
  active: AppTab; onChange: (t: AppTab) => void; open: boolean; onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-64 md:hidden"
          >
            <Sidebar active={active} onChange={(t) => { onChange(t); onClose(); }} collapsed={false} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
