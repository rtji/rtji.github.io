import React, { useEffect, useMemo, useState } from "react";
import TimerTab from "./TimerTab";
import ExerciseEditorTab, { type WorkoutItem } from "./ExerciseEditorTab";
import "./ExerciseTimer.css";

const samplePlan: WorkoutItem[] = [
  {
    id: "hamstring",
    type: "exercise",
    name: "Hamstring stretch",
    sets: 2,
    reps: 4,
    repDuration: 30,
    restBetweenReps: 30,
    restBetweenSets: 60,
  },
  {
    id: "quad",
    type: "exercise",
    name: "Quad stretch",
    sets: 1,
    reps: 3,
    repDuration: 20,
    restBetweenReps: 10,
    restBetweenSets: 45,
  },
  {
    id: "swings",
    type: "exercise",
    name: "Leg swings",
    sets: 2,
    reps: 2,
    repDuration: 30,
    restBetweenReps: 15,
    restBetweenSets: 45,
  },
  {
    id: "superset",
    type: "superset",
    name: "Toe touch circuit",
    sets: 3,
    restBetweenSets: 30,
    exercises: [
      { id: "toe", name: "Toe touches", duration: 10, restAfter: 0 },
      { id: "ground", name: "Touch ground", duration: 15, restAfter: 0 },
      { id: "grass", name: "Eat grass", duration: 20, restAfter: 0 },
    ],
  },
];

const ExerciseTimer: React.FC = () => {
  const [tab, setTab] = useState<"timer" | "edit">("timer");
  const [exercises, setExercises] = useState<WorkoutItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("exercises");
    if (saved) {
      setExercises(JSON.parse(saved));
    } else {
      setExercises(samplePlan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (exercises.length === 0) {
      localStorage.removeItem("exercises");
      return;
    }
    localStorage.setItem("exercises", JSON.stringify(exercises));
  }, [exercises]);

  const title = useMemo(() => (tab === "timer" ? "Timer" : "Editor"), [tab]);

  return (
    <div className="exercise-timer" aria-label="Exercise timer">
      <div className="exercise-timer-tabs" role="tablist" aria-label={title}>
        <div className={`exercise-timer-tabs-underline ${tab}`}></div>
        <button
          className={`exercise-timer-tab-btn${
            tab === "timer" ? " active" : ""
          }`}
          onClick={() => setTab("timer")}
          role="tab"
          aria-selected={tab === "timer"}
        >
          Timer
        </button>
        <button
          className={`exercise-timer-tab-btn${tab === "edit" ? " active" : ""}`}
          onClick={() => setTab("edit")}
          role="tab"
          aria-selected={tab === "edit"}
        >
          Builder
        </button>
      </div>
      <div className="exercise-timer-container">
        {tab === "timer" ? (
          <TimerTab exercises={exercises} onPlanChange={setExercises} />
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
