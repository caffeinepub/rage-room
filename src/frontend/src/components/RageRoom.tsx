import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "../hooks/useAudio";
import { useSubmitScore, useTopScores } from "../hooks/useQueries";
import RagePassModal from "./RagePassModal";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function AdBanner() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (_e) {
      // ignore
    }
  }, []);
  return (
    <div
      ref={ref}
      style={{ width: "100%", minHeight: 100, marginTop: 12, marginBottom: 4 }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3647773420341468"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ─── Types & Constants ────────────────────────────────────────────────────────

const OBJECT_TYPES = [
  { type: "vase", emoji: "🏺", label: "Vase", points: 100 },
  { type: "laptop", emoji: "💻", label: "Laptop", points: 200 },
  { type: "phone", emoji: "📱", label: "Phone", points: 150 },
  { type: "tv", emoji: "📺", label: "TV", points: 300 },
  { type: "chair", emoji: "🪑", label: "Chair", points: 250 },
  { type: "mug", emoji: "☕", label: "Mug", points: 75 },
  { type: "bottle", emoji: "🍾", label: "Bottle", points: 125 },
  { type: "monitor", emoji: "🖥️", label: "Monitor", points: 275 },
] as const;

type ObjKey = (typeof OBJECT_TYPES)[number]["type"];
type GameState = "idle" | "playing" | "rankreveal" | "levelup" | "gameover";

const SHARD_COLORS = [
  "oklch(0.65 0.22 32)",
  "oklch(0.60 0.23 22)",
  "oklch(0.80 0.18 80)",
  "oklch(0.90 0.05 250)",
  "oklch(0.75 0.20 45)",
  "oklch(0.55 0.25 15)",
];

const GAME_DURATION_BASE = 30;
const GAME_DURATION_PREMIUM = 45;
const SMASH_IT_ALL_INTERVAL = 15;
const HYPE_LINES = [
  "READY FOR MORE HEAT? 🔥",
  "LET'S BURN IT DOWN! 💥",
  "YOU'RE ON FIRE! 🔥",
  "KEEP SMASHING! 💪",
  "NO MERCY! 😤",
  "FEEL THE RAGE! 🤬",
  "UNSTOPPABLE! ⚡",
  "GO HARDER! 💢",
  "DESTROY EVERYTHING! 👊",
  "THE ROOM CAN'T HANDLE YOU! 😡",
  "PURE DESTRUCTION! 💀",
  "LEVEL UP YOUR RAGE! 🤯",
  "CAN YOU TAKE THE HEAT? 🔥",
  "SMASH IT INTO OBLIVION! 💥",
  "YOUR RAGE GROWS STRONGER! 👿",
  "NOTHING CAN STOP YOU NOW! ⚡",
  "MAXIMUM DESTRUCTION MODE! 🔥",
];
const PREMIUM_HYPE_LINES = [
  "UNSTOPPABLE! 👑",
  "LEGENDARY RAGE! 🔥",
  "PURE FURY! ⚡",
  "GODLIKE RAGE! 💀",
  "ABSOLUTE DESTRUCTION! 👑",
  "PREMIUM RAGE UNLEASHED! 🔱",
  "YOU ARE THE STORM! ⚡",
];
const RAGE_EMOJIS = [
  "😤",
  "😡",
  "🤬",
  "💢",
  "🔥",
  "👊",
  "😠",
  "💀",
  "🤯",
  "👿",
];

interface ObjectSlot {
  id: number;
  objType: ObjKey;
  state: "idle" | "smashing" | "respawning";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  tr: number;
  color: string;
  size: number;
  duration: number;
  shape: "square" | "diamond" | "circle";
}

interface ScoreTick {
  id: number;
  x: number;
  y: number;
  value: number;
  combo: number;
}

interface EmojiItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
}

const NUM_SLOTS = 8;
let particleId = 0;
let tickId = 0;
let slotId = 0;
let emojiId = 0;

function randomObj(): ObjKey {
  return OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)].type;
}

function getObjDef(type: ObjKey) {
  return OBJECT_TYPES.find((o) => o.type === type)!;
}

function initSlots(): ObjectSlot[] {
  return Array.from({ length: NUM_SLOTS }, () => ({
    id: ++slotId,
    objType: randomObj(),
    state: "idle" as const,
  }));
}

function spawnParticles(x: number, y: number, count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 60 + Math.random() * 120;
    const size = 6 + Math.random() * 10;
    return {
      id: ++particleId,
      x,
      y,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      tr: (Math.random() - 0.5) * 360,
      color: SHARD_COLORS[Math.floor(Math.random() * SHARD_COLORS.length)],
      size,
      duration: 0.5 + Math.random() * 0.4,
      shape: (["square", "diamond", "circle"] as const)[
        Math.floor(Math.random() * 3)
      ],
    };
  });
}

function generateEmojiBlast(count: number): EmojiItem[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 200;
    return {
      id: ++emojiId,
      emoji: RAGE_EMOJIS[Math.floor(Math.random() * RAGE_EMOJIS.length)],
      x: 45 + Math.random() * 10, // % from center
      y: 45 + Math.random() * 10,
      size: 2 + Math.random() * 3,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      duration: 0.8 + Math.random() * 0.8,
      delay: Math.random() * 0.3,
    };
  });
}

