import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface NameModalProps {
  open: boolean;
  onConfirm: (name: string) => void;
  onClose: () => void;
}

export default function NameModal({
  open,
  onConfirm,
  onClose,
}: NameModalProps) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const isEmpty = !name.trim();
  const showError = touched && isEmpty;

  function handleConfirm() {
    setTouched(true);
    if (isEmpty) return;
    onConfirm(name.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        // Backdrop
        <motion.div
          data-ocid="name.modal"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0.06 0.01 220 / 0.85)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Modal card */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.13 0.02 220) 0%, oklch(0.10 0.015 22) 100%)",
              border: "1px solid oklch(0.65 0.22 32 / 0.35)",
              boxShadow:
                "0 0 60px oklch(0.65 0.22 32 / 0.2), 0 25px 60px oklch(0 0 0 / 0.6)",
            }}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
          >
            {/* Top accent line */}
            <div
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.65 0.22 32), oklch(0.6 0.23 22), transparent)",
              }}
            />

            <div className="px-10 py-12">
              {/* Icon */}
              <div className="mb-6 text-center text-5xl">💥</div>

              <h2
                className="mb-2 text-center font-display text-3xl tracking-widest"
                style={{ color: "oklch(0.92 0.02 50)" }}
              >
                IDENTIFY YOURSELF
              </h2>
              <p
                className="mb-8 text-center font-body text-sm"
                style={{ color: "oklch(0.55 0.05 50)" }}
              >
                What's your name, destroyer?
              </p>

              {/* Input */}
              <div className="mb-2">
                <Input
                  data-ocid="name.input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (touched) setTouched(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your name..."
                  autoFocus
                  className="border-0 border-b-2 bg-transparent text-center font-display text-xl tracking-widest text-foreground placeholder:tracking-widest placeholder:opacity-30 focus-visible:ring-0"
                  style={{
                    borderColor: showError
                      ? "oklch(0.6 0.23 22)"
                      : "oklch(0.65 0.22 32 / 0.5)",
                    color: "oklch(0.92 0.02 50)",
                  }}
                />
              </div>

              {/* Validation hint */}
              <AnimatePresence>
                {showError && (
                  <motion.p
                    data-ocid="name.error_state"
                    className="mb-4 text-center font-body text-xs"
                    style={{ color: "oklch(0.6 0.23 22)" }}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    A destroyer must have a name.
                  </motion.p>
                )}
              </AnimatePresence>

              {!showError && <div className="mb-4 h-5" />}

              {/* Confirm button */}
              <motion.button
                data-ocid="name.submit_button"
                onClick={handleConfirm}
                className="group relative w-full overflow-hidden py-4 font-display text-xl tracking-[0.25em] transition-all duration-200"
                style={{
                  background: "oklch(0.65 0.22 32)",
                  color: "oklch(0.98 0.005 0)",
                }}
                whileHover={{
                  background: "oklch(0.7 0.22 32)",
                  boxShadow: "0 0 20px oklch(0.65 0.22 32 / 0.5)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                LET'S SMASH
              </motion.button>

              {/* Back */}
              <button
                type="button"
                data-ocid="name.cancel_button"
                onClick={onClose}
                className="mt-4 w-full py-2 font-body text-xs tracking-widest transition-opacity duration-150 hover:opacity-70"
                style={{ color: "oklch(0.4 0.03 220)" }}
              >
                ← BACK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
