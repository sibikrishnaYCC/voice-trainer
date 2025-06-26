import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

/**
 * Each exercise lasts 10 min (600 s). Add/adjust here to update the whole UI.
 */
const EXERCISES = [
  {
    id: 1,
    name: "Belly Breathing with “Ssss” Sound",
    duration: 600,
    benefit: "Trains proper breath support, control, and calmness.",
  },
  {
    id: 2,
    name: "Jaw & Neck Relaxation",
    duration: 600,
    benefit: "Removes throat tension for a fuller, deeper voice.",
  },
  {
    id: 3,
    name: "Lip Trills (\"Brrr...\")",
    duration: 600,
    benefit: "Loosens vocal cords, builds smooth pitch control.",
  },
  {
    id: 4,
    name: "Humming (\"Mmm…\")",
    duration: 600,
    benefit: "Activates chest resonance, adds richness.",
  },
  {
    id: 5,
    name: "Sirens (Pitch Glide)",
    duration: 600,
    benefit: "Expands range, improves vocal flexibility.",
  },
  {
    id: 6,
    name: "Chest Resonance Drill",
    duration: 600,
    benefit: "Trains grounded, deep, manly tone.",
  },
  {
    id: 7,
    name: "Yawn‑Sigh (\"Haaah\")",
    duration: 600,
    benefit: "Opens the throat for a relaxed deep sound.",
  },
  {
    id: 8,
    name: "Low Humming",
    duration: 600,
    benefit: "Calms cords and reinforces muscle memory.",
  },
  {
    id: 9,
    name: "Silent Stretch & Breath",
    duration: 600,
    benefit: "Relaxes body and prevents tightness.",
  },
] as const;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Format seconds → “m:ss” */
function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// -----------------------------------------------------------------------------
// Reusable UI pieces
// -----------------------------------------------------------------------------

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  variant = "secondary",
  className = "",
  ...rest
}) => {
  const base =
    "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all";

  const variants = {
    primary: `bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90`,
    secondary: `bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed`,
    ghost: `bg-transparent text-gray-300 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed`,
  } as const;

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
};

interface ProgressBarProps {
  /** 0 → 100 */
  value: number;
}
const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => (
  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
    <motion.div
      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500"
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  </div>
);

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------

const VoiceRoutineApp: React.FC = () => {
  /* --------------------------------- state -------------------------------- */
  const [step, setStep] = useState(0); // index inside EXERCISES
  const [timeLeft, setTimeLeft] = useState(EXERCISES[0].duration);
  const [isRunning, setIsRunning] = useState(false);

  /* -------------------------------- ref/timer ------------------------------ */
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* -------------------------------- effect -------------------------------- */
  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (step < EXERCISES.length - 1) {
      /* next exercise */
      setStep((s) => s + 1);
      setTimeLeft(EXERCISES[step + 1].duration);
    } else {
      /* finished routine */
      setIsRunning(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, step, timeLeft]);

  /* ------------------------------ derived data ----------------------------- */
  const current = EXERCISES[step];

  const progress = useMemo(
    () => ((current.duration - timeLeft) / current.duration) * 100,
    [current.duration, timeLeft]
  );

  const routineCompletion = useMemo(
    () => Math.floor(((step + 1) / EXERCISES.length) * 100),
    [step]
  );

  /* -------------------------------- actions ------------------------------- */
  const startPause = useCallback(() => setIsRunning((r) => !r), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setStep(0);
    setTimeLeft(EXERCISES[0].duration);
  }, []);

  const goToStep = useCallback((newStep: number) => {
    setStep(newStep);
    setTimeLeft(EXERCISES[newStep].duration);
    setIsRunning(false);
  }, []);

  /* --------------------------------- render ------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-gray-200 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full">
        {/* --------------------------------------------------------- title */}
        <motion.h1
          className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          🎙️ Deep Voice Trainer
        </motion.h1>

        {/* ------------------------------------------------- exercise card */}
        <motion.section
          className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* header */}
          <header className="flex justify-between items-center mb-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              {/* small icon */}
              <span className="bg-gray-800 p-2 rounded-lg">
                {/* clock icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {current.name}
            </h2>
            <span className="text-sm bg-gray-900 px-3 py-1 rounded-full">
              {step + 1}/{EXERCISES.length}
            </span>
          </header>

          {/* benefit */}
          <p className="text-gray-400 italic mb-6">{current.benefit}</p>

          {/* progress bar */}
          <ProgressBar value={progress} />

          {/* timer */}
          <motion.p
            key={timeLeft}
            className="text-5xl font-mono text-center my-8 text-blue-300"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatTime(timeLeft)}
          </motion.p>

          {/* controls */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => goToStep(step - 1)}
              disabled={step === 0}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              Previous
            </Button>

            <Button
              onClick={startPause}
              variant="primary"
              icon={
                isRunning ? (
                  // pause icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  // play icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              }
            >
              {isRunning ? "Pause" : "Start"}
            </Button>

            <Button
              onClick={() => goToStep(step + 1)}
              disabled={step === EXERCISES.length - 1}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              Next
            </Button>

            <Button onClick={reset} icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            }>Reset</Button>
          </div>
        </motion.section>

        {/* ----------------------------------------------------- routine % */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          {routineCompletion}% complete
        </div>

        {/* ----------------------------------------------------- roadmap */}
        <motion.section
          className="bg-[#111] border border-gray-800 rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <header className="flex items-center gap-2 mb-4">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 p-1.5 rounded-lg">
              {/* sparkles icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <h3 className="text-lg font-semibold">Coming Soon</h3>
          </header>

          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex gap-3 items-start">
              <span className="bg-gray-900 p-1.5 rounded-lg">
                {/* chart icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              📈 Weekly progress graph (voice depth & consistency)
            </li>
            <li className="flex gap-3 items-start">
              <span className="bg-gray-900 p-1.5 rounded-lg">
                {/* mic icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              🎤 Voice recorder with playback & comparison
            </li>
            <li className="flex gap-3 items-start">
              <span className="bg-gray-900 p-1.5 rounded-lg">
                {/* light-bulb icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              💡 Daily tips based on progress
            </li>
            <li className="flex gap-3 items-start">
              <span className="bg-gray-900 p-1.5 rounded-lg">
                {/* calendar icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              📅 30‑Day Deep Voice Challenge calendar
            </li>
            <li className="flex gap-3 items-start">
              <span className="bg-gray-900 p-1.5 rounded-lg">
                {/* bell icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </span>
              🔔 Smart reminders and motivation quotes
            </li>
          </ul>
        </motion.section>
      </div>
    </div>
  );
};

export default VoiceRoutineAppTailwind;
