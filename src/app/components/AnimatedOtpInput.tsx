import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

interface AnimatedOtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  status?: "idle" | "error" | "success";
  autoFocus?: boolean;
}

export function AnimatedOtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  status = "idle",
  autoFocus = true,
}: AnimatedOtpInputProps) {
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (status === "error") setShakeKey((k) => k + 1);
  }, [status]);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        key={shakeKey}
        animate={
          status === "error"
            ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        <InputOTP
          maxLength={length}
          value={value}
          onChange={(v) => {
            onChange(v);
            if (v.length === length) onComplete?.(v);
          }}
          autoFocus={autoFocus}
        >
          <InputOTPGroup className="gap-1.5 sm:gap-2">
            {Array.from({ length }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
              >
                <InputOTPSlot
                  index={i}
                  className={`h-11 w-9 sm:h-12 sm:w-11 text-lg sm:text-xl rounded-lg! border! ${
                    status === "success"
                      ? "border-emerald-500! bg-emerald-500/10! text-emerald-300 ring-emerald-500/30"
                      : status === "error"
                      ? "border-red-500! bg-red-500/10! text-red-300 ring-red-500/30"
                      : ""
                  }`}
                />
              </motion.div>
            ))}
          </InputOTPGroup>
        </InputOTP>
      </motion.div>

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
        >
          <CheckCircle2 size={14} />
          Verified
        </motion.div>
      )}
    </div>
  );
}
