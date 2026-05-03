import { useEffect, useMemo, useState } from "react";
import type {
    Exercise,
    ExerciseSet,
    WorkoutExercise,
    WorkoutExerciseViewer,
    WorkoutViewer
} from "../types";
import { loadExercises } from "../services/exerciseService";
import { WorkoutExerciseComponent } from "./WorkoutExercise";
import { Modal } from "./Modal";

type WorkoutEditModalProps = {
    heading: string;
    workout: WorkoutViewer;
    onClose: () => void;
    onSave: (updatedWorkout: WorkoutViewer) => Promise<void>;
};

function normalizeExerciseOrder(exercises: WorkoutExercise[]): WorkoutExercise[] {
    return exercises.map((exercise, index) => ({
        ...exercise,
        orderIndex: index + 1
    }));
}

function normalizeSetNumbers(sets: ExerciseSet[]): ExerciseSet[] {
    return sets.map((set, index) => ({
        ...set,
        setNumber: index + 1
    }));
}

function mapViewerToEditableExercises(viewerExercises: WorkoutExerciseViewer[]): WorkoutExercise[] {
    return viewerExercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        orderIndex: exercise.orderIndex,
        notes: exercise.exerciseNotes,
        exerciseSets: exercise.sets.map((set) => ({
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            isWarmup: set.isWarmup
        }))
    }));
}

