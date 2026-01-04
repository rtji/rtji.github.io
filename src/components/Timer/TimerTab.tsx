import React, { useEffect, useMemo, useState } from "react";
import "./TimerTab.css";
import type { WorkoutItem } from "./types";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

type TimerStep = {
  type: "work" | "rest";
  label: string;
  detail: string;
  duration: number;
};

interface TimerTabProps {
  exercises: WorkoutItem[];
  onPlanChange: (items: WorkoutItem[]) => void;
}

const buildSchedule = (items: WorkoutItem[]): TimerStep[] => {
  const steps: TimerStep[] = [];

  items.forEach((item) => {
    if (item.type === "exercise") {
      for (let set = 1; set <= item.sets; set++) {
        for (let rep = 1; rep <= item.reps; rep++) {
          steps.push({
            type: "work",
            label: item.name,
            detail: `Set ${set} · Rep ${rep}`,
            duration: item.repDuration,
          });

          if (rep < item.reps && item.restBetweenReps > 0) {
            steps.push({
              type: "rest",
              label: "Rest",
              detail: `${item.name} · between reps`,
              duration: item.restBetweenReps,
            });
          }
        }

        if (set < item.sets && item.restBetweenSets > 0) {
          steps.push({
            type: "rest",
            label: "Rest",
            detail: `${item.name} · between sets`,
            duration: item.restBetweenSets,
          });
        }
      }
    } else {
      for (let set = 1; set <= item.sets; set++) {
        item.exercises.forEach((sub, idx) => {
          steps.push({
            type: "work",
            label: sub.name,
            detail: `${item.name} · Set ${set}${
              idx === 0 ? "" : " (continue)"
            }`,
            duration: sub.duration,
          });

          if (sub.restAfter > 0) {
            steps.push({
              type: "rest",
              label: "Rest",
              detail: `${item.name} · between exercises`,
              duration: sub.restAfter,
            });
          }
        });

        if (set < item.sets && item.restBetweenSets > 0) {
          steps.push({
            type: "rest",
            label: "Rest",
            detail: `${item.name} · between sets`,
            duration: item.restBetweenSets,
          });
        }
      }
    }
  });

  return steps;
};

const TimerTab: React.FC<TimerTabProps> = ({ exercises, onPlanChange }) => {
  const [running, setRunning] = useState(false);
  const [schedule, setSchedule] = useState<TimerStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const currentStep = schedule[currentStepIndex];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft > 0) return;

    if (currentStepIndex >= schedule.length - 1) {
      setRunning(false);
      setTimeLeft(0);
      return;
    }

    setCurrentStepIndex((prev) => prev + 1);
    setTimeLeft(schedule[currentStepIndex + 1]?.duration ?? 0);
  }, [timeLeft, running, currentStepIndex, schedule]);

  const startTimer = () => {
    const steps = buildSchedule(exercises);
    if (steps.length === 0) return;
    setSchedule(steps);
    setCurrentStepIndex(0);
    setTimeLeft(steps[0].duration);
    setRunning(true);
  };

  const stopTimer = () => {
    setRunning(false);
  };

  const resetTimer = () => {
    setRunning(false);
    setSchedule([]);
    setCurrentStepIndex(0);
    setTimeLeft(0);
  };

  const upcoming = useMemo(
    () => schedule.slice(currentStepIndex + 1, currentStepIndex + 5),
    [schedule, currentStepIndex]
  );

  const clearPlan = () => {
    onPlanChange([]);
    resetTimer();
  };

  return (
    <div className="timer-tab">
      <div className="timer-tab-header">
        <div>
          <h2 className="timer-tab-title">Exercise Timer</h2>
          <p className="muted">
            Walk through single exercises or supersets with timed holds and
            rests.
          </p>
        </div>
        <button className="ghost" onClick={clearPlan}>
          Clear plan
        </button>
      </div>
      {currentStep ? (
        <div className={`timer-current ${currentStep.type}`}>
          <div className="timer-label">{currentStep.label}</div>
          <div className="timer-detail">{currentStep.detail}</div>
          <div className="timer-clock">{formatTime(timeLeft)}</div>
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
          Pause
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>

      {running && currentStep && (
        <div className="timer-queue">
          <h4>Up next</h4>
          {upcoming.length === 0 ? (
            <p className="muted">This is the final step.</p>
          ) : (
            <ul>
              {upcoming.map((step, idx) => (
                <li key={`${step.label}-${idx}`} className={step.type}>
                  <div className="step-title">{step.label}</div>
                  <div className="step-detail">{step.detail}</div>
                  <span className="badge">{formatTime(step.duration)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {exercises.length > 0 && (
        <div className="timer-summary">
          <h3>Plan overview</h3>
          <ul>
            {exercises.map((ex) => (
              <li key={ex.id}>
                <div className="summary-title">
                  <span className="badge subtle">{ex.type}</span>
                  <strong>{ex.name}</strong>
                </div>
                <div className="summary-meta">
                  {ex.type === "exercise" ? (
                    <>
                      <span>{ex.sets} sets</span>
                      <span>{ex.reps} reps</span>
                      <span>{ex.repDuration}s holds</span>
                      <span>{ex.restBetweenReps}s rest between reps</span>
                      <span>{ex.restBetweenSets}s rest between sets</span>
                    </>
                  ) : (
                    <>
                      <span>{ex.sets} sets</span>
                      <span>{ex.restBetweenSets}s rest between sets</span>
                      <span>
                        {ex.exercises
                          .map(
                            (sub) =>
                              `${sub.name} · ${sub.duration}s${
                                sub.restAfter ? ` + ${sub.restAfter}s rest` : ""
                              }`
                          )
                          .join(" › ")}
                      </span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TimerTab;
