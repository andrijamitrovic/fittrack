import { useEffect, useState } from "react";
import type { Exercise } from "../types";

type ExerciseFormProps = {
    onAdd: (e: any) => void;
    formExercise: Exercise | null;
}

export function ExerciseForm({ onAdd, formExercise }: ExerciseFormProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [muscleGroup, setMuscleGroup] = useState("");

    useEffect(() => {
        if (formExercise) {
            setName(formExercise.name);
            setCategory(formExercise.category);
            setMuscleGroup(formExercise.muscleGroup);
        } else {
            setName("");
            setCategory("");
            setMuscleGroup("");
        }
    }, [formExercise]);

    return (
        <div className="workoutForm">
            <label>
                Name:
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </label>

            <label>
                Category:
                <input
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                />
            </label>

            <label>
                Muscle:
                <input
                    value={muscleGroup}
                    onChange={e => setMuscleGroup(e.target.value)}
                />
            </label>

            <button
                onClick={() => {
                    onAdd({
                        id: formExercise?.id,
                        name,
                        category,
                        muscleGroup
                    });
                    setName("");
                    setCategory("");
                    setMuscleGroup("");
                }}
            >
                {formExercise ? "Update" : "Add"}
            </button>
        </div>
    );
}