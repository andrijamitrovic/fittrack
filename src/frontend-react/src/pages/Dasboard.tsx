import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { loadExercises } from "../services/exerciseService";
import { loadTemplates, loadWorkouts } from "../services/workoutService";
import type { Exercise, WorkoutViewer } from "../types";

export function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
    const [templates, setTemplates] = useState<WorkoutViewer[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([loadWorkouts(), loadTemplates(), loadExercises()])
            .then(([loadedWorkouts, loadedTemplates, loadedExercises]) => {
                setWorkouts(loadedWorkouts);
                setTemplates(loadedTemplates);
                setExercises(loadedExercises);
            })
            .catch((err) => setError(err.message || "Failed to load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    const recentWorkouts = useMemo(() => {
        return [...workouts]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4);
    }, [workouts]);

    const featuredTemplates = useMemo(() => templates.slice(0, 4), [templates]);

    function formatDate(value: string) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value.split("T")[0];
        }
        return date.toLocaleDateString();
    }

    return (
        <div className="page dashboard-page">
            <div className="dashboard-page-header">
                <h1 className="dashboard-page-title">Dashboard</h1>
                <p className="dashboard-page-subtitle">
                    Recent activity, templates, and quick actions.
                </p>
            </div>

            {loading ? (
                <p className="dashboard-status">Loading...</p>
            ) : error ? (
                <p className="dashboard-status">{error}</p>
            ) : (
                <>
                    <div className="dashboard-actions">
                        <Link className="dashboard-action-card" to="/newworkout">
                            <span className="dashboard-action-title">Add Workout</span>
                            <span className="dashboard-action-copy">Start a new session.</span>
                        </Link>
                        <Link className="dashboard-action-card" to="/workouts">
                            <span className="dashboard-action-title">Workout History</span>
                            <span className="dashboard-action-copy">Review and reuse past workouts.</span>
                        </Link>
                        <Link className="dashboard-action-card" to="/templates">
                            <span className="dashboard-action-title">Templates</span>
                            <span className="dashboard-action-copy">Jump into saved plans.</span>
                        </Link>
                    </div>

                    <div className="dashboard-stats">
                        <div className="dashboard-stat-card">
                            <span className="dashboard-stat-value">{workouts.length}</span>
                            <span className="dashboard-stat-label">Workouts</span>
                        </div>
                        <div className="dashboard-stat-card">
                            <span className="dashboard-stat-value">{templates.length}</span>
                            <span className="dashboard-stat-label">Templates</span>
                        </div>
                        <div className="dashboard-stat-card">
                            <span className="dashboard-stat-value">{exercises.length}</span>
                            <span className="dashboard-stat-label">Exercises</span>
                        </div>
                    </div>

                    <div className="dashboard-sections">
                        <section className="dashboard-section">
                            <div className="dashboard-section-header">
                                <h2>Recent Workouts</h2>
                                <Link to="/workouts">View all</Link>
                            </div>

                            {recentWorkouts.length === 0 ? (
                                <p className="dashboard-status">No workouts yet.</p>
                            ) : (
                                <div className="dashboard-list">
                                    {recentWorkouts.map((workout) => (
                                        <div className="dashboard-list-card" key={workout.workoutId}>
                                            <div className="dashboard-item-top">
                                                <div className="dashboard-item-head">
                                                    <h3>{workout.title || "Untitled workout"}</h3>
                                                    <div className="dashboard-item-meta">
                                                        <span>{formatDate(workout.date)}</span>
                                                        <span>
                                                            {workout.exercises.length}{" "}
                                                            {workout.exercises.length === 1 ? "exercise" : "exercises"}
                                                        </span>
                                                        {workout.durationMin && <span>{workout.durationMin} min</span>}
                                                    </div>
                                                    {workout.workoutNotes && (
                                                        <p className="dashboard-item-notes">{workout.workoutNotes}</p>
                                                    )}
                                                </div>

                                                <div className="dashboard-item-actions">
                                                    <button
                                                        type="button"
                                                        className="add-btn"
                                                        onClick={() => navigate(`/newworkout/${workout.workoutId}`)}
                                                    >
                                                        Copy workout
                                                    </button>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="dashboard-section">
                            <div className="dashboard-section-header">
                                <h2>Templates</h2>
                                <Link to="/templates">View all</Link>
                            </div>

                            {featuredTemplates.length === 0 ? (
                                <p className="dashboard-status">No templates yet.</p>
                            ) : (
                                <div className="dashboard-list">
                                    {featuredTemplates.map((template) => (
                                        <div className="dashboard-list-card" key={template.workoutId}>
                                            <div className="dashboard-item-top">
                                                <div className="dashboard-item-head">
                                                    <h3>{template.title || "Untitled template"}</h3>
                                                    <div className="dashboard-item-meta">
                                                        <span>
                                                            {template.exercises.length}{" "}
                                                            {template.exercises.length === 1 ? "exercise" : "exercises"}
                                                        </span>
                                                        {template.durationMin && <span>{template.durationMin} min</span>}
                                                    </div>
                                                    {template.workoutNotes && (
                                                        <p className="dashboard-item-notes">{template.workoutNotes}</p>
                                                    )}
                                                </div>

                                                <div className="dashboard-item-actions">
                                                    <button
                                                        type="button"
                                                        className="add-btn"
                                                        onClick={() => navigate(`/newworkout/${template.workoutId}`)}
                                                    >
                                                        Use template
                                                    </button>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}
