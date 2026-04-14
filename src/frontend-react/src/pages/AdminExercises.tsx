import { useEffect, useState } from "react";
import { addExerciseAsync, loadExercises } from "../services/exerciseService";
import type { Exercise } from "../types";
import { ExerciseForm } from "../components/ExerciseAddForm";
import { Modal } from "../components/Modal";

export function AdminExercises() {
    const [showForm, setShowForm] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function saveExercise(exercise: Exercise) {
        const newExercise = { ...exercise, id: crypto.randomUUID() };
        setExercises(prev => [...prev, newExercise]);
        addExerciseAsync(newExercise);
    }

    useEffect(() => {
        loadExercises()
            .then(setExercises)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <>
            <button onClick={() => setShowForm(true)}>Add Exercise</button>
            {
                exercises.map((exercise: Exercise) => {
                    return (

                        <div className="card" key={exercise.id}>
                            <div className="cardHeader">
                                <h3>{exercise.name}</h3>
                                <p>{exercise.category}</p>
                                <p>{exercise.muscleGroup}</p>
                            </div>
                        </div>
                    );
                })
            }
            {showForm && (
                <Modal onClose={() => setShowForm(false)}>
                    <ExerciseForm onAdd={(e) => {
                        saveExercise(e);
                        setShowForm(false);
                    }}
                    />
                </Modal>
            )}
        </>
    )
}