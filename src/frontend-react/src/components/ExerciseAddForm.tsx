import { useState } from "react";

export function ExerciseForm({ onAdd }: { onAdd: (e: any) => void }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [muscleGroup, setMuscleGroup] = useState("");

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
                    onAdd({ name, category, muscleGroup });
                    setName("");
                    setCategory("");
                    setMuscleGroup("");
                }}
            >
                Add
            </button>
        </div>
    );
}