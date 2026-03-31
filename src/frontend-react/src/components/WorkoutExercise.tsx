import type { Exercise, ExerciseSet, WorkoutExercise } from "../types";
import { WorkoutExerciseSetComponent } from "./WorkoutExerciseSet";

interface WorkoutExerciseProps {
    exerciseIndex: number;
    exercisesList: Exercise[];
    exercise: WorkoutExercise;
    onAddSet: () => void;
    onUpdateSet: (setIndex: number, field: string, value: number) => void;
    onDeleteSet: (setIndex: number) => void;
    onDeleteExercise: () => void;
    onSelectExercise: (id: string) => void;
}

export function WorkoutExerciseComponent({ exerciseIndex, exercisesList, exercise, onAddSet, onUpdateSet, onDeleteSet, onDeleteExercise, onSelectExercise }: WorkoutExerciseProps) {

    return (
        <>
            <div className="exercise-group">
                <label>Exercise:
                    <select value={exercise.exerciseId} onChange={(e) => onSelectExercise(e.target.value)}>
                        <option value="">-- Pick an exercise --</option>
                        {exercisesList.map((exercise) => (
                            <option value={exercise.id} key={exercise.id}>
                                {exercise.name}
                            </option>
                        ))}
                    </select>
                </label>
                {exercise.exerciseSets.map((set, setIndex) => (
                    <WorkoutExerciseSetComponent
                        key={setIndex}
                        set={set}
                        onChange={(field: string, value: number) => onUpdateSet(setIndex, field, value)}
                        onDelete={() => onDeleteSet(setIndex)}
                    />
                ))}
                <button type="button" onClick={onAddSet}>Add Set</button>
                <button type="button" onClick={onDeleteExercise}>Remove Exercise</button>
            </div>
        </>
    );
}