function stressLabel(stress: number) {
  if (stress >= 80)
    return { label: "EXTREME STRESS", color: "oklch(0.60 0.23 22)" };
  if (stress >= 60)
    return { label: "HIGH STRESS", color: "oklch(0.62 0.22 30)" };
  if (stress >= 40) return { label: "MODERATE", color: "oklch(0.72 0.20 50)" };
  if (stress >= 20) return { label: "CHILLING", color: "oklch(0.80 0.18 80)" };
  return { label: "ZEN MODE 🧘", color: "oklch(0.72 0.22 145)" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RageRoom({
  playerName: initialPlayerName = "",
  onAbout,
}: { playerName?: string; onAbout?: () => void }) {
  const [slots, setSlots] = useState<ObjectSlot[]>(initSlots);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scoreTicks, setScoreTicks] = useState<ScoreTick[]>([]);
  const [score, setScore] = useState(0);
  const [stress, setStress] = useState(100);
  const [combo, setCombo] = useState(1);
  const [comboKey, setComboKey] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [isRaging, setIsRaging] = useState(false);
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const isPremium = false;
  const [ragePassOpen, setRagePassOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_BASE);
  const [level, setLevel] = useState(1);
  const [levelUpCountdown, setLevelUpCountdown] = useState(3);
  const [hypeLineIndex, setHypeLineIndex] = useState(0);

  // New feature states
  const [smashItAllVisible, setSmashItAllVisible] = useState(false);
  const [smashItAllTimer, setSmashItAllTimer] = useState(SMASH_IT_ALL_INTERVAL);
  const [powerBoostActive, setPowerBoostActive] = useState(false);
  const [showEmojiBlast, setShowEmojiBlast] = useState(false);
  const [emojiBlastItems, setEmojiBlastItems] = useState<EmojiItem[]>([]);
  const [powerBoostEmojis, setPowerBoostEmojis] = useState<EmojiItem[]>([]);

  const lastSmashTime = useRef(0);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stressRef = useRef(stress);
  stressRef.current = stress;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelRef = useRef(level);
  levelRef.current = level;
  const powerBoostTriggeredRef = useRef(false);

  const { playSmash, playCombo, playRage } = useAudio();
  const { data: topScores, refetch: refetchScores } = useTopScores();
  const submitScore = useSubmitScore();

  // Stress regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setStress((s) => Math.min(100, s + 0.5));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clean up particles
  useEffect(() => {
    if (particles.length === 0) return;
    const maxDur = Math.max(...particles.map((p) => p.duration)) * 1000 + 100;
    const timer = setTimeout(() => {
      setParticles([]);
    }, maxDur);
    return () => clearTimeout(timer);
  }, [particles]);

  // Countdown timer — goes to rankreveal if level 1, else levelup
  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          const currentLevel = levelRef.current;
          if (currentLevel === 1) {
            setGameState("rankreveal");
          } else {
            setGameState("levelup");
            setLevelUpCountdown(3);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Rank reveal → levelup after 3 seconds
  useEffect(() => {
    if (gameState !== "rankreveal") return;
    refetchScores();
    const t = setTimeout(() => {
      setGameState("levelup");
      setLevelUpCountdown(3);
    }, 3500);
    return () => clearTimeout(t);
  }, [gameState, refetchScores]);

  // Level up countdown
  useEffect(() => {
    if (gameState !== "levelup") return;
    setLevelUpCountdown(3);
    if (isPremium && Math.random() > 0.5) {
      setHypeLineIndex(
        -(Math.floor(Math.random() * PREMIUM_HYPE_LINES.length) + 1),
      );
    } else {
      setHypeLineIndex(Math.floor(Math.random() * HYPE_LINES.length));
    }
    const countInterval = setInterval(() => {
      setLevelUpCountdown((c) => {
        if (c <= 1) {
          clearInterval(countInterval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    // After 3.2s, advance to next level
    const advanceTimer = setTimeout(() => {
      setLevel((prev) => prev + 1);
      setTimeLeft(isPremium ? GAME_DURATION_PREMIUM : GAME_DURATION_BASE);
      setSlots(initSlots());
      setSmashItAllVisible(false);
      setSmashItAllTimer(SMASH_IT_ALL_INTERVAL);
      powerBoostTriggeredRef.current = false;
      setGameState("playing");
    }, 3200);
    return () => {
      clearInterval(countInterval);
      clearTimeout(advanceTimer);
    };
  }, [gameState]);

  // Refetch scores when game over
  useEffect(() => {
    if (gameState === "gameover") {
      refetchScores();
    }
  }, [gameState, refetchScores]);

  // SMASH IT ALL 15-second cycle
  useEffect(() => {
    if (gameState !== "playing") return;
    if (smashItAllVisible) return; // already visible, don't tick
    const interval = setInterval(() => {
      setSmashItAllTimer((t) => {
        if (t <= 1) {
          setSmashItAllVisible(true);
          return SMASH_IT_ALL_INTERVAL;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, smashItAllVisible]);

  // Power boost: detect all 8 slots non-idle
  useEffect(() => {
    if (gameState !== "playing") return;
    const allNonIdle = slots.every((s) => s.state !== "idle");
    if (allNonIdle && !powerBoostTriggeredRef.current) {
      powerBoostTriggeredRef.current = true;
      setPowerBoostActive(true);
      // Show emoji rain
      setPowerBoostEmojis(generateEmojiBlast(18));
      // Force SMASH IT ALL visible
      setSmashItAllVisible(true);
      setSmashItAllTimer(SMASH_IT_ALL_INTERVAL);
      setTimeout(() => {
        setPowerBoostActive(false);
        setPowerBoostEmojis([]);
        // Reset trigger so it can fire again
        powerBoostTriggeredRef.current = false;
      }, 2500);
    }
    // Re-enable trigger when some slots go back to idle
    if (!allNonIdle && powerBoostTriggeredRef.current) {
      // do nothing — only reset on timeout above
    }
  }, [slots, gameState]);

  const startGame = useCallback(() => {
    setScore(0);
    setCombo(1);
    setShowCombo(false);
    setSubmitted(false);
    setSlots(initSlots());
    setTimeLeft(isPremium ? GAME_DURATION_PREMIUM : GAME_DURATION_BASE);
    setLevel(1);
    setSmashItAllVisible(false);
    setSmashItAllTimer(SMASH_IT_ALL_INTERVAL);
    powerBoostTriggeredRef.current = false;
    setPowerBoostActive(false);
    setShowEmojiBlast(false);
    setGameState("playing");
  }, []);

  const giveUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("gameover");
  }, []);

  const doSmash = useCallback(
    (slotIndex: number, e?: React.MouseEvent) => {
      if (gameState !== "playing") return;
      const slot = slots[slotIndex];
      if (!slot || slot.state !== "idle") return;

      const currentLevel = levelRef.current;
      const smashMs = Math.max(200, 500 - (currentLevel - 1) * 30);
      const respawnMs = Math.max(150, 420 - (currentLevel - 1) * 20);
      const pointMultiplier = 1 + Math.max(0, currentLevel - 2) * 0.15;

      const now = Date.now();
      const timeSinceLast = now - lastSmashTime.current;
      lastSmashTime.current = now;

      // Combo logic
      let newCombo = combo;
      if (timeSinceLast < 1500) {
        newCombo = Math.min(combo + 1, 8);
      } else {
        newCombo = 1;
      }
      setCombo(newCombo);

      if (newCombo > 1) {
        playCombo(newCombo);
        setShowCombo(true);
        setComboKey((k) => k + 1);
      }

      // Reset combo timer
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => {
        setCombo(1);
        setShowCombo(false);
      }, 1500);

      const obj = getObjDef(slot.objType);
      const pts = Math.round(obj.points * pointMultiplier * newCombo);
      setScore((s) => s + pts);
      setStress((s) => Math.max(0, s - 5));
      playSmash();

      // Spawn particles at click position
      const rect = e?.currentTarget?.getBoundingClientRect?.();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      const newParticles = spawnParticles(cx, cy, 10);
      setParticles((prev) => [...prev, ...newParticles]);

      // Score tick
      const currentTickId = ++tickId;
      setScoreTicks((prev) => [
        ...prev,
        { id: currentTickId, x: cx, y: cy - 20, value: pts, combo: newCombo },
      ]);
      setTimeout(
        () =>
          setScoreTicks((prev) => prev.filter((t) => t.id !== currentTickId)),
        900,
      );

      // Mark smashing
      setSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex ? { ...s, state: "smashing" as const } : s,
        ),
      );

      // Respawn
      setTimeout(() => {
        setSlots((prev) =>
          prev.map((s, i) =>
            i === slotIndex
              ? {
                  ...s,
                  state: "respawning" as const,
                  id: ++slotId,
                  objType: randomObj(),
                }
              : s,
          ),
        );
        setTimeout(() => {
          setSlots((prev) =>
            prev.map((s, i) =>
              i === slotIndex ? { ...s, state: "idle" as const } : s,
            ),
          );
        }, respawnMs);
      }, smashMs);
    },
    [slots, combo, playSmash, playCombo, gameState],
  );

  const doRageMode = useCallback(() => {
    if (isRaging || gameState !== "playing") return;
    setIsRaging(true);
    playRage();

    // Show emoji blast instead of red overlay
    const blastItems = generateEmojiBlast(25);
    setEmojiBlastItems(blastItems);
    setShowEmojiBlast(true);
    setTimeout(() => setShowEmojiBlast(false), 2000);

    const idleIndices = slots
      .map((s, i) => (s.state === "idle" ? i : -1))
      .filter((i) => i !== -1);

    // Stagger smashes
    idleIndices.forEach((idx, arrIdx) => {
      setTimeout(() => doSmash(idx), arrIdx * 120);
    });

    // Hide the button after use, reset timer
    setSmashItAllVisible(false);
    setSmashItAllTimer(SMASH_IT_ALL_INTERVAL);

    setTimeout(() => setIsRaging(false), 2000);
  }, [isRaging, slots, doSmash, playRage, gameState]);

  const handleSubmitScore = async () => {
    if (!playerName.trim() || score === 0) return;
    try {
      await submitScore.mutateAsync({ playerName: playerName.trim(), score });
      setSubmitted(true);
      refetchScores();
    } catch {
      // ignore
    }
  };

  const stressInfo = stressLabel(stress);
  const stressBarColor =
    stress >= 60
      ? "oklch(0.60 0.23 22)"
      : stress >= 40
        ? "oklch(0.65 0.22 32)"
        : stress >= 20
          ? "oklch(0.80 0.18 80)"
          : "oklch(0.72 0.22 145)";

  const timerColor =
    timeLeft <= 5
      ? "oklch(0.60 0.23 22)"
      : timeLeft <= 10
        ? "oklch(0.72 0.20 50)"
        : "oklch(0.90 0.05 250)";

  const isActiveGame = gameState === "playing" || gameState === "levelup";

  // Leaderboard rank calculation
  const rankData = (() => {
    if (!topScores || topScores.length === 0) return null;
    const scores = topScores.map((e) => Number(e.score));
    const rank = scores.filter((s) => s > score).length + 1;
    const total = scores.length + 1; // include current player
    const beatenPct = Math.round(((total - rank) / total) * 100);
    return { rank, total, beatenPct };
  })();

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "oklch(0.10 0.015 220)" }}
    >
      {/* CSS Keyframe styles */}
      <style>{`
        @keyframes emoji-fly {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--edx), var(--edy)) scale(0.3); opacity: 0; }
        }
        @keyframes power-rain {
          0% { transform: translateY(100vh) scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-20vh) scale(0.8) rotate(360deg); opacity: 0; }
        }
        @keyframes power-boost-banner {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
          30% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
          70% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
        @keyframes smash-btn-appear {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes smash-btn-pulse {
          0%, 100% { box-shadow: 0 0 24px oklch(0.65 0.22 32 / 0.6), 0 0 48px oklch(0.60 0.23 22 / 0.3); }
          50% { box-shadow: 0 0 40px oklch(0.65 0.22 32 / 0.9), 0 0 80px oklch(0.60 0.23 22 / 0.6), 0 0 120px oklch(0.60 0.23 22 / 0.2); }
        }
        @keyframes power-btn-pulse {
          0%, 100% { box-shadow: 0 0 40px oklch(0.80 0.18 80 / 0.8), 0 0 80px oklch(0.65 0.22 32 / 0.5); }
          50% { box-shadow: 0 0 70px oklch(0.80 0.18 80), 0 0 120px oklch(0.65 0.22 32 / 0.8), 0 0 200px oklch(0.60 0.23 22 / 0.4); }
        }
      `}</style>

      {/* Emoji Blast Overlay (replaces red rage overlay) */}
      <AnimatePresence>
        {showEmojiBlast && (
          <div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ overflow: "hidden" }}
          >
            {emojiBlastItems.map((item) => (
              <div
                key={item.id}
                style={
                  {
                    position: "absolute",
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    fontSize: `${item.size}rem`,
                    lineHeight: 1,
                    "--edx": `${item.dx}px`,
                    "--edy": `${item.dy}px`,
                    animation: `emoji-fly ${item.duration}s ${item.delay}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
                    filter: "drop-shadow(0 0 8px rgba(255,80,0,0.8))",
                  } as React.CSSProperties
                }
              >
                {item.emoji}
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Power Boost Banner */}
      <AnimatePresence>
        {powerBoostActive && (
          <div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ overflow: "hidden" }}
          >
            {/* Emoji rain from bottom */}
            {powerBoostEmojis.map((item) => (
              <div
                key={item.id}
                style={
                  {
                    position: "absolute",
                    left: `${5 + Math.random() * 90}%`,
                    bottom: "-5%",
                    fontSize: `${2 + Math.random() * 2.5}rem`,
                    animation: `power-rain ${1 + Math.random() * 1.2}s ${Math.random() * 0.5}s ease-out forwards`,
                  } as React.CSSProperties
                }
              >
                {item.emoji}
              </div>
            ))}
            {/* Central banner */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                animation: "power-boost-banner 1.5s ease-out forwards",
                fontFamily:
                  "var(--font-display, 'Bebas Neue', Impact, sans-serif)",
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
                letterSpacing: "0.06em",
                color: "oklch(0.80 0.18 80)",
                textShadow:
                  "0 0 40px oklch(0.80 0.18 80), 0 0 80px oklch(0.65 0.22 32 / 0.8)",
                whiteSpace: "nowrap",
                textAlign: "center",
                background: "oklch(0.10 0.015 220 / 0.85)",
                padding: "0.4em 0.8em",
                borderRadius: "16px",
                border: "2px solid oklch(0.80 0.18 80 / 0.6)",
              }}
            >
              ⚡ POWER BOOST! ⚡
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Particle overlay */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            style={
              {
                position: "absolute",
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius:
                  p.shape === "circle"
                    ? "50%"
                    : p.shape === "diamond"
                      ? "0"
                      : "2px",
                transform: p.shape === "diamond" ? "rotate(45deg)" : "none",
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
                "--tr": `${p.tr}deg`,
                animation: `particle-fly ${p.duration}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
                boxShadow: `0 0 6px 1px ${p.color}`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Score ticks */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        {scoreTicks.map((t) => (
          <div
            key={t.id}
            style={{
              position: "absolute",
              left: t.x - 30,
              top: t.y,
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: t.combo > 1 ? "28px" : "22px",
              color:
                t.combo > 1 ? "oklch(0.80 0.18 80)" : "oklch(0.90 0.05 250)",
              textShadow: "0 0 10px currentColor",
              animation: "score-tick 0.8s ease-out forwards",
              whiteSpace: "nowrap",
            }}
          >
            +{t.value.toLocaleString()}
          </div>
        ))}
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header
        className="relative z-10 px-4 pt-5 pb-3"
        style={{
          borderBottom: "1px solid oklch(0.22 0.02 220)",
          background: "oklch(0.12 0.016 220 / 0.95)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Top row: title + score + level + timer + leaderboard */}
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/rage-room-logo-transparent.dim_256x256.png"
              alt=""
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
                filter: "drop-shadow(0 0 6px oklch(0.65 0.22 32 / 0.8))",
              }}
            />
            <h1
              className="font-display title-glow select-none"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "oklch(0.65 0.22 32)",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              RAGE ROOM
            </h1>
          </div>

          {/* Score + Level + Timer + Leaderboard */}
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end">
            {/* Score */}
            <div className="text-center">
              <div
                className="font-display"
                style={{
                  fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                  color: "oklch(0.90 0.05 250)",
                }}
              >
                {score.toLocaleString()}
              </div>
              <div
                className="text-xs tracking-widest uppercase"
                style={{ color: "oklch(0.55 0.01 250)" }}
              >
                Score
              </div>
            </div>

            {/* Premium crown badge */}
            {isPremium && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{
                  background: "oklch(0.75 0.15 85 / 0.15)",
                  border: "1px solid oklch(0.75 0.15 85 / 0.5)",
                  boxShadow: "0 0 12px oklch(0.75 0.15 85 / 0.3)",
                  fontSize: "0.85rem",
                  color: "oklch(0.80 0.18 85)",
                  letterSpacing: "0.05em",
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: "1rem" }}>👑</span>
                <span className="hidden sm:inline text-xs">RAGE PASS</span>
              </div>
            )}

            {/* Level badge */}
            {isActiveGame && (
              <motion.div
                key={level}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="text-center px-3 py-1 rounded-lg"
                data-ocid="game.panel"
                style={{
                  background: "oklch(0.80 0.18 80 / 0.12)",
                  border: "1px solid oklch(0.80 0.18 80 / 0.45)",
                  boxShadow: "0 0 12px oklch(0.80 0.18 80 / 0.25)",
                }}
              >
                <div
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
                    color: "oklch(0.80 0.18 80)",
                    letterSpacing: "0.06em",
                    textShadow: "0 0 10px oklch(0.80 0.18 80 / 0.5)",
                    lineHeight: 1,
                  }}
                >
                  LVL {level}
                </div>
                <div
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "oklch(0.65 0.12 80)" }}
                >
                  Level
                </div>
              </motion.div>
            )}

            {/* Timer */}
            {gameState !== "idle" &&
              gameState !== "levelup" &&
              gameState !== "rankreveal" && (
                <div className="text-center" data-ocid="game.timer">
                  <div
                    className="font-display"
                    style={{
                      fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                      color: timerColor,
                      textShadow:
                        timeLeft <= 5 ? `0 0 16px ${timerColor}` : "none",
                      transition: "color 0.3s, text-shadow 0.3s",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {timeLeft}s
                  </div>
                  <div
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "oklch(0.55 0.01 250)" }}
                  >
                    Time
                  </div>
                </div>
              )}

            {/* Leaderboard */}
            <Dialog open={leaderboardOpen} onOpenChange={setLeaderboardOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  data-ocid="leaderboard.open_modal_button"
                  onClick={() => refetchScores()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-200"
                  style={{
                    background: "oklch(0.14 0.018 220)",
                    border: "1px solid oklch(0.65 0.22 32 / 0.5)",
                    color: "oklch(0.65 0.22 32)",
                    boxShadow: "0 0 10px oklch(0.65 0.22 32 / 0.2)",
                  }}
                >
                  <Trophy size={16} />
                  Board
                </button>
              </DialogTrigger>

              <DialogContent
                data-ocid="leaderboard.dialog"
                style={{
                  background: "oklch(0.13 0.018 220)",
                  border: "1px solid oklch(0.65 0.22 32 / 0.4)",
                  boxShadow: "0 0 40px oklch(0.65 0.22 32 / 0.15)",
                  color: "oklch(0.95 0.008 250)",
                  maxWidth: "480px",
                  width: "100%",
                }}
              >
                <DialogHeader>
                  <DialogTitle
                    className="font-display text-center"
                    style={{
                      fontSize: "2rem",
                      color: "oklch(0.65 0.22 32)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    LEADERBOARD
                  </DialogTitle>
                </DialogHeader>

                {/* Top 10 */}
                <div className="mt-2 space-y-1" data-ocid="leaderboard.list">
                  {!topScores || topScores.length === 0 ? (
                    <div
                      data-ocid="leaderboard.empty_state"
                      className="text-center py-6 text-sm"
                      style={{ color: "oklch(0.55 0.01 250)" }}
                    >
                      No scores yet. Be the first!
                    </div>
                  ) : (
                    topScores.slice(0, 10).map((entry, i) => (
                      <div
                        key={`${entry.playerName}-${i}`}
                        data-ocid={`leaderboard.item.${i + 1}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{
                          background:
                            i === 0
                              ? "oklch(0.65 0.22 32 / 0.1)"
                              : "oklch(0.16 0.018 220)",
                          border:
                            i === 0
                              ? "1px solid oklch(0.65 0.22 32 / 0.4)"
                              : "1px solid transparent",
                        }}
                      >
                        <span
                          className="font-display w-8 text-lg"
                          style={{
                            color:
                              i === 0
                                ? "oklch(0.80 0.18 80)"
                                : "oklch(0.50 0.01 250)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 font-semibold">
                          {entry.playerName}
                        </span>
                        <span
                          className="font-display text-lg"
                          style={{ color: "oklch(0.65 0.22 32)" }}
                        >
                          {Number(entry.score).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Submit score */}
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: "1px solid oklch(0.22 0.02 220)" }}
                >
                  {submitted ? (
                    <div
                      data-ocid="leaderboard.success_state"
                      className="text-center py-2 font-semibold"
                      style={{ color: "oklch(0.72 0.22 145)" }}
                    >
                      ✓ Score submitted!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        data-ocid="leaderboard.input"
                        placeholder="Your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSubmitScore()
                        }
                        maxLength={20}
                        style={{
                          background: "oklch(0.16 0.018 220)",
                          border: "1px solid oklch(0.30 0.02 220)",
                          color: "oklch(0.95 0.008 250)",
                        }}
                      />
                      <button
                        type="button"
                        data-ocid="leaderboard.submit_button"
                        onClick={handleSubmitScore}
                        disabled={
                          !playerName.trim() ||
                          score === 0 ||
                          submitScore.isPending
                        }
                        className="px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-200 disabled:opacity-40"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.65 0.22 32), oklch(0.60 0.23 22))",
                          color: "oklch(0.98 0.005 0)",
                          boxShadow: "0 0 16px oklch(0.65 0.22 32 / 0.4)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {submitScore.isPending ? "..." : "Submit"}
                      </button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stress meter */}
        <div className="max-w-5xl mx-auto mt-3">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: stressBarColor }}
            >
              {stressInfo.label}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: stressBarColor }}
            >
              {Math.round(stress)}%
            </span>
          </div>
          <div
            className="relative h-3 rounded-full overflow-hidden"
            style={{ background: "oklch(0.17 0.018 220)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stress}%`,
                background:
                  "linear-gradient(90deg, oklch(0.72 0.22 145), oklch(0.80 0.18 80) 40%, oklch(0.65 0.22 32) 70%, oklch(0.60 0.23 22) 100%)",
                backgroundSize: "200% 100%",
                backgroundPosition: `${100 - stress}% 0`,
                boxShadow: `0 0 10px ${stressBarColor}`,
              }}
            />
          </div>
        </div>
      </header>

      {/* ── MAIN GAME AREA ──────────────────────────────────────────── */}
      <main className="flex-1 relative z-10 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* ── IDLE: Start Screen ── */}
            {gameState === "idle" && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center min-h-[420px] gap-6"
              >
                <div
                  className="font-display text-center"
                  style={{
                    fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                    color: "oklch(0.65 0.10 250)",
                    letterSpacing: "0.08em",
                  }}
                >
                  SMASH AS MUCH AS YOU CAN IN
                </div>
                <div
                  className="font-display"
                  style={{
                    fontSize: "clamp(5rem, 14vw, 9rem)",
                    color: "oklch(0.65 0.22 32)",
                    lineHeight: 0.9,
                    textShadow: "0 0 40px oklch(0.65 0.22 32 / 0.5)",
                    letterSpacing: "0.04em",
                  }}
                >
                  30s
                </div>
                <div
                  className="font-display text-center"
                  style={{
                    fontSize: "clamp(0.8rem, 2vw, 1rem)",
                    color: "oklch(0.80 0.18 80 / 0.8)",
                    letterSpacing: "0.06em",
                  }}
                >
                  🏆 SURVIVE LEVELS · GET FASTER EACH ROUND · SCORE MULTIPLIERS
                  GROW
                </div>
                <button
                  type="button"
                  data-ocid="game.primary_button"
                  onClick={startGame}
                  className="flex items-center gap-3 px-10 py-4 rounded-full font-display tracking-wider text-xl uppercase transition-all duration-200 active:scale-95 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.22 32), oklch(0.55 0.24 18))",
                    color: "oklch(0.98 0.005 0)",
                    boxShadow:
                      "0 0 32px oklch(0.65 0.22 32 / 0.7), 0 0 64px oklch(0.60 0.23 22 / 0.3)",
                    fontSize: "1.5rem",
                    letterSpacing: "0.12em",
                  }}
                >
                  <Zap size={26} fill="currentColor" />
                  START GAME
                </button>
                <p
                  className="text-sm tracking-wide"
                  style={{ color: "oklch(0.45 0.01 250)" }}
                >
                  Click objects to smash them · Chain hits for combo multipliers
                </p>
              </motion.div>
            )}

            {/* ── PLAYING: Game Grid ── */}
            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* SMASH IT ALL button — visible on 15s cycle */}
                <div className="flex items-center justify-center gap-4 mb-6 flex-wrap min-h-[72px]">
                  <AnimatePresence>
                    {smashItAllVisible ? (
                      <motion.button
                        key="smash-btn"
                        type="button"
                        data-ocid="game.secondary_button"
                        onClick={doRageMode}
                        disabled={isRaging}
                        initial={{ scale: 0, rotate: -10, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                        }}
                        className="flex items-center gap-3 px-8 py-3 rounded-full font-display tracking-wider uppercase disabled:opacity-60 active:scale-95"
                        style={{
                          background: isRaging
                            ? "oklch(0.50 0.22 25)"
                            : powerBoostActive
                              ? "linear-gradient(135deg, oklch(0.80 0.18 80), oklch(0.65 0.22 32), oklch(0.55 0.24 18))"
                              : "linear-gradient(135deg, oklch(0.65 0.22 32), oklch(0.55 0.24 18))",
                          color: "oklch(0.98 0.005 0)",
                          animation: isRaging
                            ? "none"
                            : powerBoostActive
                              ? "power-btn-pulse 0.8s ease-in-out infinite"
                              : "smash-btn-pulse 1.8s ease-in-out infinite",
                          fontSize: "1.3rem",
                          letterSpacing: "0.1em",
                        }}
                      >
                        <Zap size={22} fill="currentColor" />
                        {isRaging ? "RAGING..." : "SMASH IT ALL"}
                      </motion.button>
                    ) : (
                      <motion.div
                        key="smash-countdown"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className="text-xs font-semibold uppercase tracking-widest"
                          style={{ color: "oklch(0.50 0.10 22)" }}
                        >
                          SMASH IT ALL in {smashItAllTimer}s
                        </div>
                        <div
                          className="rounded-full overflow-hidden"
                          style={{
                            width: 160,
                            height: 4,
                            background: "oklch(0.18 0.018 220)",
                          }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${((SMASH_IT_ALL_INTERVAL - smashItAllTimer) / SMASH_IT_ALL_INTERVAL) * 100}%`,
                              background:
                                "linear-gradient(90deg, oklch(0.55 0.22 22), oklch(0.65 0.22 32))",
                              boxShadow: "0 0 6px oklch(0.65 0.22 32 / 0.5)",
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Object grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {slots.map((slot, idx) => (
                    <SmashCard
                      key={`${slot.id}-${slot.objType}`}
                      slot={slot}
                      onSmash={(e) => doSmash(idx, e)}
                      level={level}
                    />
                  ))}
                </div>

                {/* Give Up button */}
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    data-ocid="game.delete_button"
                    onClick={giveUp}
                    className="px-5 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 hover:opacity-80"
                    style={{
                      background: "oklch(0.14 0.018 220)",
                      border: "1px solid oklch(0.40 0.12 22 / 0.5)",
                      color: "oklch(0.55 0.12 22)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    GIVE UP
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── RANK REVEAL (after Level 1) ── */}
            {gameState === "rankreveal" && (
              <motion.div
                key="rankreveal"
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="flex flex-col items-center justify-center min-h-[420px] gap-6"
                data-ocid="game.dialog"
              >
                <div
                  className="relative flex flex-col items-center justify-center gap-4 rounded-2xl px-8 py-8"
                  style={{
                    background: "oklch(0.13 0.018 220 / 0.97)",
                    border: "2px solid oklch(0.65 0.22 32 / 0.8)",
                    boxShadow:
                      "0 0 80px oklch(0.65 0.22 32 / 0.4), 0 0 160px oklch(0.60 0.23 22 / 0.2)",
                    minWidth: "min(400px, 90vw)",
                    width: "min(520px, 92vw)",
                  }}
                >
                  {/* Spinning trophies */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    style={{
                      position: "absolute",
                      top: -24,
                      right: -24,
                      fontSize: "2.5rem",
                      opacity: 0.6,
                    }}
                  >
                    🏆
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 7,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    style={{
                      position: "absolute",
                      bottom: -18,
                      left: -18,
                      fontSize: "2rem",
                      opacity: 0.5,
                    }}
                  >
                    🥊
                  </motion.div>

                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-display text-center"
                    style={{
                      fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                      color: "oklch(0.80 0.18 80)",
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                      textShadow: "0 0 30px oklch(0.80 0.18 80 / 0.7)",
                    }}
                  >
                    LEVEL 1 COMPLETE!
                  </motion.div>

                  {/* Score */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="text-center"
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "oklch(0.55 0.01 250)" }}
                    >
                      Your Score
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: "clamp(2.5rem, 7vw, 4rem)",
                        color: "oklch(0.65 0.22 32)",
                        textShadow: "0 0 20px oklch(0.65 0.22 32 / 0.7)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {score.toLocaleString()}
                    </div>
                  </motion.div>

                  {/* Rank comparison */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="w-full"
                  >
                    {rankData ? (
                      <>
                        {/* Big rank text */}
                        <div
                          className="font-display text-center mb-3"
                          style={{
                            fontSize: "clamp(1.3rem, 4vw, 2rem)",
                            color:
                              rankData.rank <= 3
                                ? "oklch(0.80 0.18 80)"
                                : "oklch(0.90 0.05 250)",
                            textShadow:
                              rankData.rank <= 3
                                ? "0 0 20px oklch(0.80 0.18 80 / 0.6)"
                                : "none",
                            letterSpacing: "0.06em",
                          }}
                        >
                          #{rankData.rank} out of {rankData.total} players
                        </div>
                        <div
                          className="font-display text-center mb-4"
                          style={{
                            fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
                            color: "oklch(0.72 0.22 145)",
                            textShadow: "0 0 16px oklch(0.72 0.22 145 / 0.6)",
                            letterSpacing: "0.05em",
                          }}
                        >
                          You beat {rankData.beatenPct}% of players! 🔥
                        </div>

                        {/* Mini leaderboard */}
                        <div
                          className="rounded-xl overflow-hidden"
                          style={{ border: "1px solid oklch(0.25 0.02 220)" }}
                        >
                          <div
                            className="font-display text-center py-2 text-xs tracking-widest uppercase"
                            style={{
                              background: "oklch(0.16 0.018 220)",
                              color: "oklch(0.55 0.01 250)",
                            }}
                          >
                            TOP PLAYERS
                          </div>
                          {topScores?.slice(0, 5).map((entry, i) => {
                            const entryScore = Number(entry.score);
                            const isMe = entryScore === score && score > 0;
                            return (
                              <div
                                key={`rank-${entry.playerName}-${i}`}
                                data-ocid={`game.row.${i + 1}`}
                                className="flex items-center gap-2 px-3 py-2"
                                style={{
                                  background: isMe
                                    ? "oklch(0.65 0.22 32 / 0.18)"
                                    : i % 2 === 0
                                      ? "oklch(0.14 0.016 220)"
                                      : "oklch(0.12 0.014 220)",
                                  borderLeft: isMe
                                    ? "3px solid oklch(0.65 0.22 32)"
                                    : "3px solid transparent",
                                }}
                              >
                                <span
                                  className="font-display text-sm w-6 shrink-0"
                                  style={{
                                    color:
                                      i === 0
                                        ? "oklch(0.80 0.18 80)"
                                        : "oklch(0.45 0.01 250)",
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <span
                                  className="flex-1 text-sm font-semibold truncate"
                                  style={{
                                    color: isMe
                                      ? "oklch(0.90 0.05 250)"
                                      : "oklch(0.70 0.01 250)",
                                  }}
                                >
                                  {entry.playerName || "—"}
                                  {isMe && (
                                    <span
                                      style={{
                                        color: "oklch(0.65 0.22 32)",
                                        marginLeft: 4,
                                      }}
                                    >
                                      ← YOU
                                    </span>
                                  )}
                                </span>
                                <span
                                  className="font-display text-sm"
                                  style={{
                                    color: isMe
                                      ? "oklch(0.65 0.22 32)"
                                      : "oklch(0.55 0.10 32)",
                                  }}
                                >
                                  {entryScore.toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div
                        className="text-center py-4 font-semibold"
                        style={{
                          color: "oklch(0.72 0.22 145)",
                          fontSize: "1.1rem",
                        }}
                      >
                        🔥 You&apos;re blazing a trail! First on the board!
                      </div>
                    )}
                  </motion.div>

                  <div
                    className="text-sm text-center"
                    style={{ color: "oklch(0.45 0.01 250)" }}
                  >
                    Next level starting soon...
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── LEVEL UP SCREEN ── */}
            {gameState === "levelup" && (
              <motion.div
                key="levelup"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="flex flex-col items-center justify-center min-h-[420px] gap-6"
                data-ocid="game.dialog"
              >
                <div
                  className="relative flex flex-col items-center justify-center gap-5 rounded-2xl px-10 py-10"
                  style={{
                    background: "oklch(0.13 0.018 220 / 0.97)",
                    border: "2px solid oklch(0.80 0.18 80 / 0.7)",
                    boxShadow:
                      "0 0 80px oklch(0.80 0.18 80 / 0.35), 0 0 160px oklch(0.80 0.18 80 / 0.15)",
                    minWidth: "min(420px, 90vw)",
                    width: "min(500px, 90vw)",
                  }}
                >
                  {/* Animated star burst */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    style={{
                      position: "absolute",
                      top: -30,
                      right: -30,
                      fontSize: "3rem",
                      opacity: 0.5,
                    }}
                  >
                    ⭐
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 6,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    style={{
                      position: "absolute",
                      bottom: -20,
                      left: -20,
                      fontSize: "2rem",
                      opacity: 0.4,
                    }}
                  >
                    ⚡
                  </motion.div>

                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="font-display text-center"
                    style={{
                      fontSize: "clamp(2.5rem, 8vw, 5rem)",
                      color: "oklch(0.80 0.18 80)",
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                      textShadow: "0 0 40px oklch(0.80 0.18 80 / 0.7)",
                    }}
                  >
                    LEVEL UP!
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="font-display"
                    style={{
                      fontSize: "clamp(3rem, 10vw, 6rem)",
                      color: "oklch(0.90 0.05 250)",
                      letterSpacing: "0.08em",
                      lineHeight: 1,
                    }}
                  >
                    LEVEL {level + 1}
                  </motion.div>

                  {/* Hype line */}
                  <motion.div
                    key={hypeLineIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="font-display text-center px-4"
                    style={{
                      fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
                      color: "oklch(0.72 0.20 50)",
                      letterSpacing: "0.06em",
                      textShadow:
                        "0 0 20px oklch(0.72 0.20 50 / 0.7), 0 0 40px oklch(0.65 0.22 32 / 0.4)",
                      lineHeight: 1.2,
                    }}
                  >
                    {hypeLineIndex < 0
                      ? PREMIUM_HYPE_LINES[-(hypeLineIndex + 1)]
                      : HYPE_LINES[hypeLineIndex]}
                  </motion.div>
                  <div className="text-center">
                    <div
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "oklch(0.55 0.01 250)" }}
                    >
                      Score so far
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: "clamp(1.8rem, 5vw, 3rem)",
                        color: "oklch(0.80 0.18 80)",
                        textShadow: "0 0 16px oklch(0.80 0.18 80 / 0.5)",
                      }}
                    >
                      {score.toLocaleString()}
                    </div>
                  </div>

                  {/* Difficulty preview */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="px-4 py-2 rounded-lg text-sm text-center"
                    style={{
                      background: "oklch(0.80 0.18 80 / 0.08)",
                      border: "1px solid oklch(0.80 0.18 80 / 0.25)",
                      color: "oklch(0.75 0.12 80)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    🔥 Objects smash {Math.min(30, level * 30)}% faster ·{" "}
                    {level + 1 >= 3
                      ? `+${Math.round(Math.max(0, level - 1) * 0.15 * 100)}% point bonus`
                      : "Point bonuses unlock at Level 3"}
                  </motion.div>

                  {/* Countdown */}
                  <motion.div
                    key={levelUpCountdown}
                    initial={{ scale: 1.4, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="font-display"
                    style={{
                      fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                      color:
                        levelUpCountdown <= 1
                          ? "oklch(0.65 0.22 32)"
                          : "oklch(0.60 0.02 250)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {levelUpCountdown > 0
                      ? `Next level in ${levelUpCountdown}...`
                      : "GET READY!"}
                  </motion.div>

                  {!isPremium && (
                    <button
                      type="button"
                      data-ocid="game.secondary_button"
                      onClick={() => setRagePassOpen(true)}
                      style={{
                        color: "oklch(0.75 0.16 85)",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      👑 Get 15 more seconds with Rage Pass
                    </button>
                  )}
                </div>
                <AdBanner />
              </motion.div>
            )}

            {/* ── GAME OVER ── */}
            {gameState === "gameover" && (
              <motion.div
                key="gameover"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "backOut" }}
                className="flex flex-col items-center justify-center min-h-[420px] gap-6"
                data-ocid="game.modal"
              >
                {/* Glow ring */}
                <div
                  className="relative flex flex-col items-center justify-center gap-5 rounded-2xl px-10 py-10"
                  style={{
                    background: "oklch(0.13 0.018 220 / 0.95)",
                    border: "2px solid oklch(0.65 0.22 32 / 0.6)",
                    boxShadow:
                      "0 0 60px oklch(0.65 0.22 32 / 0.25), 0 0 120px oklch(0.60 0.23 22 / 0.1)",
                    minWidth: "min(420px, 90vw)",
                    width: "min(460px, 90vw)",
                  }}
                >
                  <div
                    className="font-display text-center"
                    style={{
                      fontSize: "clamp(2.5rem, 8vw, 5rem)",
                      color: "oklch(0.60 0.23 22)",
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                      textShadow: "0 0 30px oklch(0.60 0.23 22 / 0.6)",
                    }}
                  >
                    GAME OVER
                  </div>

                  <div className="text-center">
                    <div
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "oklch(0.55 0.01 250)" }}
                    >
                      Final Score
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
                        color: "oklch(0.90 0.05 250)",
                        textShadow: "0 0 20px oklch(0.90 0.05 250 / 0.4)",
                        letterSpacing: "0.04em",
                      }}
                      data-ocid="game.success_state"
                    >
                      {score.toLocaleString()}
                    </div>
                  </div>

                  {/* Level reached */}
                  <div
                    className="flex items-center gap-3 px-5 py-2 rounded-xl"
                    style={{
                      background: "oklch(0.80 0.18 80 / 0.1)",
                      border: "1px solid oklch(0.80 0.18 80 / 0.35)",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>🏆</span>
                    <div className="text-center">
                      <div
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "oklch(0.65 0.12 80)" }}
                      >
                        Level Reached
                      </div>
                      <div
                        className="font-display"
                        style={{
                          fontSize: "1.8rem",
                          color: "oklch(0.80 0.18 80)",
                          textShadow: "0 0 12px oklch(0.80 0.18 80 / 0.5)",
                          letterSpacing: "0.06em",
                          lineHeight: 1,
                        }}
                      >
                        {level}
                      </div>
                    </div>
                  </div>

                  {/* ── TOP SCORES ── */}
                  <div
                    className="w-full"
                    style={{
                      borderTop: "1px solid oklch(0.22 0.02 220)",
                      paddingTop: "12px",
                    }}
                    data-ocid="game.table"
                  >
                    <div
                      className="font-display text-center mb-2 tracking-widest text-sm"
                      style={{ color: "oklch(0.65 0.22 32)" }}
                    >
                      TOP SCORES
                    </div>
                    {!topScores || topScores.length === 0 ? (
                      <div
                        className="text-center text-xs py-2"
                        style={{ color: "oklch(0.45 0.01 250)" }}
                        data-ocid="game.empty_state"
                      >
                        No scores yet — be the first!
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {topScores.slice(0, 5).map((entry, i) => {
                          const isCurrentScore =
                            Number(entry.score) === score && score > 0;
                          return (
                            <div
                              key={`top-${entry.playerName}-${Number(entry.score)}`}
                              data-ocid={`game.row.${i + 1}`}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                              style={{
                                background: isCurrentScore
                                  ? "oklch(0.65 0.22 32 / 0.15)"
                                  : i === 0
                                    ? "oklch(0.80 0.18 80 / 0.08)"
                                    : "oklch(0.15 0.016 220)",
                                border: isCurrentScore
                                  ? "1px solid oklch(0.65 0.22 32 / 0.5)"
                                  : "1px solid transparent",
                              }}
                            >
                              <span
                                className="font-display text-sm w-5 shrink-0"
                                style={{
                                  color:
                                    i === 0
                                      ? "oklch(0.80 0.18 80)"
                                      : "oklch(0.45 0.01 250)",
                                }}
                              >
                                {i + 1}
                              </span>
                              <span
                                className="flex-1 text-xs font-semibold truncate"
                                style={{
                                  color: isCurrentScore
                                    ? "oklch(0.90 0.05 250)"
                                    : "oklch(0.70 0.01 250)",
                                }}
                              >
                                {entry.playerName || "—"}
                                {isCurrentScore && (
                                  <span
                                    className="ml-1"
                                    style={{ color: "oklch(0.65 0.22 32)" }}
                                  >
                                    ← you
                                  </span>
                                )}
                              </span>
                              <span
                                className="font-display text-sm shrink-0"
                                style={{
                                  color: isCurrentScore
                                    ? "oklch(0.80 0.18 80)"
                                    : "oklch(0.65 0.22 32)",
                                }}
                              >
                                {Number(entry.score).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    data-ocid="game.confirm_button"
                    onClick={startGame}
                    className="flex items-center gap-3 px-8 py-3 rounded-full font-display tracking-wider uppercase transition-all duration-200 active:scale-95 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.22 32), oklch(0.55 0.24 18))",
                      color: "oklch(0.98 0.005 0)",
                      boxShadow:
                        "0 0 24px oklch(0.65 0.22 32 / 0.6), 0 0 48px oklch(0.60 0.23 22 / 0.3)",
                      fontSize: "1.2rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    <Zap size={20} fill="currentColor" />
                    PLAY AGAIN
                  </button>

                  {/* Rage Pass upsell */}
                  {!isPremium && (
                    <button
                      type="button"
                      data-ocid="game.open_modal_button"
                      onClick={() => setRagePassOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full font-display tracking-wider uppercase transition-all duration-200 active:scale-95 hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.72 0.16 85), oklch(0.62 0.18 75))",
                        color: "oklch(0.12 0.01 80)",
                        boxShadow:
                          "0 0 20px oklch(0.72 0.16 85 / 0.5), 0 0 40px oklch(0.72 0.16 85 / 0.2)",
                        fontSize: "0.95rem",
                        letterSpacing: "0.08em",
                        fontWeight: 800,
                      }}
                    >
                      ✨ Upgrade to Rage Pass — $2.99
                    </button>
                  )}

                  <p
                    className="text-xs tracking-wide"
                    style={{ color: "oklch(0.45 0.01 250)" }}
                  >
                    Submit your score via the Leaderboard button above
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Combo display */}
      <AnimatePresence>
        {showCombo && combo > 1 && (
          <div
            key={comboKey}
            className="combo-display fixed bottom-20 z-30"
            style={{
              left: "50%",
              animation: "combo-pop 1.2s ease-out forwards",
              pointerEvents: "none",
            }}
          >
            <div
              className="font-display text-center px-6 py-2 rounded-full"
              style={{
                background: "oklch(0.14 0.018 220 / 0.9)",
                border: "2px solid oklch(0.80 0.18 80)",
                boxShadow: "0 0 20px oklch(0.80 0.18 80 / 0.5)",
                color: "oklch(0.80 0.18 80)",
                fontSize: "2.2rem",
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}
            >
              {combo}x COMBO!
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Rage Pass Modal */}
      <RagePassModal
        open={ragePassOpen}
        onClose={() => setRagePassOpen(false)}
        playerName={playerName}
      />

      {/* Footer */}
      <footer
        className="relative z-10 py-4 text-center text-xs"
        style={{
          color: "oklch(0.40 0.01 250)",
          borderTop: "1px solid oklch(0.18 0.015 220)",
        }}
      >
        <span>
          {onAbout && (
            <button
              type="button"
              onClick={onAbout}
              style={{
                color: "oklch(0.55 0.01 250)",
                textDecoration: "underline",
                marginRight: "12px",
              }}
            >
              About
            </button>
          )}
          © {new Date().getFullYear()} DEEPANSHU DHINGRA. Built with{" "}
          <span style={{ color: "oklch(0.60 0.23 22)" }}>♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "oklch(0.55 0.01 250)",
              textDecoration: "underline",
            }}
          >
            caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}

// ─── SmashCard ────────────────────────────────────────────────────────────────

interface SmashCardProps {
  slot: ObjectSlot;
  onSmash: (e: React.MouseEvent) => void;
  level: number;
}

function SmashCard({ slot, onSmash, level }: SmashCardProps) {
  const obj = getObjDef(slot.objType);
  const pointMultiplier = 1 + Math.max(0, level - 2) * 0.15;
  const displayPoints = Math.round(obj.points * pointMultiplier);

  const animClass =
    slot.state === "smashing"
      ? "object-card-smashing"
      : slot.state === "respawning"
        ? "object-card-respawning"
        : "object-card-idle";

  return (
    <button
      type="button"
      data-ocid="game.canvas_target"
      onClick={slot.state === "idle" ? onSmash : undefined}
      disabled={slot.state !== "idle"}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl p-5 select-none transition-transform duration-100 ${animClass}`}
      style={{
        background: "oklch(0.14 0.018 220)",
        border: "1px solid oklch(0.65 0.22 32 / 0.35)",
        boxShadow:
          "0 0 12px oklch(0.65 0.22 32 / 0.2), inset 0 1px 0 oklch(0.25 0.02 220 / 0.5)",
        cursor: slot.state === "idle" ? "crosshair" : "default",
        minHeight: "140px",
      }}
    >
      {/* Corner accent */}
      <div
        className="absolute top-0 left-0 w-6 h-6 rounded-tl-xl"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.22 32 / 0.4), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-6 h-6 rounded-br-xl"
        style={{
          background:
            "linear-gradient(315deg, oklch(0.65 0.22 32 / 0.25), transparent)",
        }}
      />

      {/* Emoji */}
      <span
        style={{
          fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
          lineHeight: 1,
          filter: "drop-shadow(0 0 8px oklch(0.65 0.22 32 / 0.5))",
        }}
        role="img"
        aria-label={obj.label}
      >
        {obj.emoji}
      </span>

      {/* Label */}
      <span
        className="font-display uppercase tracking-widest"
        style={{
          fontSize: "0.9rem",
          color: "oklch(0.70 0.01 250)",
          letterSpacing: "0.08em",
        }}
      >
        {obj.label}
      </span>

      {/* Points */}
      <span
        className="font-display"
        style={{
          fontSize: "0.8rem",
          color: "oklch(0.65 0.22 32)",
          letterSpacing: "0.06em",
        }}
      >
        {displayPoints} pts
      </span>

      {/* State overlay */}
      {slot.state === "smashing" && (
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{
            background: "oklch(0.65 0.22 32 / 0.25)",
            fontSize: "3rem",
          }}
        >
          💥
        </div>
      )}
      {slot.state === "respawning" && (
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{
            background: "oklch(0.14 0.018 220 / 0.8)",
            fontSize: "1.5rem",
          }}
        >
          ✨
        </div>
      )}
    </button>
  );
}
