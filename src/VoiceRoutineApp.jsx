import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import "./VoiceRoutineApp.css";

/* ------------------------------------------------------------------ data */
const EXERCISES = [
  {
    id: 1,
    name: "Belly Breathing with “Ssss” Sound",
    duration: 180, // Reduced from 600 to 180 (3 minutes)
    benefit: "Trains proper breath support, control, and calmness.",
    reps: 5,
    repDuration: 36, // 180s total / 5 reps
    breakAfter: 15,
  },
  {
    id: 2,
    name: "Jaw & Neck Relaxation",
    duration: 180,
    benefit: "Removes throat tension for a fuller, deeper voice.",
    reps: 4,
    repDuration: 45,
    breakAfter: 15,
  },
  {
    id: 3,
    name: 'Lip Trills ("Brrr…")',
    duration: 180,
    benefit: "Loosens vocal cords, builds smooth pitch control.",
    reps: 6,
    repDuration: 30,
    breakAfter: 15,
  },
  {
    id: 4,
    name: 'Humming ("Mmm…")',
    duration: 180,
    benefit: "Activates chest resonance, adds richness.",
    reps: 5,
    repDuration: 36,
    breakAfter: 15,
  },
  { 
    id: 5, 
    name: "Sirens (Pitch Glide)", 
    duration: 180, 
    benefit: "Expands range, improves vocal flexibility.",
    reps: 4,
    repDuration: 45,
    breakAfter: 15,
  },
  { 
    id: 6, 
    name: "Chest Resonance Drill", 
    duration: 180, 
    benefit: "Trains grounded, deep, manly tone.",
    reps: 5,
    repDuration: 36,
    breakAfter: 15,
  },
  { 
    id: 7, 
    name: 'Yawn-Sigh ("Haaah")', 
    duration: 180, 
    benefit: "Opens the throat for a relaxed deep sound.",
    reps: 4,
    repDuration: 45,
    breakAfter: 15,
  },
  { 
    id: 8, 
    name: "Low Humming", 
    duration: 180, 
    benefit: "Calms cords and reinforces muscle memory.",
    reps: 5,
    repDuration: 36,
    breakAfter: 15,
  },
  { 
    id: 9, 
    name: "Silent Stretch & Breath", 
    duration: 180, 
    benefit: "Relaxes body and prevents tightness.",
    reps: 1,
    repDuration: 180,
    breakAfter: 0,
  },
];

/* ---------------------------------------------------------------- helpers */
const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* --------------------------------------------------------------- ui bits */
const Button = ({ icon, variant = "secondary", className = "", children, ...rest }) => {
  const base = "btn";
  const variants = { primary: "btn-primary", secondary: "btn-secondary", ghost: "btn-ghost" };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
};

