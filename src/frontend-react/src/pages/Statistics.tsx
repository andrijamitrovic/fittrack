import { useEffect, useMemo, useState } from "react";
import { type WorkoutViewer, type Exercise } from "../types";
import { loadExercises } from "../services/exerciseService";
import { loadWorkouts } from "../services/workoutService";
import { Modal } from "../components/Modal";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type WorkoutMetricRow = {
    date: string;
    title: string;
    estimated1RM: number;
    maxWeight: number;
    maxReps: number;
    volume: number;
    workingSetCount: number;
    bestSetWeight: number;
    bestSetReps: number;
};

type ExerciseSetRow = {
    workoutId: string;
    date: string;
    title: string;
    setNumber: number;
    reps: number | null;
    weight: number | null;
    rpe: number | null;
    isWarmup: boolean;
    estimated1RM: number | null;
};

type ExerciseSessionGroup = {
    workoutId: string;
    date: string;
    title: string;
    rows: ExerciseSetRow[];
    volume: number;
    bestSetWeight: number | null;
    bestSetReps: number | null;
    bestEstimated1RM: number | null;
};

type TooltipPayloadRow = {
    color?: string;
    name?: string;
    value?: number | string;
    payload: WorkoutMetricRow;
};

type StrengthMetricKey = "estimated1RM" | "maxWeight" | "maxReps";
type WorkloadMetricKey = "volume" | "workingSetCount";

const strengthMetricOptions: {
    key: StrengthMetricKey;
    label: string;
    color: string;
    allowDecimals?: boolean;
}[] = [
    { key: "estimated1RM", label: "Estimated 1RM", color: "#111111" },
    { key: "maxWeight", label: "Max Weight", color: "#2563eb" },
    { key: "maxReps", label: "Max Reps", color: "#16a34a", allowDecimals: false }
];

const workloadMetricOptions: {
    key: WorkloadMetricKey;
    label: string;
    color: string;
    allowDecimals?: boolean;
}[] = [
    { key: "volume", label: "Volume", color: "#7c3aed" },
    { key: "workingSetCount", label: "Working Sets", color: "#ea580c", allowDecimals: false }
];

function roundMetric(value: number, digits = 1) {
    return Number(value.toFixed(digits));
}

function toEstimatedOneRepMax(weight: number, reps: number) {
    return weight * (1 + reps / 30);
}

function formatChartDate(value: string) {
    const [, month, day] = value.split("-");
    return `${day}.${month}`;
}

function formatTableDate(value: string) {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
}

function formatTooltipValue(name: string | undefined, value: number | string | undefined) {
    if (typeof value !== "number") {
        return value ?? "-";
    }

    switch (name) {
        case "Max Reps":
        case "Working Sets":
            return value.toString();
        case "Max Weight":
        case "Volume":
            return `${roundMetric(value, 1)} kg`;
        default:
            return `${roundMetric(value, 1)} kg`;
    }
}

