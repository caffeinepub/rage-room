import { AnimatePresence, motion } from "motion/react";

interface RagePassModalProps {
  open: boolean;
  onClose: () => void;
  playerName: string;
}

export default function RagePassModal({ open, onClose }: RagePassModalProps) {
  const BENEFITS = [
    { icon: "👑", text: "Crown badge next to your name" },
    { icon: "⏱️", text: "45 seconds per level (vs 30)" },
    { icon: "🔥", text: "Exclusive premium smash objects" },
    { icon: "⚡", text: "Special golden fire effects" },
    {
      icon: "💬",
      text: 'Exclusive hype lines: "UNSTOPPABLE!", "LEGENDARY RAGE!", "PURE FURY!"',
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ragepass-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{
              background: "oklch(0.05 0.01 220 / 0.85)",
              backdropFilter: "blur(6px)",
            }}
            data-ocid="ragepass.modal"
          />

          {/* Modal */}
          <motion.div
            key="ragepass-modal"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative pointer-events-auto rounded-2xl px-8 py-8 flex flex-col gap-6"
              style={{
                background: "oklch(0.11 0.018 220)",
                border: "1.5px solid oklch(0.72 0.16 85 / 0.6)",
                boxShadow:
                  "0 0 60px oklch(0.72 0.16 85 / 0.25), 0 0 120px oklch(0.65 0.22 32 / 0.15), 0 8px 32px oklch(0.05 0.01 220 / 0.8)",
                width: "min(480px, 94vw)",
              }}
            >
              {/* Close button */}
              <button
                type="button"
                data-ocid="ragepass.close_button"
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-80"
                style={{
                  background: "oklch(0.20 0.02 220)",
                  color: "oklch(0.60 0.01 250)",
                  fontSize: "1.1rem",
                  border: "1px solid oklch(0.25 0.02 220)",
                }}
              >
                ✕
              </button>

              {/* Decorative sparkle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  position: "absolute",
                  top: -16,
                  left: -16,
                  fontSize: "2rem",
                  opacity: 0.6,
                  pointerEvents: "none",
                }}
              >
                ✨
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 12,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  position: "absolute",
                  bottom: -12,
                  right: -12,
                  fontSize: "1.5rem",
                  opacity: 0.4,
                  pointerEvents: "none",
                }}
              >
                🔥
              </motion.div>

              {/* Title */}
              <div className="text-center">
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    fontFamily:
                      "var(--font-display, 'Bebas Neue', Impact, sans-serif)",
                    fontSize: "clamp(2.2rem, 6vw, 3.2rem)",
                    letterSpacing: "0.08em",
                    background:
                      "linear-gradient(135deg, oklch(0.85 0.18 85), oklch(0.70 0.20 75), oklch(0.82 0.16 90))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "none",
                    lineHeight: 1.1,
                  }}
                >
                  RAGE PASS 👑
                </motion.div>
                <div
                  className="mt-1 text-sm tracking-widest uppercase"
                  style={{ color: "oklch(0.55 0.01 250)" }}
                >
                  One-time unlock · No subscription
                </div>
              </div>

              {/* Coming Soon badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 280 }}
                className="text-center"
              >
                <span
                  className="inline-block px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase"
                  style={{
                    background: "oklch(0.72 0.16 85 / 0.15)",
                    border: "1.5px solid oklch(0.72 0.16 85 / 0.5)",
                    color: "oklch(0.82 0.18 85)",
                    letterSpacing: "0.15em",
                  }}
                >
                  🚀 COMING SOON
                </span>
              </motion.div>

              {/* Benefits */}
              <ul className="flex flex-col gap-3">
                {BENEFITS.map((b, i) => (
                  <motion.li
                    key={b.text}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-xl flex-shrink-0">{b.icon}</span>
                    <span
                      className="text-sm leading-snug"
                      style={{ color: "oklch(0.78 0.03 250)" }}
                    >
                      {b.text}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Coming Soon message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="text-center px-4 py-4 rounded-xl"
                style={{
                  background: "oklch(0.16 0.02 220)",
                  border: "1px solid oklch(0.28 0.03 220)",
                }}
              >
                <p
                  className="text-base font-bold mb-1"
                  style={{ color: "oklch(0.82 0.18 85)" }}
                >
                  Payments coming soon — stay tuned! 🔥
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.50 0.01 250)" }}
                >
                  We're working on unlocking the full Rage Pass experience.
                </p>
              </motion.div>

              {/* Close CTA */}
              <motion.button
                type="button"
                data-ocid="ragepass.primary_button"
                onClick={onClose}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-xl font-display tracking-widest uppercase transition-all"
                style={{
                  fontSize: "1.1rem",
                  letterSpacing: "0.1em",
                  background: "oklch(0.20 0.02 220)",
                  color: "oklch(0.70 0.03 250)",
                  border: "1.5px solid oklch(0.30 0.03 220)",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                GOT IT — BACK TO SMASHING
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
