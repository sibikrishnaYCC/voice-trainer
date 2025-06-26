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
    name: "Belly Breathing",
    duration: 180,
    benefit: "Trains proper breath support and control",
    reps: 5,
    repDuration: 36,
    breakAfter: 15,
    icon: "🌬️",
    description: "Focus on deep diaphragmatic breathing to strengthen core support for your voice."
  },
  {
    id: 2,
    name: "Jaw Relaxation",
    duration: 180,
    benefit: "Removes throat tension for deeper voice",
    reps: 4,
    repDuration: 45,
    breakAfter: 15,
    icon: "💆",
    description: "Gentle massage and stretching techniques to release jaw tension."
  },
  {
    id: 3,
    name: "Lip Trills",
    duration: 180,
    benefit: "Loosens vocal cords, builds pitch control",
    reps: 6,
    repDuration: 30,
    breakAfter: 15,
    icon: "👄",
    description: "Vibrate lips while exhaling to warm up vocal cords and improve resonance."
  },
  {
    id: 4,
    name: "Humming",
    duration: 180,
    benefit: "Activates chest resonance",
    reps: 5,
    repDuration: 36,
    breakAfter: 15,
    icon: "🎶",
    description: "Sustain gentle hums at different pitches to develop chest resonance."
  },
  {
    id: 5,
    name: "Sirens",
    duration: 180,
    benefit: "Expands vocal range and flexibility",
    reps: 4,
    repDuration: 45,
    breakAfter: 15,
    icon: "📈",
    description: "Glide smoothly from your lowest to highest pitch to expand vocal range."
  },
  {
    id: 6,
    name: "Chest Resonance",
    duration: 180,
    benefit: "Trains grounded, deep tone",
    reps: 5,
    repDuration: 36,
    breakAfter: 15,
    icon: "🎤",
    description: "Practice speaking with chest vibrations to develop a rich, deep tone."
  },
  {
    id: 7,
    name: "Yawn-Sigh",
    duration: 180,
    benefit: "Opens throat for relaxed sound",
    reps: 4,
    repDuration: 45,
    breakAfter: 15,
    icon: "😌",
    description: "Imitate a yawn followed by a sigh to release tension and open the throat."
  },
  {
    id: 8,
    name: "Low Humming",
    duration: 180,
    benefit: "Calms cords and builds memory",
    reps: 5,
    repDuration: 36,
    breakAfter: 15,
    icon: "🔊",
    description: "Sustain low-pitched hums to strengthen vocal cord closure and resonance."
  },
  {
    id: 9,
    name: "Silent Stretch",
    duration: 180,
    benefit: "Relaxes body and prevents tightness",
    reps: 1,
    repDuration: 180,
    breakAfter: 0,
    icon: "🧘",
    description: "Gentle stretches and breathing exercises to release tension in the body."
  },
];

const ROADMAP_EXERCISES = [
  {
    id: 10,
    name: "Resonance Boost",
    description: "Advanced exercises to amplify vocal resonance.",
    icon: "📢"
  },
  {
    id: 11,
    name: "Pitch Control Drills",
    description: "Targeted drills to refine and expand your vocal pitch range.",
    icon: "🎼"
  },
  {
    id: 12,
    name: "Breath Capacity Training",
    description: "Techniques to increase lung capacity for sustained vocalization.",
    icon: "💨"
  },
  {
    id: 13,
    name: "Vocal Stamina Workout",
    description: "Build endurance for long speaking or singing sessions.",
    icon: "🔋"
  }
];

/* ---------------------------------------------------------------- helpers */
const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* --------------------------------------------------------------- ui bits */
const Button = ({ icon, variant = "secondary", className = "", children, ...rest }) => {
  const base = "btn";
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    rep: "btn-rep"
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {icon && <span className="icon">{icon}</span>}
      {children}
    </button>
  );
};

