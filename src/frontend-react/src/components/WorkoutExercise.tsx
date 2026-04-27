import { useMemo, useState } from "react";
import type { Exercise, WorkoutExercise } from "../types";
import { WorkoutExerciseSetComponent } from "./WorkoutExerciseSet";
import { Modal } from "./Modal";

interface WorkoutExerciseProps {
    exercisesList: Exercise[];
    exercise: WorkoutExercise;
    onAddSet: () => void;
    onUpdateSet: (setIndex: number, field: string, value: number | undefined) => void;
    onDeleteSet: (setIndex: number) => void;
    onDeleteExercise: () => void;
    onSelectExercise: (id: string) => void;
}

export function WorkoutExerciseComponent({
    exercisesList,
    exercise,
    onAddSet,
    onUpdateSet,
    onDeleteSet,
    onDeleteExercise,
    onSelectExercise
}: WorkoutExerciseProps) {
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [query, setQuery] = useState("");

    const selectedExercise = exercisesList.find(
        (item) => item.id === exercise.exerciseId
    );

    const filteredExercises = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return exercisesList;
        }

        return exercisesList.filter((item) =>
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.category.toLowerCase().includes(normalizedQuery) ||
            item.muscleGroup.toLowerCase().includes(normalizedQuery)
        );
    }, [exercisesList, query]);

    function closeExercisePicker() {
        setShowExercisePicker(false);
        setQuery("");
    }

    return (
        <>
            <div className="exercise-group">
                <div className="exercise-picker-field">
                    <span className="exercise-picker-label">Exercise</span>
                    <button
                        type="button"
                        className={`exercise-picker-trigger${selectedExercise ? "" : " is-empty"}`}
                        onClick={() => setShowExercisePicker(true)}
                    >
                        <span className="exercise-picker-trigger-name">
                            {selectedExercise?.name ?? "Pick an exercise"}
                        </span>
                        <span className="exercise-picker-trigger-meta">
                            {selectedExercise
                                ? `${selectedExercise.category} - ${selectedExercise.muscleGroup}`
                                : "Search available exercises"}
                        </span>
                    </button>
                </div>


                {exercise.exerciseSets.map((set, setIndex) => (
                    <WorkoutExerciseSetComponent
                        key={setIndex}
                        set={set}
                        onChange={(field: string, value: number | undefined) => onUpdateSet(setIndex, field, value)}
                        onDelete={() => onDeleteSet(setIndex)}
                    />
                ))}

                <div className="exercise-actions">
                    <button type="button" className="add-btn" onClick={onAddSet}>Add Set</button>
                    <button type="button" className="remove-btn" onClick={onDeleteExercise}>Remove Exercise</button>
                </div>
            </div>

            {showExercisePicker && (
                <Modal onClose={closeExercisePicker}>
                    <div className="exercise-picker">
                        <div className="exercise-picker-header">
                            <div>
                                <h3>Pick exercise</h3>
                                <p>Search by name, category, or muscle group.</p>
                            </div>
                            <button
                                type="button"
                                className="add-btn"
                                onClick={closeExercisePicker}
                            >
                                Close
                            </button>
                        </div>

                        <input
                            autoFocus
                            type="search"
                            className="exercise-picker-search"
                            placeholder="Search exercises"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />

                        <div className="exercise-picker-list">
                            {filteredExercises.length === 0 ? (
                                <p className="exercise-picker-empty">No exercises match your search.</p>
                            ) : (
                                filteredExercises.map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        className={`exercise-picker-option${item.id === exercise.exerciseId ? " is-selected" : ""}`}
                                        onClick={() => {
                                            onSelectExercise(item.id);
                                            closeExercisePicker();
                                        }}
                                    >
                                        <span className="exercise-picker-option-name">{item.name}</span>
                                        <span className="exercise-picker-option-meta">
                                            {item.category} - {item.muscleGroup}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </Modal>
            )}

        </>
    );
}
