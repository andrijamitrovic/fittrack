import type { ExerciseSet } from "../types";

interface WorkoutExerciseSetProps {
    set: ExerciseSet;
    onChange: (field: string, value: number) => void;
    onDelete: () => void;
}

export function WorkoutExerciseSetComponent({
    set,
    onChange,
    onDelete
}: WorkoutExerciseSetProps) {
    return (
        <>
            <div className={"set-row"}>
                <label>Reps:
                    <input
                        type="number"
                        min={1}
                        max={100}
                        className="reps"
                        name="reps"
                        id="reps"
                        value={set.reps}
                        onChange={(e) => onChange("reps", Number(e.target.value))}
                    />
                </label>
                <label>Weight:
                    <input
                        type="number"
                        min={1}
                        max={1000}
                        className="weight"
                        name="weight"
                        id="weight"
                        value={set.weight}
                        onChange={(e) => onChange("weight", Number(e.target.value))}
                    />
                </label>
                <label>RPE:
                    <input 
                        type="number" 
                        min={1} 
                        max={10} 
                        className="rpe" 
                        name="rpe" 
                        id="rpe"
                        value={set.rpe}
                        onChange={(e) => onChange("rpe", Number(e.target.value))} />
                </label>
                <button type="button" className="remove-btn" onClick={onDelete}>Delete</button>
                {/* <label for="isWarmup">Is a warmup? </label>
       <input type="checkbox" class="isWarmup" name="isWarmup" id="isWarmup"> */}
            </div>

        </>
    );
}