const ProgressBar = ({ value, variant = "primary" }) => {
  const colors = {
    primary: "linear-gradient(to right, var(--purple-500), var(--blue-500))",
    secondary: "linear-gradient(to right, var(--purple-500), var(--teal-500))",
  };
  return (
    <div className="progress-bar">
      <motion.div
        className="progress-bar-inner"
        animate={{ width: `${value}%` }}
        style={{ background: colors[variant] }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </div>
  );
};

const RepCounter = ({ currentRep, totalReps, onPrev, onNext, disabled }) => (
  <div className="rep-counter">
    <Button
      variant="rep"
      onClick={onPrev}
      disabled={disabled || currentRep === 1}
      className="rep-nav-btn"
      icon={
        <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
          <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
        </svg>
      }
    />

    <div className="rep-info">
      <span className="rep-label">Rep</span>
      <span className="rep-value">{currentRep}/{totalReps}</span>
    </div>

    <Button
      variant="rep"
      onClick={onNext}
      disabled={disabled || currentRep === totalReps}
      className="rep-nav-btn"
      icon={
        <svg viewBox="0 0 20 20" fill="currentColor" className="icon">
          <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
        </svg>
      }
    />
  </div>
);

const ExerciseCard = ({ exercise, isActive, onClick }) => {
  return (
    <motion.div
      className={`exercise-card ${isActive ? 'active' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="exercise-card-icon">{exercise.icon}</div>
      <div className="exercise-card-content">
        <h3 className="exercise-card-title">{exercise.name}</h3>
        <p className="exercise-card-benefit">{exercise.benefit}</p>
        <div className="exercise-card-meta">
          <span className="exercise-card-reps">{exercise.reps} reps × {exercise.repDuration}s</span>
          <span className="exercise-card-duration">{formatTime(exercise.duration)}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------ component */
const VoiceRoutineApp = () => {
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXERCISES[0].repDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRep, setCurrentRep] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const [showRoutine, setShowRoutine] = useState(true);
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
    if (!isRunning) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else {
      // Handle exercise rep completion
      if (!isBreak && currentRep < EXERCISES[step].reps) {
        // Start break between reps
        setIsBreak(true);
        setTimeLeft(EXERCISES[step].breakAfter || 15); // Use defined breakAfter or default to 15
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
            // Routine finished
            setIsRunning(false);
            setIsBreak(false); // Ensure break state is reset
            playSound('complete'); // Final completion sound
          }
        }
      }
    }

    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [isRunning, step, timeLeft, currentRep, isBreak, EXERCISES]);

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
    [step, currentRep, current.reps, EXERCISES.length]
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
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const goToStep = useCallback((n) => {
    if (n < 0 || n >= EXERCISES.length) return;
    setStep(n);
    setCurrentRep(1);
    setTimeLeft(EXERCISES[n].repDuration);
    setIsBreak(false);
    setIsRunning(false);
  }, []);

  const goToPrevRep = useCallback(() => {
    if (currentRep > 1 && !isRunning) {
      setCurrentRep(prev => prev - 1);
      setTimeLeft(current.repDuration);
    }
  }, [currentRep, current.repDuration, isRunning]);

  const goToNextRep = useCallback(() => {
    if (currentRep < current.reps && !isRunning) {
      setCurrentRep(prev => prev + 1);
      setTimeLeft(current.repDuration);
    }
  }, [currentRep, current.reps, current.repDuration, isRunning]);

  const toggleRoutineView = () => {
    setShowRoutine(!showRoutine);
  };

  /* render */
  return (
    <div className="app-container">
      <div className="content">
        {/* Header */}
        <header className="app-header">
          <div className="app-title">
            <h1 className="gradient-text">Deep Voice Trainer</h1>
            <p className="subtitle">Vocal exercises for resonance and depth</p>
          </div>
          <div className="progress-display">
            <span className="completion-percent">{Math.min(100, routineCompletion)}%</span>
            <div className="progress-bar-container">
              <ProgressBar
                value={Math.min(100, routineCompletion)}
                variant="secondary"
              />
            </div>
          </div>
        </header>

        <div className="main-content">
          {/* Current exercise */}
          <motion.section
            className={`current-exercise ${isBreak ? 'break-mode' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={current.id}
          >
            <div className="exercise-header">
              <div className="exercise-icon">{current.icon}</div>
              <div className="exercise-info">
                <h2 className="exercise-title">
                  {isBreak ? "Break Time" : current.name}
                </h2>
                <p className="exercise-description">{current.description}</p>
              </div>
            </div>

            {isBreak ? (
              <div className="break-content">
                <div className="break-timer-container">
                  <motion.div
                    className="break-circle"
                    animate={{ scale: [0.9, 1, 0.9] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.p
                      key={timeLeft}
                      className="break-timer"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatTime(timeLeft)}
                    </motion.p>
                  </motion.div>
                </div>

                <p className="break-tip">
                  {currentRep < current.reps
                    ? "Focus on relaxing your jaw and neck muscles."
                    : "Take deep breaths and hydrate."}
                </p>
              </div>
            ) : (
              <div className="exercise-content">
                <div className="rep-controls-container">
                  <RepCounter
                    currentRep={currentRep}
                    totalReps={current.reps}
                    onPrev={goToPrevRep}
                    onNext={goToNextRep}
                    disabled={isRunning}
                  />
                </div>

                <div className="progress-container">
                  <ProgressBar
                    value={progress}
                    variant="primary"
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
              </div>
            )}

            {/* controls */}
            <div className="controls-grid">
              <Button
                onClick={() => goToStep(step - 1)}
                disabled={step === 0 || isRunning}
                icon={
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.707 16.707a1 1 0 01-1.414 0l-6-6 6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
                  </svg>
                }
              >
                Previous
              </Button>

              <Button
                onClick={startPause}
                variant={isBreak ? "secondary" : "primary"}
                
              >
                {isRunning ? "Pause" : "Start"}
              </Button>

              <Button
                onClick={() => goToStep(step + 1)}
                disabled={step === EXERCISES.length - 1 || isRunning}
                icon={
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.293 3.293a1 1 0 011.414 0l6 6-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                  </svg>
                }
              >
                Next
              </Button>
            </div>
          </motion.section>

          {/* Routine list */}
          <div className="routine-section">
            <div className="section-header">
              <h3>Today's Routine</h3>
              <button 
                className="toggle-button"
                onClick={toggleRoutineView}
              >
                {showRoutine ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showRoutine && (
              <div className="exercise-list">
                {EXERCISES.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isActive={index === step}
                    onClick={() => !isRunning && goToStep(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming features */}
        <div className="roadmap-section">
          <h3 className="section-title">Upcoming Features</h3>
          <div className="roadmap-grid">
            {ROADMAP_EXERCISES.map((exercise) => (
              <div key={exercise.id} className="roadmap-card">
                <div className="roadmap-icon">{exercise.icon}</div>
                <div className="roadmap-content">
                  <h4>{exercise.name}</h4>
                  <p>{exercise.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRoutineApp;