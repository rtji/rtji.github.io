import React, { useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "./ExerciseEditorTab.css";
import type {
  WorkoutItem,
  TimedExercise,
  Superset,
  SupersetExercise,
} from "./types";
import { createId } from "../../helpers/helpers";

interface ExerciseEditorTabProps {
  exercises: WorkoutItem[];
  setExercises: (exercises: WorkoutItem[]) => void;
}

const defaultExercise: TimedExercise = {
  id: "",
  type: "exercise",
  name: "",
  sets: 1,
  reps: 1,
  repDuration: 30,
  restBetweenReps: 10,
  restBetweenSets: 30,
};

const defaultSuperset: Superset = {
  id: "",
  type: "superset",
  name: "",
  sets: 1,
  restBetweenSets: 60,
  exercises: [],
};

const ExerciseEditorTab: React.FC<ExerciseEditorTabProps> = ({
  exercises,
  setExercises,
}) => {
  const [mode, setMode] = useState<"exercise" | "superset">("exercise");
  const [form, setForm] = useState<TimedExercise | Superset>({
    ...defaultExercise,
    id: createId(),
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [supersetExerciseDraft, setSupersetExerciseDraft] = useState<
    Omit<SupersetExercise, "id">
  >({
    name: "",
    duration: 20,
    restAfter: 10,
  });

  const isSuperset = mode === "superset";

  const currentName = useMemo(() => form.name || "Untitled", [form.name]);

  const handleExerciseFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "sets",
      "reps",
      "repDuration",
      "restBetweenReps",
      "restBetweenSets",
    ];

    setForm((prev) => {
      if (isSuperset) {
        const supersetPrev = prev as Superset;
        if (name === "name") return { ...supersetPrev, name: value };
        if (name === "sets")
          return { ...supersetPrev, sets: Math.max(1, Number(value)) };
        if (name === "restBetweenSets")
          return {
            ...supersetPrev,
            restBetweenSets: Math.max(0, Number(value)),
          };
        return supersetPrev;
      }

      const exercisePrev = prev as TimedExercise;
      return {
        ...exercisePrev,
        [name]: numericFields.includes(name)
          ? Math.max(1, Number(value))
          : value,
      };
    });
  };

  const handleSupersetExerciseChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSupersetExerciseDraft((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Math.max(0, Number(value)),
    }));
  };

  const addSupersetExercise = () => {
    if (!supersetExerciseDraft.name) return;
    setForm((prev) => {
      if (prev.type !== "superset") return prev;
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          { ...supersetExerciseDraft, id: createId() },
        ],
      } as Superset;
    });
    setSupersetExerciseDraft({ name: "", duration: 20, restAfter: 10 });
  };

  const removeSupersetExercise = (id: string) => {
    setForm((prev) => {
      if (prev.type !== "superset") return prev;
      return {
        ...prev,
        exercises: prev.exercises.filter((ex) => ex.id !== id),
      } as Superset;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSuperset && form.type === "superset" && form.exercises.length === 0) {
      return;
    }

    const payload: WorkoutItem = {
      ...form,
      id: editId ?? createId(),
      type: mode,
    } as WorkoutItem;

    if (editId) {
      setExercises(exercises.map((ex) => (ex.id === editId ? payload : ex)));
    } else {
      setExercises([...exercises, payload]);
    }

    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setSupersetExerciseDraft({ name: "", duration: 20, restAfter: 10 });
    setForm(
      mode === "superset"
        ? { ...defaultSuperset, id: createId() }
        : { ...defaultExercise, id: createId() }
    );
  };

  const handleEditExercise = (item: WorkoutItem) => {
    setMode(item.type);
    setForm(item);
    setEditId(item.id);
  };

  const handleRemoveExercise = (
    e: React.MouseEvent<SVGSVGElement>,
    id: string
  ) => {
    e.stopPropagation();
    setExercises(exercises.filter((ex) => ex.id !== id));
    if (editId === id) resetForm();
  };

  return (
    <div className="exercise-editor-tab">
      <div className="editor-tab-header">
        <h2 className="editor-tab-title">Workout Builder</h2>
        <p className="editor-tab-subtitle">
          Define duration-based exercises and flexible supersets to drive the
          timer.
        </p>
      </div>
      <div className="editor-tab-body">
        <form onSubmit={handleSubmit} className="editor-tab-form">
          <div className="editor-tab-form-row radio-row">
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === "exercise"}
                onChange={() => {
                  setMode("exercise");
                  setForm({ ...defaultExercise, id: createId() });
                  setEditId(null);
                }}
              />
              Single exercise
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === "superset"}
                onChange={() => {
                  setMode("superset");
                  setForm({ ...defaultSuperset, id: createId() });
                  setEditId(null);
                }}
              />
              Superset
            </label>
          </div>

          <div className="editor-tab-form-row">
            <label className="full-width">
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleExerciseFieldChange}
                required
              />
            </label>
          </div>

          {!isSuperset && form.type === "exercise" && (
            <>
              <div className="editor-tab-form-row">
                <label>
                  Sets
                  <input
                    type="number"
                    name="sets"
                    value={form.sets}
                    min={1}
                    onChange={handleExerciseFieldChange}
                    required
                  />
                </label>
                <label>
                  Reps per set
                  <input
                    type="number"
                    name="reps"
                    value={form.reps}
                    min={1}
                    onChange={handleExerciseFieldChange}
                    required
                  />
                </label>
              </div>
              <div className="editor-tab-form-row">
                <label>
                  Hold duration (sec)
                  <input
                    type="number"
                    name="repDuration"
                    value={form.repDuration}
                    min={1}
                    onChange={handleExerciseFieldChange}
                    required
                  />
                </label>
                <label>
                  Rest between reps (sec)
                  <input
                    type="number"
                    name="restBetweenReps"
                    value={form.restBetweenReps}
                    min={0}
                    onChange={handleExerciseFieldChange}
                    required
                  />
                </label>
              </div>
              <div className="editor-tab-form-row">
                <label className="full-width">
                  Rest between sets (sec)
                  <input
                    type="number"
                    name="restBetweenSets"
                    value={form.restBetweenSets}
                    min={0}
                    onChange={handleExerciseFieldChange}
                    required
                  />
                </label>
              </div>
            </>
          )}

          {isSuperset && form.type === "superset" && (
            <>
              <div className="editor-tab-form-row">
                <label>
                  Sets
                  <input
                    type="number"
                    name="sets"
                    value={form.sets}
                    min={1}
                    onChange={handleExerciseFieldChange}
                    required
                  />
                </label>
                <label>
                  Rest between sets (sec)
                  <input
                    type="number"
                    name="restBetweenSets"
                    value={form.restBetweenSets}
                    min={0}
                    onChange={handleExerciseFieldChange}
                    required
                  />
                </label>
              </div>

              <div className="superset-builder">
                <h4>Superset sequence</h4>
                <div className="superset-row">
                  <label>
                    Exercise name
                    <input
                      name="name"
                      placeholder="Exercise name"
                      value={supersetExerciseDraft.name}
                      onChange={handleSupersetExerciseChange}
                    />
                  </label>
                  <label>
                    Duration (sec)
                    <input
                      type="number"
                      name="duration"
                      min={1}
                      placeholder="Duration (sec)"
                      value={supersetExerciseDraft.duration}
                      onChange={handleSupersetExerciseChange}
                    />
                  </label>
                  <label>
                    Rest after (sec)
                    <input
                      type="number"
                      name="restAfter"
                      min={0}
                      placeholder="Rest after (sec)"
                      value={supersetExerciseDraft.restAfter}
                      onChange={handleSupersetExerciseChange}
                    />
                  </label>
                  <button
                    type="button"
                    className="ghost"
                    onClick={addSupersetExercise}
                  >
                    Add to superset
                  </button>
                </div>
                {form.exercises.length === 0 ? (
                  <p className="muted">No superset items yet.</p>
                ) : (
                  <ul className="superset-list">
                    {form.exercises.map((sub) => (
                      <li key={sub.id}>
                        <div>
                          <strong>{sub.name}</strong> · {sub.duration}s
                          {sub.restAfter > 0 ? ` · Rest ${sub.restAfter}s` : ""}
                        </div>
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => removeSupersetExercise(sub.id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSuperset && (form as Superset).exercises.length === 0}
            >
              {editId ? "Update entry" : "Add to plan"}
            </button>
            <button type="button" className="ghost" onClick={resetForm}>
              Clear form
            </button>
          </div>
        </form>
        <div className="editor-tab-exercises">
          <div className="exercises-header">
            <div>
              <h3>Workout plan</h3>
              <p className="muted">Tap an item to edit or remove it.</p>
            </div>
            <span className="badge">{exercises.length} items</span>
          </div>
          {exercises.length === 0 ? (
            <div className="editor-tab-exercises-empty">
              No exercises added yet.
            </div>
          ) : (
            <ul className="editor-tab-exercises-list">
              {exercises.map((ex) => (
                <li
                  key={ex.id}
                  className={`editor-tab-exercise-item ${
                    editId === ex.id ? "selected" : ""
                  }`}
                  onClick={() => handleEditExercise(ex)}
                  title="Click to edit"
                >
                  <div className="exercise-title">
                    <strong>{ex.name}</strong>
                    <CloseIcon
                      className="close-button"
                      onClick={(e) => handleRemoveExercise(e, ex.id)}
                    />
                  </div>
                  <div className="exercise-meta">
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
                        <span>Superset · {ex.sets} sets</span>
                        <span>{ex.restBetweenSets}s rest between sets</span>
                        <span>
                          {ex.exercises.length} exercise
                          {ex.exercises.length === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="active-draft">
            Editing: <strong>{editId ? "Existing entry" : "New entry"}</strong>
            <br />
            Label: <strong>{currentName}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseEditorTab;
