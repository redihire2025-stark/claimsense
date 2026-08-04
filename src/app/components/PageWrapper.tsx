import { motion } from "motion/react";

export function PageWrapper({ children, tabKey }: { children: React.ReactNode; tabKey: string }) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
