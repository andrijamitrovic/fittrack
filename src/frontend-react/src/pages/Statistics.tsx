import { useEffect, useMemo, useState } from "react";
import { type WorkoutViewer, type Exercise, type WorkoutExercise } from "../types";
import { loadExercises } from "../services/exerciseService";
import { loadWorkouts } from "../services/workoutService";
import { Modal } from "../components/Modal";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function Statistics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [exercise, setExercise] = useState<WorkoutExercise>();
    const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
    const [query, setQuery] = useState("");

    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [selectedExerciseId, setSelectedExerciseId] = useState("");

    const selectedExercise = exercises.find(
        (item) => item.id === exercise?.id
    );

    const filteredExercises = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return exercises;
        }

        return exercises.filter((item) =>
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.category.toLowerCase().includes(normalizedQuery) ||
            item.muscleGroup.toLowerCase().includes(normalizedQuery)
        );
    }, [exercises, query]);

    function closeExercisePicker() {
        setShowExercisePicker(false);
        setQuery("");
    }

    useEffect(() => {
        loadExercises()
            .then(setExercises)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
        loadWorkouts()
            .then(setWorkouts)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    function onSelectExercise(id: string) {
        setSelectedExerciseId(id);
    }
    const chartData = useMemo(() => {
        if (!selectedExerciseId) return [];

        return workouts
            .map((workout) => {
                const matchingExercise = workout.exercises.find(
                    (exercise) => exercise.exerciseId === selectedExerciseId
                );

                if (!matchingExercise) return null;

                const workingSets = matchingExercise.sets.filter(
                    (set) => set.weight !== undefined
                );

                if (workingSets.length === 0) return null;

                const maxWeightSet = workingSets.reduce((max, current) =>
                    (current.weight ?? 0) > (max.weight ?? 0) ? current : max
                );

                return {
                    date: workout.date.split("T")[0],
                    title: workout.title ?? "Workout",
                    maxWeight: maxWeightSet.weight ?? 0,
                    reps: maxWeightSet.reps ?? 0
                };
            })
            .filter(Boolean);
    }, [workouts, selectedExerciseId]);

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>
    return (
        <div className="page statistics-page">
            <div className="statistics-page-header">
                <h1 className="statistics-page-title">
                    Statistics
                </h1>
                <p className="statistics-page-subtitle">Workout history statistics.</p>
            </div>

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


            {!selectedExerciseId ? (
                <div className="statistics-empty-state">
                    Pick an exercise to view statistics.
                </div>
            ) : chartData.length === 0 ? (
                <div className="statistics-empty-state">
                    No workout data found for that exercise.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="maxWeight"
                            stroke="#111"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}

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
                                        className={`exercise-picker-option${item.id === exercise?.exerciseId ? " is-selected" : ""}`}
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
        </div>
    )
}