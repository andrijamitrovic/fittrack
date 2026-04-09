import type { Exercise, WorkoutExercise } from "../types";
import { WorkoutExerciseSetComponent } from "./WorkoutExerciseSet";

interface WorkoutExerciseProps {
    exercisesList: Exercise[];
    exercise: WorkoutExercise;
    onAddSet: () => void;
    onUpdateSet: (setIndex: number, field: string, value: number | undefined) => void;
    onDeleteSet: (setIndex: number) => void;
    onDeleteExercise: () => void;
    onSelectExercise: (id: string) => void;
}

export function WorkoutExerciseComponent({ exercisesList, exercise, onAddSet, onUpdateSet, onDeleteSet, onDeleteExercise, onSelectExercise }: WorkoutExerciseProps) {

    return (
        <>
            <div className="exercise-group">
                <label>Exercise:
                    <select required value={exercise.exerciseId} onChange={(e) => onSelectExercise(e.target.value)}>
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
                        onChange={(field: string, value: number | undefined) => onUpdateSet(setIndex, field, value)}
                        onDelete={() => onDeleteSet(setIndex)}
                    />
                ))}
                <button type="button" className="add-btn" onClick={onAddSet}>Add Set</button>
                <button type="button" className="remove-btn" onClick={onDeleteExercise}>Remove Exercise</button>
            </div>
        </>
    );
}