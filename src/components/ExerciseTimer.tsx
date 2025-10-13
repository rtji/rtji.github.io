import React, { useEffect, useState } from "react";
import TimerTab from "./TimerTab";
import ExerciseEditorTab, { type Exercise } from "./ExerciseEditorTab";
import "./ExerciseTimer.css";

const ExerciseTimer: React.FC = () => {
  const [tab, setTab] = useState<"timer" | "edit">("timer");
  const [exercises, setExercises] = useState<Exercise[]>([
    // Example initial data (can be empty)
    // { name: "Push Ups", sets: 3, reps: 10, repDuration: 30, restDuration: 20 }
  ]);

  useEffect(() => {
    // Load exercises from localStorage on mount
    if (!exercises || exercises.length === 0) {
      const saved = localStorage.getItem("exercises");
      if (saved) {
        setExercises(JSON.parse(saved));
      }
    } else {
      localStorage.setItem("exercises", JSON.stringify(exercises));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("exercises", JSON.stringify(exercises));
  }, [exercises]);

  return (
    <div className="exercise-timer">
      <div className="exercise-timer-tabs">
        <div className={`exercise-timer-tabs-underline ${tab}`}></div>
        <button
          className={`exercise-timer-tab-btn${
            tab === "timer" ? " active" : ""
          }`}
          onClick={() => setTab("timer")}
        >
          Timer
        </button>
        <button
          className={`exercise-timer-tab-btn${tab === "edit" ? " active" : ""}`}
          onClick={() => setTab("edit")}
        >
          Editor
        </button>
      </div>
      <div className="exercise-timer-container">
        {tab === "timer" ? (
          <TimerTab exercises={exercises} />
        ) : (
          <ExerciseEditorTab
            exercises={exercises}
            setExercises={setExercises}
          />
        )}
      </div>
    </div>
  );
};

export default ExerciseTimer;
