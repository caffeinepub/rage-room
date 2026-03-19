import { motion } from "motion/react";
import { useAudio } from "../hooks/useAudio";

interface WelcomePageProps {
  onEnter: () => void;
}

export default function WelcomePage({ onEnter }: WelcomePageProps) {
  const { playEnter } = useAudio();

  function handleEnter() {
    playEnter();
    // slight delay so sound plays before transition
    setTimeout(onEnter, 180);
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.18 0.04 22 / 0.9) 0%, oklch(0.08 0.015 220) 70%)",
      }}
    >
      {/* Background cracks / texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, oklch(0.65 0.22 32 / 0.06) 0px, transparent 1px, transparent 48px, oklch(0.65 0.22 32 / 0.06) 49px)",
        }}
      />

      {/* Glowing blobs */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "oklch(0.55 0.22 22 / 0.18)" }}
      />
      <div
        className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "oklch(0.65 0.22 32 / 0.15)" }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.img
          src="/assets/generated/rage-room-logo-transparent.dim_256x256.png"
          alt="Rage Room Logo"
          className="mb-4"
          style={{
            width: 140,
            height: 140,
            objectFit: "contain",
            filter:
              "drop-shadow(0 0 18px oklch(0.65 0.22 32 / 0.85)) drop-shadow(0 0 40px oklch(0.6 0.23 22 / 0.5))",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: [
              "drop-shadow(0 0 12px oklch(0.65 0.22 32 / 0.7)) drop-shadow(0 0 30px oklch(0.6 0.23 22 / 0.4))",
              "drop-shadow(0 0 28px oklch(0.65 0.22 32 / 1)) drop-shadow(0 0 60px oklch(0.6 0.23 22 / 0.7))",
              "drop-shadow(0 0 12px oklch(0.65 0.22 32 / 0.7)) drop-shadow(0 0 30px oklch(0.6 0.23 22 / 0.4))",
            ],
          }}
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.5, type: "spring", stiffness: 150 },
            filter: {
              delay: 0.6,
              duration: 2.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />

        {/* Eyebrow */}
        <motion.p
          className="mb-4 font-display text-sm tracking-[0.35em] text-neon-orange"
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.35em" }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          WELCOME TO THE
        </motion.p>

        {/* Big title */}
        <motion.h1
          className="font-display title-glow text-[clamp(5rem,18vw,14rem)] leading-none tracking-wider"
          style={{ color: "oklch(0.92 0.02 50)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.6,
            type: "spring",
            stiffness: 120,
          }}
        >
          RAGE
        </motion.h1>
        <motion.h1
          className="font-display text-[clamp(5rem,18vw,14rem)] leading-none tracking-wider"
          style={{
            color: "oklch(0.65 0.22 32)",
            textShadow:
              "0 0 40px oklch(0.65 0.22 32 / 0.7), 0 0 80px oklch(0.6 0.23 22 / 0.4)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            type: "spring",
            stiffness: 120,
          }}
        >
          ROOM
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mb-12 mt-6 max-w-md font-body text-lg font-medium"
          style={{ color: "oklch(0.65 0.05 50)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Release the rage.{" "}
          <span style={{ color: "oklch(0.72 0.18 32)" }}>
            Smash everything.
          </span>
        </motion.p>

        {/* CTA Button */}
        <motion.button
          data-ocid="welcome.primary_button"
          onClick={handleEnter}
          className="group relative overflow-hidden rounded-none border-2 px-16 py-5 font-display text-2xl tracking-widest transition-all duration-200"
          style={{
            borderColor: "oklch(0.65 0.22 32)",
            color: "oklch(0.92 0.02 50)",
            background: "transparent",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Hover fill */}
          <span
            className="absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0"
            style={{ background: "oklch(0.65 0.22 32 / 0.25)" }}
          />
          <span className="relative z-10">ENTER THE GAME</span>
          {/* Neon glow on hover */}
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: "inset 0 0 20px oklch(0.65 0.22 32 / 0.3)" }}
          />
        </motion.button>

        {/* Decorative line */}
        <motion.div
          className="mt-10 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div
            className="h-px w-16"
            style={{ background: "oklch(0.65 0.22 32 / 0.4)" }}
          />
          <span
            className="font-body text-xs tracking-[0.25em]"
            style={{ color: "oklch(0.45 0.04 220)" }}
          >
            SMASH · COMBO · LEVEL UP
          </span>
          <div
            className="h-px w-16"
            style={{ background: "oklch(0.65 0.22 32 / 0.4)" }}
          />
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-4 w-full text-center font-body text-xs"
        style={{ color: "oklch(0.35 0.02 220)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        © {new Date().getFullYear()} DEEPANSHU DHINGRA. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.55 0.1 32)" }}
        >
          caffeine.ai
        </a>
      </motion.footer>
    </div>
  );
}
