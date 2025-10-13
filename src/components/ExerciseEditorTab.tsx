import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "./ExerciseEditorTab.css";

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  repDuration: number;
  restDuration: number;
}

interface ExerciseEditorTabProps {
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
}

const ExerciseEditorTab: React.FC<ExerciseEditorTabProps> = ({
  exercises,
  setExercises,
}) => {
  const [form, setForm] = useState<Exercise>({
    name: "",
    sets: 1,
    reps: 1,
    repDuration: 30,
    restDuration: 30,
  });
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Math.max(1, Number(value)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newExercises = [...exercises];

    if (editIdx !== null) {
      // Update existing exercise
      setExercises(
        newExercises.map((ex, idx) => (idx === editIdx ? form : ex))
      );
      setEditIdx(null);
    } else {
      // Add new exercise
      setExercises([...newExercises, form]);
    }

    setForm({ name: "", sets: 1, reps: 1, repDuration: 30, restDuration: 30 });
  };

  const handleEditExercise = (idx: number) => {
    setForm(exercises[idx]);
    setEditIdx(idx);
  };

  const handleRemoveExercise = (
    e: React.MouseEvent<SVGSVGElement>,
    idx: number
  ) => {
    e.stopPropagation();
    const newExercises = [...exercises];
    newExercises.splice(idx, 1);
    setExercises(newExercises);
  };

  return (
    <div className="exercise-editor-tab">
      <div className="editor-tab-body">
        <form onSubmit={handleSubmit} className="editor-tab-form">
          <div className="editor-tab-form-row">
            <label>Exercise Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="editor-tab-form-row">
            <label>
              Sets
              <br />
              <input
                type="number"
                name="sets"
                value={form.sets}
                min={1}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Reps
              <br />
              <input
                type="number"
                name="reps"
                value={form.reps}
                min={1}
                onChange={handleFormChange}
                required
              />
            </label>
          </div>
          <div className="editor-tab-form-row">
            <label>
              Rep duration (sec)
              <br />
              <input
                type="number"
                name="repDuration"
                value={form.repDuration}
                min={1}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Rest between sets (sec)
              <br />
              <input
                type="number"
                name="restDuration"
                value={form.restDuration}
                min={1}
                onChange={handleFormChange}
                required
              />
            </label>
          </div>
          <button type="submit">
            {editIdx !== null ? "Update exercise" : "Add exercise"}
          </button>
        </form>
        <div className="editor-tab-exercises">
          <h3>Exercises</h3>
          {exercises.length === 0 ? (
            <div className="editor-tab-exercises-empty">
              No exercises added yet.
            </div>
          ) : (
            <ul className="editor-tab-exercises-list">
              {exercises.map((ex, idx) => (
                <li
                  key={idx}
                  className={`editor-tab-exercise-item ${
                    editIdx === idx ? "selected" : ""
                  }`}
                  onClick={() => handleEditExercise(idx)}
                  title="Click to edit"
                >
                  <strong>{ex.name}</strong>
                  <CloseIcon
                    className="close-button"
                    onClick={(e) => handleRemoveExercise(e, idx)}
                  />
                  <br />
                  Sets: {ex.sets}, Reps: {ex.reps}, Rep Duration:{" "}
                  {ex.repDuration}s, Rest: {ex.restDuration}s
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseEditorTab;
