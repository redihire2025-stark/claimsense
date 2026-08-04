import { motion } from "motion/react";
import { Menu, Bell, LogOut, ChevronRight } from "lucide-react";
import { BrandLogo, LogoMark } from "./Logo";

export function TopBar({ title, onToggle, onSignOut }: {
  title: string; onToggle: () => void; onSignOut: () => void;
}) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0"
    >
      <motion.button onClick={onToggle} whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.05)" }} whileTap={{ scale: 0.92 }} className="p-1.5 rounded-md transition-colors text-muted-foreground">
        <Menu size={16} />
      </motion.button>
      <div className="flex items-center gap-2">
        {/* Mobile: logo mark only; desktop: full brand + breadcrumb */}
        <span className="md:hidden"><LogoMark size={26} /></span>
        <span className="hidden md:flex items-center gap-2">
          <BrandLogo size={22} textSize="sm" />
          <ChevronRight size={13} className="text-muted-foreground" />
          <motion.span key={title} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-semibold text-foreground text-sm capitalize">
            {title}
          </motion.span>
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="relative p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground">
          <Bell size={16} />
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"
          />
        </motion.button>
        <motion.button
          onClick={onSignOut}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <LogOut size={13} /> Sign out
        </motion.button>
      </div>
    </motion.header>
  );
}