export function WorkoutEditModal({
    heading,
    workout,
    onClose,
    onSave
}: WorkoutEditModalProps) {
    const [title, setTitle] = useState(workout.title ?? "");
    const [notes, setNotes] = useState(workout.workoutNotes ?? "");
    const [durationMin, setDurationMin] = useState((workout.durationMin ?? 1).toString());
    const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
    const [exercises, setExercises] = useState<WorkoutExercise[]>(() =>
        normalizeExerciseOrder(mapViewerToEditableExercises(workout.exercises))
    );
    const [loadingExercises, setLoadingExercises] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadExercises()
            .then(setExercisesList)
            .catch((err) => setError(err.message || "Failed to load exercises."))
            .finally(() => setLoadingExercises(false));
    }, []);

    const exerciseLookup = useMemo(() => {
        return new Map(exercisesList.map((exercise) => [exercise.id, exercise]));
    }, [exercisesList]);

    function addExercise() {
        setExercises((current) => [
            ...current,
            {
                exerciseId: "",
                orderIndex: current.length + 1,
                exerciseSets: []
            }
        ]);
    }

    function deleteExercise(exerciseIndex: number) {
        setExercises((current) =>
            normalizeExerciseOrder(current.filter((_, index) => index !== exerciseIndex))
        );
    }

    function selectExercise(exerciseIndex: number, exerciseId: string) {
        setExercises((current) => {
            const updated = [...current];
            updated[exerciseIndex] = {
                ...updated[exerciseIndex],
                exerciseId
            };
            return updated;
        });
    }

    function addSet(exerciseIndex: number) {
        setExercises((current) => {
            const updated = [...current];
            const exercise = updated[exerciseIndex];
            updated[exerciseIndex] = {
                ...exercise,
                exerciseSets: [
                    ...exercise.exerciseSets,
                    {
                        setNumber: exercise.exerciseSets.length + 1,
                        reps: undefined,
                        weight: undefined,
                        rpe: undefined,
                        isWarmup: false
                    }
                ]
            };
            return updated;
        });
    }

    function updateSet(exerciseIndex: number, setIndex: number, field: string, value: number | undefined) {
        setExercises((current) => {
            const updated = [...current];
            const sets = [...updated[exerciseIndex].exerciseSets];
            sets[setIndex] = {
                ...sets[setIndex],
                [field]: value
            };
            updated[exerciseIndex] = {
                ...updated[exerciseIndex],
                exerciseSets: sets
            };
            return updated;
        });
    }

    function deleteSet(exerciseIndex: number, setIndex: number) {
        setExercises((current) => {
            const updated = [...current];
            const sets = normalizeSetNumbers(
                updated[exerciseIndex].exerciseSets.filter((_, index) => index !== setIndex)
            );
            updated[exerciseIndex] = {
                ...updated[exerciseIndex],
                exerciseSets: sets
            };
            return updated;
        });
    }

    async function saveChanges() {
        const trimmedTitle = title.trim();
        const parsedDuration = Number(durationMin);

        if (!trimmedTitle) {
            setError("Title is required.");
            return;
        }

        if (!Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 1440) {
            setError("Duration must be between 1 and 1440 minutes.");
            return;
        }

        if (exercises.length === 0) {
            setError("Add at least one exercise.");
            return;
        }

        if (exercises.some((exercise) => !exercise.exerciseId)) {
            setError("Pick an exercise for each exercise group.");
            return;
        }

        if (exercises.some((exercise) => exercise.exerciseSets.length === 0)) {
            setError("Add at least one set for each exercise.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const updatedWorkout: WorkoutViewer = {
                ...workout,
                title: trimmedTitle,
                workoutNotes: notes.trim() || undefined,
                durationMin: parsedDuration,
                exercises: normalizeExerciseOrder(exercises).map((exercise, index) => {
                    const selectedExercise = exerciseLookup.get(exercise.exerciseId);

                    return {
                        workoutExerciseId: workout.exercises[index]?.workoutExerciseId ?? `local-${index}`,
                        exerciseId: exercise.exerciseId,
                        orderIndex: index + 1,
                        exerciseNotes: exercise.notes,
                        exerciseName: selectedExercise?.name ?? "Unknown exercise",
                        category: selectedExercise?.category ?? "",
                        muscleGroup: selectedExercise?.muscleGroup ?? "",
                        sets: normalizeSetNumbers(exercise.exerciseSets).map((set) => ({
                            setNumber: set.setNumber,
                            reps: set.reps,
                            weight: set.weight,
                            rpe: set.rpe,
                            isWarmup: set.isWarmup ?? false
                        }))
                    };
                })
            };

            await onSave(updatedWorkout);
            onClose();
        }
        catch (err: any) {
            setError(err.message || "Failed to update workout.");
        }
        finally {
            setSaving(false);
        }
    }

    return (
        <Modal onClose={onClose} contentClassName="workoutEditContent">
            <div className="workoutEditModal">
                <div className="modalHeader">
                    <h2>{heading}</h2>
                    <p>Edit workout details, exercises, and sets.</p>
                </div>

                <form
                    className="workoutEditForm"
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveChanges();
                    }}
                >
                    <div className="workout-top-panel">
                        <div className="field workoutEditField">
                            <label htmlFor="workout-edit-title">Title</label>
                            <input
                                id="workout-edit-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field workoutEditField">
                            <label htmlFor="workout-edit-duration">Duration</label>
                            <input
                                id="workout-edit-duration"
                                type="number"
                                min="1"
                                max="1440"
                                value={durationMin}
                                onChange={(e) => setDurationMin(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field workoutEditField">
                            <label htmlFor="workout-edit-notes">Notes</label>
                            <textarea
                                id="workout-edit-notes"
                                rows={5}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="workout-builder">
                        <div className="workout-builder-header">
                            <h2>Exercises</h2>
                            <button type="button" className="add-btn" onClick={addExercise}>
                                + Add exercise
                            </button>
                        </div>

                        {loadingExercises ? (
                            <div className="workout-empty-state">Loading exercises...</div>
                        ) : exercises.length === 0 ? (
                            <div className="workout-empty-state">No exercises added yet.</div>
                        ) : (
                            exercises.map((exercise, index) => (
                                <WorkoutExerciseComponent
                                    key={`${exercise.exerciseId}-${index}`}
                                    exercisesList={exercisesList}
                                    exercise={exercise}
                                    onAddSet={() => addSet(index)}
                                    onUpdateSet={(setIndex, field, value) => updateSet(index, setIndex, field, value)}
                                    onDeleteExercise={() => deleteExercise(index)}
                                    onDeleteSet={(setIndex) => deleteSet(index, setIndex)}
                                    onSelectExercise={(id) => selectExercise(index, id)}
                                />
                            ))
                        )}
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="modalActions">
                        <button type="button" className="add-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={saving}>
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
