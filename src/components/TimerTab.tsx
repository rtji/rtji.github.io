import React, { useState, useRef } from "react";
import "./TimerTab.css";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  repDuration: number;
  restDuration: number;
}

interface TimerTabProps {
  exercises: Exercise[];
}

const TimerTab: React.FC<TimerTabProps> = ({ exercises }) => {
  const [running, setRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0); // exercise index
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [phase, setPhase] = useState<"rep" | "rest">("rep");
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to get current exercise
  const currentExercise = exercises[currentIdx];

  // Start timer sequence
  const startTimer = () => {
    if (!running && exercises.length > 0) {
      setRunning(true);
      setCurrentIdx(0);
      setCurrentSet(1);
      setCurrentRep(1);
      setPhase("rep");
      setTimeLeft(exercises[0].repDuration);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
  };

  // Stop timer
  const stopTimer = () => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset timer
  const resetTimer = () => {
    stopTimer();
    setCurrentIdx(0);
    setCurrentSet(1);
    setCurrentRep(1);
    setPhase("rep");
    setTimeLeft(0);
  };

  // Main timer logic
  React.useEffect(() => {
    if (!running) return;
    if (timeLeft > 0) return;
    if (!currentExercise) {
      stopTimer();
      return;
    }

    if (phase === "rep") {
      // Finished a rep
      if (currentRep < currentExercise.reps) {
        setCurrentRep((r) => r + 1);
        setTimeLeft(currentExercise.repDuration);
      } else if (currentSet < currentExercise.sets) {
        setPhase("rest");
        setTimeLeft(currentExercise.restDuration);
      } else {
        // Move to next exercise
        if (currentIdx < exercises.length - 1) {
          setCurrentIdx((i) => i + 1);
          setCurrentSet(1);
          setCurrentRep(1);
          setPhase("rep");
          setTimeLeft(exercises[currentIdx + 1].repDuration);
        } else {
          // All done
          stopTimer();
        }
      }
    } else if (phase === "rest") {
      // Finished a rest
      setCurrentSet((s) => s + 1);
      setCurrentRep(1);
      setPhase("rep");
      setTimeLeft(currentExercise.repDuration);
    }
    // eslint-disable-next-line
  }, [timeLeft, running]);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <>
      <h2 className="timer-tab-title">Exercise Timer</h2>
      {running && currentExercise ? (
        <div style={{ marginBottom: 16, color: "#fff" }}>
          <div>
            <strong>Exercise:</strong> {currentExercise.name}
          </div>
          <div>
            <strong>Set:</strong> {currentSet} / {currentExercise.sets}
          </div>
          <div>
            <strong>Rep:</strong>{" "}
            {phase === "rep"
              ? `${currentRep} / ${currentExercise.reps}`
              : "Rest"}
          </div>
          <div>
            <strong>
              {phase === "rep" ? "Rep Time Left:" : "Rest Time Left:"}
            </strong>{" "}
            {formatTime(timeLeft)}
          </div>
        </div>
      ) : (
        <div className="timer-tab-time">00:00</div>
      )}
      <div className="timer-tab-controls">
        <button
          onClick={startTimer}
          disabled={running || exercises.length === 0}
        >
          Start
        </button>
        <button onClick={stopTimer} disabled={!running}>
          Stop
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      {/* For debugging, show the exercises list */}
      {exercises.length > 0 && (
        <div style={{ marginTop: 24, color: "#fff" }}>
          <strong>Exercises:</strong>
          <ul>
            {exercises.map((ex, idx) => (
              <li key={idx}>
                {ex.name} ({ex.sets} sets x {ex.reps} reps, {ex.repDuration}s,
                rest {ex.restDuration}s)
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default TimerTab;
