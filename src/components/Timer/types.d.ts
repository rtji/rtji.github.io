export type WorkoutItem = TimedExercise | Superset;

export interface TimedExercise {
  id: string;
  type: "exercise";
  name: string;
  sets: number;
  reps: number;
  repDuration: number;
  restBetweenReps: number;
  restBetweenSets: number;
}

export interface SupersetExercise {
  id: string;
  name: string;
  duration: number;
  restAfter: number;
}

export interface Superset {
  id: string;
  type: "superset";
  name: string;
  sets: number;
  restBetweenSets: number;
  exercises: SupersetExercise[];
}