const ProgressBar = ({ value, color = "linear-gradient(to right, var(--purple-500), var(--blue-500))" }) => (
  <div className="progress-bar">
    <motion.div
      className="progress-bar-inner"
      animate={{ width: `${value}%` }}
      style={{ background: color }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  </div>
);

const RepCounter = ({ currentRep, totalReps }) => (
  <div className="rep-counter">
    <span className="rep-label">Rep</span>
    <span className="rep-value">{currentRep}/{totalReps}</span>
  </div>
);

/* ------------------------------------------------------------ component */
const VoiceRoutineApp = () => {
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXERCISES[0].repDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRep, setCurrentRep] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  /* Play sound effects */
  const playSound = (type) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(type === 'start' 
      ? 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3' 
      : 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'
    );
    audioRef.current = audio;
    audio.play();
  };

  /* timer effect */
  useEffect(() => {
    if (!isRunning) return;
    
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else {
      // Handle exercise rep completion
      if (!isBreak && currentRep < EXERCISES[step].reps) {
        // Start break between reps
        setIsBreak(true);
        setTimeLeft(15); // 15-second break
        playSound('complete');
      } 
      // Handle break completion
      else if (isBreak) {
        // Move to next rep
        setIsBreak(false);
        setCurrentRep((rep) => rep + 1);
        setTimeLeft(EXERCISES[step].repDuration);
        playSound('start');
      } 
      // Handle exercise completion
      else {
        // Start break after exercise
        if (step < EXERCISES.length - 1 && EXERCISES[step].breakAfter > 0) {
          setIsBreak(true);
          setTimeLeft(EXERCISES[step].breakAfter);
          playSound('complete');
        } 
        // Move to next exercise
        else {
          if (step < EXERCISES.length - 1) {
            setStep((s) => s + 1);
            setCurrentRep(1);
            setTimeLeft(EXERCISES[step + 1].repDuration);
            setIsBreak(false);
            playSound('start');
          } else {
            setIsRunning(false);
          }
        }
      }
    }
    
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [isRunning, step, timeLeft, currentRep, isBreak]);

  /* derived */
  const current = EXERCISES[step];
  const progress = useMemo(() => {
    const total = isBreak 
      ? (current.breakAfter || 15) 
      : current.repDuration;
    return ((total - timeLeft) / total) * 100;
  }, [current, timeLeft, isBreak]);

  const routineCompletion = useMemo(() => 
    Math.floor(((step + (currentRep / current.reps)) / EXERCISES.length) * 100), 
    [step, currentRep, current.reps]
  );

  /* handlers */
  const startPause = useCallback(() => {
    setIsRunning((r) => !r);
    if (!isRunning) playSound('start');
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setStep(0);
    setCurrentRep(1);
    setTimeLeft(EXERCISES[0].repDuration);
    setIsBreak(false);
  }, []);

  const goToStep = useCallback((n) => {
    if (n < 0 || n >= EXERCISES.length) return;
    setStep(n);
    setCurrentRep(1);
    setTimeLeft(EXERCISES[n].repDuration);
    setIsBreak(false);
    setIsRunning(false);
  }, []);

  /* render */
  return (
    <div className="app-container">
      <div className="content">
        {/* title */}
        <motion.h1
          className="title gradient-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          🎙️ Deep Voice Trainer
        </motion.h1>

        {/* exercise card */}
        <motion.section
          className={`exercise-card ${isBreak ? 'break-mode' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="exercise-header">
            <h2 className="exercise-title">
              <span className="icon-box">
                {isBreak ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
                    <path d="M17.294 7.291a1 1 0 011.412 1.416l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 14.586l7.294-7.293z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                  </svg>
                )}
              </span>
              {isBreak ? "Break Time" : current.name}
            </h2>
            <div className="step-info">
              <span className="step-count">
                {step + 1}/{EXERCISES.length}
              </span>
              {!isBreak && current.reps > 1 && (
                <RepCounter currentRep={currentRep} totalReps={current.reps} />
              )}
            </div>
          </header>

          {isBreak ? (
            <div className="break-content">
              <p className="benefit">Rest your voice before the next {currentRep < current.reps ? "rep" : "exercise"}</p>
              <div className="break-timer-container">
                <motion.div 
                  className="break-circle"
                  animate={{ scale: [0.8, 1, 0.8] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.p
                    key={timeLeft}
                    className="timer break-timer"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.p>
                </motion.div>
              </div>
              <p className="break-tip">
                Tip: {currentRep < current.reps 
                  ? "Relax your jaw and neck muscles" 
                  : "Take deep breaths and stay hydrated"}
              </p>
            </div>
          ) : (
            <>
              <p className="benefit">{current.benefit}</p>
              <div className="progress-container">
                <ProgressBar 
                  value={progress} 
                  color={isBreak 
                    ? "linear-gradient(to right, #10b981, #22d3ee)" 
                    : "linear-gradient(to right, var(--purple-500), var(--blue-500))"}
                />
                <div className="time-info">
                  <span>0:00</span>
                  <span>{formatTime(current.repDuration)}</span>
                </div>
              </div>
              <motion.p
                key={timeLeft}
                className="timer"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatTime(timeLeft)}
              </motion.p>
            </>
          )}

          {/* controls */}
          <div className="controls-grid">
            <Button
              onClick={() => goToStep(step - 1)}
              disabled={step === 0}
              icon={
                <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
                  <path d="M9.707 16.707a1 1 0 01-1.414 0l-6-6 6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
                </svg>
              }
            >
              Previous
            </Button>

            <Button
              onClick={startPause}
              variant={isBreak ? "secondary" : "primary"}
              icon={
                isRunning ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8h2v4H7zm4 0h2v4h-2z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.12-9.168A1 1 0 008 10v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
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
                <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
                  <path d="M10.293 3.293a1 1 0 011.414 0l6 6-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                </svg>
              }
            >
              Next
            </Button>

            <Button
              onClick={reset}
              icon={
                <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
                  <path d="M4 2a1 1 0 011 1v2.1A7.002 7.002 0 0116.6 7.666a1 1 0 01-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.1a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                </svg>
              }
            >
              Reset
            </Button>
          </div>
        </motion.section>

        {/* routine progress */}
        <div className="routine-completion">
          <span className="completion-dot" />
          {Math.min(100, routineCompletion)}% complete
          <div className="time-saved">
            <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Time saved: 42 min
          </div>
        </div>

        {/* roadmap / coming-soon */}
        <motion.section
          className="roadmap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <header className="roadmap-header">
            <span className="icon-box gradient-bg">
              <svg viewBox="0 0 20 20" fill="currentColor" className="icon white">
                <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
              </svg>
            </span>
            <h3 className="roadmap-title">Coming Soon</h3>
          </header>

          <ul className="roadmap-list">
            <li>📈 Weekly progress graph (voice depth & consistency)</li>
            <li>🎤 Voice recorder with playback & comparison</li>
            <li>💡 Daily tips based on progress</li>
            <li>📅 30-Day Deep Voice Challenge calendar</li>
            <li>🔔 Smart reminders and motivation quotes</li>
          </ul>
        </motion.section>
      </div>
    </div>
  );
};

export default VoiceRoutineApp;