import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  RotateCcw,
  Timer,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
} from 'lucide-react';
import './VoiceRoutineApp.css'; // CSS file

const exercises = [
  { name: 'Belly Breathing with “Ssss” Sound', duration: 120, benefit: 'Trains proper breath support, control, and calmness.' },
  { name: 'Jaw & Neck Relaxation', duration: 180, benefit: 'Removes throat tension for a fuller, deeper voice.' },
  { name: 'Lip Trills ("Brrr...")', duration: 300, benefit: 'Loosens vocal cords, builds smooth pitch control.' },
  { name: 'Humming ("Mmm…")', duration: 180, benefit: 'Activates chest resonance, adds richness.' },
  { name: 'Sirens (Pitch Glide)', duration: 300, benefit: 'Expands range, improves vocal flexibility.' },
  { name: 'Chest Resonance Drill', duration: 240, benefit: 'Trains grounded, deep, manly tone.' },
  { name: 'Yawn-Sigh ("Haaah")', duration: 180, benefit: 'Opens the throat for a relaxed deep sound.' },
  { name: 'Low Humming', duration: 120, benefit: 'Calms cords and reinforces muscle memory.' },
  { name: 'Silent Stretch & Breath', duration: 180, benefit: 'Relaxes body and prevents tightness.' }
];

const Button = ({ children, onClick, disabled, variant = 'default', icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn ${variant} ${disabled ? 'disabled' : ''}`}
  >
    {Icon && <Icon className="icon" />}
    {children}
  </button>
);

const Progress = ({ value }) => (
  <div className="progress-bar-container">
    <motion.div
      className="progress-bar-fill"
      initial={{ width: '0%' }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    />
  </div>
);

const Card = ({ children }) => (
  <motion.div
    className="card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

const CardContent = ({ children }) => (
  <div className="card-content">{children}</div>
);

const VoiceRoutineApp = () => {
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercises[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && step < exercises.length - 1) {
      setStep((prev) => prev + 1);
      setTimeLeft(exercises[step + 1].duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, timeLeft, step]);

  const resetRoutine = () => {
    setIsRunning(false);
    setStep(0);
    setTimeLeft(exercises[0].duration);
  };

  const goToNext = () => {
    if (step < exercises.length - 1) {
      setStep(step + 1);
      setTimeLeft(exercises[step + 1].duration);
      setIsRunning(false);
    }
  };

  const goToPrevious = () => {
    if (step > 0) {
      setStep(step - 1);
      setTimeLeft(exercises[step - 1].duration);
      setIsRunning(false);
    }
  };

  const currentExercise = exercises[step];
  const progress = ((currentExercise.duration - timeLeft) / currentExercise.duration) * 100;

  return (
    <div className="app-container">
      <div className="app-inner">
        <motion.h1
          className="title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          🎙️ Deep Voice Trainer
        </motion.h1>

        <Card>
          <CardContent>
            <div className="exercise-header">
              <span className="exercise-title">
                <Timer className="icon" />
                {currentExercise.name}
              </span>
              <span className="step-count">{step + 1}/{exercises.length}</span>
            </div>

            <p className="benefit-text">{currentExercise.benefit}</p>
            <Progress value={progress} />

            <div className="timer-display">
              <motion.span
                key={timeLeft}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </motion.span>
            </div>

            <div className="button-group">
              <Button onClick={goToPrevious} disabled={step === 0} variant="outline" icon={ArrowLeft}>
                Previous
              </Button>
              <Button onClick={() => setIsRunning(!isRunning)} icon={isRunning ? Pause : Play}>
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={goToNext} disabled={step === exercises.length - 1} variant="outline" icon={ArrowRight}>
                Next
              </Button>
              <Button onClick={resetRoutine} variant="destructive" icon={RotateCcw}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <motion.div
          className="completion-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CheckCircle className="icon green" />
          {Math.floor(((step + 1) / exercises.length) * 100)}% complete
        </motion.div>

        <div className="coming-soon">
          <h2>🚀 Coming Soon:</h2>
          <ul>
            <li>📈 Weekly progress graph (voice depth & consistency)</li>
            <li>🎤 Voice recorder with playback & comparison</li>
            <li>💡 Daily tips based on progress</li>
            <li>📅 30-Day Deep Voice Challenge calendar</li>
            <li>🔔 Smart reminders and motivation quotes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceRoutineApp;
