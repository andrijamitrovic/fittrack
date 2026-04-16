import { useEffect, useState } from "react";
import { addExerciseAsync, deleteExerciseAsync, loadExercises, updateExerciseAsync } from "../services/exerciseService";
import type { Exercise } from "../types";
import { ExerciseForm } from "../components/ExerciseAddForm";
import { Modal } from "../components/Modal";

export function AdminExercises() {
    const [showForm, setShowForm] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);


    async function saveExercise(exercise: Exercise) {
        const newExercise = { ...exercise, id: crypto.randomUUID() };
        await addExerciseAsync(newExercise);
        setExercises(prev => [...prev, newExercise]);
    }
    async function updateExercise(exercise: Exercise) {
        await updateExerciseAsync(exercise);
        setExercises(prev => prev.map(x => x.id === exercise.id ? exercise : x));
    }
    async function deleteExercise(exerciseId: string) {
        await deleteExerciseAsync(exerciseId);
        setExercises(exercises.filter((x) => x.id !== exerciseId));
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
                            <button onClick={() => setEditingExercise(exercise)}>Update Exercise</button>

                            <button className="remove-btn" onClick={() => deleteExercise(exercise.id)}>Delete Exercise</button>
                        </div>
                    );
                })
            }

            {editingExercise && (
                <Modal onClose={() => setEditingExercise(null)}>
                    <ExerciseForm
                        formExercise={editingExercise}
                        onAdd={async (updated) => {
                            await updateExercise(updated);
                            setEditingExercise(null);
                        }}
                    />
                </Modal>
            )}

            {showForm && (
                <Modal onClose={() => setShowForm(false)}>
                    <ExerciseForm onAdd={(e) => {
                            saveExercise(e);
                            setShowForm(false);
                        }} formExercise={null}
                    />
                </Modal>
            )}
        </>
    )
}