function StatisticsTooltip({
    active,
    payload
}: {
    active?: boolean;
    payload?: TooltipPayloadRow[];
}) {
    if (!active || !payload?.length) {
        return null;
    }

    const row = payload[0].payload;

    return (
        <div className="statistics-tooltip">
            <p className="statistics-tooltip-title">{formatTableDate(row.date)}</p>
            <p className="statistics-tooltip-subtitle">{row.title}</p>
            <p className="statistics-tooltip-highlight">
                Best set: {row.bestSetWeight} kg x {row.bestSetReps}
            </p>
            <div className="statistics-tooltip-values">
                {payload.map((item) => (
                    <div className="statistics-tooltip-value" key={item.name}>
                        <span
                            className="statistics-tooltip-dot"
                            style={{ backgroundColor: item.color ?? "#111" }}
                        />
                        <span>{item.name}</span>
                        <strong>{formatTooltipValue(item.name, item.value)}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function Statistics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
    const [query, setQuery] = useState("");

    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [selectedExerciseId, setSelectedExerciseId] = useState("");
    const [selectedStrengthMetric, setSelectedStrengthMetric] = useState<StrengthMetricKey>("estimated1RM");
    const [selectedWorkloadMetric, setSelectedWorkloadMetric] = useState<WorkloadMetricKey>("volume");

    const selectedExercise = exercises.find(
        (item) => item.id === selectedExerciseId
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
        Promise.all([loadExercises(), loadWorkouts()])
            .then(([loadedExercises, loadedWorkouts]) => {
                setExercises(loadedExercises);
                setWorkouts(loadedWorkouts);
            })
            .catch((err) => setError(err.message))
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
                    (set) =>
                        !set.isWarmup &&
                        set.weight !== undefined &&
                        set.reps !== undefined
                );

                if (workingSets.length === 0) return null;

                const maxWeightSet = workingSets.reduce((max, current) =>
                    (current.weight ?? 0) > (max.weight ?? 0) ? current : max
                );
                const maxRepsSet = workingSets.reduce((max, current) => {
                    if ((current.reps ?? 0) > (max.reps ?? 0)) {
                        return current;
                    }

                    if ((current.reps ?? 0) === (max.reps ?? 0) && (current.weight ?? 0) > (max.weight ?? 0)) {
                        return current;
                    }

                    return max;
                });
                const bestStrengthSet = workingSets.reduce((best, current) =>
                    toEstimatedOneRepMax(current.weight ?? 0, current.reps ?? 0) >
                    toEstimatedOneRepMax(best.weight ?? 0, best.reps ?? 0)
                        ? current
                        : best
                );
                const volume = workingSets.reduce(
                    (sum, set) => sum + (set.weight ?? 0) * (set.reps ?? 0),
                    0
                );

                return {
                    date: workout.date.split("T")[0],
                    title: workout.title ?? "Workout",
                    estimated1RM: roundMetric(
                        toEstimatedOneRepMax(bestStrengthSet.weight ?? 0, bestStrengthSet.reps ?? 0),
                        1
                    ),
                    maxWeight: roundMetric(maxWeightSet.weight ?? 0, 1),
                    maxReps: maxRepsSet.reps ?? 0,
                    volume: roundMetric(volume, 1),
                    workingSetCount: workingSets.length,
                    bestSetWeight: roundMetric(bestStrengthSet.weight ?? 0, 1),
                    bestSetReps: bestStrengthSet.reps ?? 0
                };
            })
            .filter((item): item is WorkoutMetricRow => item !== null)
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [workouts, selectedExerciseId]);

    const tableRows = useMemo(() => {
        if (!selectedExerciseId) {
            return [];
        }

        return workouts
            .flatMap((workout) => {
                const matchingExercise = workout.exercises.find(
                    (exercise) => exercise.exerciseId === selectedExerciseId
                );

                if (!matchingExercise) {
                    return [];
                }

                return matchingExercise.sets.map((set): ExerciseSetRow => ({
                    workoutId: workout.workoutId,
                    date: workout.date.split("T")[0],
                    title: workout.title ?? "Workout",
                    setNumber: set.setNumber,
                    reps: set.reps ?? null,
                    weight: set.weight ?? null,
                    rpe: set.rpe ?? null,
                    isWarmup: Boolean(set.isWarmup),
                    estimated1RM:
                        set.weight !== undefined && set.reps !== undefined
                            ? roundMetric(toEstimatedOneRepMax(set.weight, set.reps), 1)
                            : null
                }));
            })
            .sort((a, b) => {
                if (a.date !== b.date) {
                    return b.date.localeCompare(a.date);
                }

                return a.setNumber - b.setNumber;
            });
    }, [workouts, selectedExerciseId]);

    const sessionGroups = useMemo(() => {
        const groups = new Map<string, ExerciseSessionGroup>();

        for (const row of tableRows) {
            const existing = groups.get(row.workoutId);

            if (!existing) {
                groups.set(row.workoutId, {
                    workoutId: row.workoutId,
                    date: row.date,
                    title: row.title,
                    rows: [row],
                    volume: row.weight !== null && row.reps !== null && !row.isWarmup
                        ? roundMetric(row.weight * row.reps, 1)
                        : 0,
                    bestSetWeight:
                        !row.isWarmup && row.weight !== null && row.reps !== null
                            ? row.weight
                            : null,
                    bestSetReps:
                        !row.isWarmup && row.weight !== null && row.reps !== null
                            ? row.reps
                            : null,
                    bestEstimated1RM:
                        !row.isWarmup && row.estimated1RM !== null
                            ? row.estimated1RM
                            : null
                });
                continue;
            }

            existing.rows.push(row);

            if (!row.isWarmup && row.weight !== null && row.reps !== null) {
                existing.volume = roundMetric(existing.volume + row.weight * row.reps, 1);

                if (
                    existing.bestEstimated1RM === null ||
                    (row.estimated1RM ?? 0) > existing.bestEstimated1RM
                ) {
                    existing.bestEstimated1RM = row.estimated1RM;
                    existing.bestSetWeight = row.weight;
                    existing.bestSetReps = row.reps;
                }
            }
        }

        return Array.from(groups.values()).map((group) => ({
            ...group,
            rows: group.rows.sort((a, b) => a.setNumber - b.setNumber)
        }));
    }, [tableRows]);

    const summaryStats = useMemo(() => {
        if (chartData.length === 0) {
            return null;
        }

        return {
            sessions: chartData.length,
            bestEstimated1RM: roundMetric(
                Math.max(...chartData.map((row) => row.estimated1RM)),
                1
            ),
            bestWeight: roundMetric(
                Math.max(...chartData.map((row) => row.maxWeight)),
                1
            ),
            totalVolume: roundMetric(
                chartData.reduce((sum, row) => sum + row.volume, 0),
                1
            )
        };
    }, [chartData]);

    const selectedStrengthMetricOption = strengthMetricOptions.find(
        (option) => option.key === selectedStrengthMetric
    )!;
    const selectedWorkloadMetricOption = workloadMetricOptions.find(
        (option) => option.key === selectedWorkloadMetric
    )!;

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

            {loading ? (
                <p className="statistics-status">Loading...</p>
            ) : error ? (
                <p className="statistics-status">{error}</p>
            ) : !selectedExerciseId ? (
                <div className="statistics-empty-state">
                    Pick an exercise to view statistics.
                </div>
            ) : chartData.length === 0 ? (
                <div className="statistics-empty-state">
                    No workout data found for that exercise.
                </div>
            ) : (
                <>
                    {summaryStats && (
                        <div className="statistics-summary">
                            <div className="statistics-summary-card">
                                <span className="statistics-summary-value">{summaryStats.sessions}</span>
                                <span className="statistics-summary-label">Sessions</span>
                            </div>
                            <div className="statistics-summary-card">
                                <span className="statistics-summary-value">{summaryStats.bestEstimated1RM}</span>
                                <span className="statistics-summary-label">Best Estimated 1RM</span>
                            </div>
                            <div className="statistics-summary-card">
                                <span className="statistics-summary-value">{summaryStats.bestWeight}</span>
                                <span className="statistics-summary-label">Best Weight</span>
                            </div>
                            <div className="statistics-summary-card">
                                <span className="statistics-summary-value">{summaryStats.totalVolume}</span>
                                <span className="statistics-summary-label">Total Volume</span>
                            </div>
                        </div>
                    )}

                    <div className="statistics-chart-card">
                        <div className="statistics-section-header">
                            <div>
                                <h2>Strength Trend</h2>
                                <p>Best working sets per session, adjusted for reps.</p>
                            </div>
                        </div>

                        <div className="statistics-metric-picker">
                            {strengthMetricOptions.map((option) => (
                                <button
                                    type="button"
                                    key={option.key}
                                    className={`statistics-metric-button${selectedStrengthMetric === option.key ? " is-active" : ""}`}
                                    onClick={() => setSelectedStrengthMetric(option.key)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="statistics-chart-scroll">
                            <div className="statistics-chart-frame">
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatChartDate}
                                            angle={0}
                                            textAnchor="middle"
                                            tickMargin={10}
                                            minTickGap={32}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis allowDecimals={selectedStrengthMetricOption.allowDecimals ?? true} />
                                        <Tooltip content={<StatisticsTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey={selectedStrengthMetric}
                                            name={selectedStrengthMetricOption.label}
                                            stroke={selectedStrengthMetricOption.color}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="statistics-chart-card">
                        <div className="statistics-section-header">
                            <div>
                                <h2>Workload</h2>
                                <p>Total working volume and set count per session.</p>
                            </div>
                        </div>

                        <div className="statistics-metric-picker">
                            {workloadMetricOptions.map((option) => (
                                <button
                                    type="button"
                                    key={option.key}
                                    className={`statistics-metric-button${selectedWorkloadMetric === option.key ? " is-active" : ""}`}
                                    onClick={() => setSelectedWorkloadMetric(option.key)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="statistics-chart-scroll">
                            <div className="statistics-chart-frame">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatChartDate}
                                            angle={0}
                                            textAnchor="middle"
                                            tickMargin={10}
                                            minTickGap={32}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis allowDecimals={selectedWorkloadMetricOption.allowDecimals ?? true} />
                                        <Tooltip content={<StatisticsTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey={selectedWorkloadMetric}
                                            name={selectedWorkloadMetricOption.label}
                                            stroke={selectedWorkloadMetricOption.color}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="statistics-table-card">
                        <div className="statistics-section-header">
                            <div>
                                <h2>Set History</h2>
                                <p>Grouped by workout session.</p>
                            </div>
                        </div>

                        <div className="statistics-session-list">
                            {sessionGroups.map((session) => (
                                <section className="statistics-session-card" key={session.workoutId}>
                                    <div className="statistics-session-header">
                                        <div className="statistics-session-head">
                                            <h3>{formatTableDate(session.date)}</h3>
                                            <p>{session.title}</p>
                                        </div>
                                        <div className="statistics-session-meta">
                                            <span>{session.volume} kg volume</span>
                                            <span>
                                                {session.bestSetWeight !== null && session.bestSetReps !== null
                                                    ? `Best set ${session.bestSetWeight} kg x ${session.bestSetReps}`
                                                    : "No working sets"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="statistics-table-wrap">
                                        <table className="statistics-data-table">
                                            <thead>
                                                <tr>
                                                    <th>Set</th>
                                                    <th>Reps</th>
                                                    <th>Weight</th>
                                                    <th>RPE</th>
                                                    <th>Warmup</th>
                                                    <th>Estimated 1RM</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {session.rows.map((row) => (
                                                    <tr key={`${session.workoutId}-${row.setNumber}-${row.weight ?? "na"}`}>
                                                        <td>{row.setNumber}</td>
                                                        <td>{row.reps ?? "-"}</td>
                                                        <td>{row.weight !== null ? `${row.weight} kg` : "-"}</td>
                                                        <td>{row.rpe !== null ? row.rpe : "-"}</td>
                                                        <td>{row.isWarmup ? "Yes" : "No"}</td>
                                                        <td>{row.estimated1RM !== null ? `${row.estimated1RM} kg` : "-"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </>
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
                                        className={`exercise-picker-option${item.id === selectedExerciseId ? " is-selected" : ""}`}
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
