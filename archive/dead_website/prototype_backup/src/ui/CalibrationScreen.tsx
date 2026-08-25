import { useState } from 'react';

interface CalibrationStep {
  fingers: number;
  label: string;
  chord: string;
}

const CALIBRATION_STEPS: CalibrationStep[] = [
  { fingers: 0, label: 'Make a fist', chord: 'Em' },
  { fingers: 1, label: 'Show 1 finger', chord: 'Am' },
  { fingers: 2, label: 'Show 2 fingers', chord: 'G' },
  { fingers: 3, label: 'Show 3 fingers', chord: 'C' },
  { fingers: 4, label: 'Show 4 fingers', chord: 'D' },
  { fingers: 5, label: 'Open your palm', chord: 'F' },
];

interface CalibrationScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function CalibrationScreen({ onComplete, onSkip }: CalibrationScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const step = CALIBRATION_STEPS[currentStep];
  const isLastStep = currentStep >= CALIBRATION_STEPS.length - 1;
  const allDone = completed.length === CALIBRATION_STEPS.length;

  const handleDetected = () => {
    if (!completed.includes(currentStep)) {
      setCompleted([...completed, currentStep]);
    }

    if (isLastStep) {
      setTimeout(() => onComplete(), 500);
    } else {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Title */}
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        ✋ Gesture Calibration
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 40 }}>
        Show each gesture so AirChord learns your hand
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        {CALIBRATION_STEPS.map((_s, i) => (
          <div key={i} style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: completed.includes(i)
              ? '#22c55e'
              : i === currentStep
                ? '#6366f1'
                : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Current instruction */}
      <div style={{
        fontSize: 48,
        marginBottom: 16,
      }}>
        {step.fingers === 0 ? '✊' : step.fingers === 5 ? '✋' : '✌️'}
      </div>

      <div style={{
        fontSize: 28,
        fontWeight: 600,
        marginBottom: 8,
      }}>
        {step.label}
      </div>

      <div style={{
        fontSize: 20,
        color: '#6366f1',
        fontWeight: 700,
        marginBottom: 40,
      }}>
        → {step.chord}
      </div>

      {/* Button to simulate detection (for testing) */}
      <button
        onClick={handleDetected}
        style={{
          padding: '14px 32px',
          borderRadius: 12,
          border: 'none',
          background: '#6366f1',
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 20,
        }}
      >
        {allDone ? '✓ Calibration Complete' : 'Detected — Next'}
      </button>

      {/* Skip */}
      <button
        onClick={onSkip}
        style={{
          padding: '10px 24px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Skip calibration
      </button>
    </div>
  );
}
