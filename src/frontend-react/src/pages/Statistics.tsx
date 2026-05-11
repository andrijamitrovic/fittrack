import { useEffect, useMemo, useState } from "react";
import { type WorkoutViewer, type Exercise } from "../types";
import { loadExercises } from "../services/exerciseService";
import { loadWorkouts } from "../services/workoutService";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Search } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

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
  { key: "estimated1RM", label: "Estimated 1RM", color: "#38bdf8" },
  { key: "maxWeight", label: "Max Weight", color: "#2563eb" },
  { key: "maxReps", label: "Max Reps", color: "#16a34a", allowDecimals: false },
];

const workloadMetricOptions: {
  key: WorkloadMetricKey;
  label: string;
  color: string;
  allowDecimals?: boolean;
}[] = [
  { key: "volume", label: "Volume", color: "#7c3aed" },
  {
    key: "workingSetCount",
    label: "Working Sets",
    color: "#ea580c",
    allowDecimals: false,
  },
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

function formatTooltipValue(
  name: string | undefined,
  value: number | string | undefined,
) {
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
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadRow[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div className="rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{formatTableDate(row.date)}</p>
      <p className="text-muted-foreground">{row.title}</p>
      <p className="mt-2 font-medium">
        Best set: {row.bestSetWeight} kg x {row.bestSetReps}
      </p>

      <div className="mt-3 space-y-2">
        {payload.map((item) => (
          <div className="flex items-center gap-2" key={item.name}>
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color ?? "#111" }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <strong className="ml-auto">
              {formatTooltipValue(item.name, item.value)}
            </strong>
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
  const [selectedStrengthMetric, setSelectedStrengthMetric] =
    useState<StrengthMetricKey>("estimated1RM");
  const [selectedWorkloadMetric, setSelectedWorkloadMetric] =
    useState<WorkloadMetricKey>("volume");

  const selectedExercise = exercises.find(
    (item) => item.id === selectedExerciseId,
  );

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return exercises;
    }

    return exercises.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.muscleGroup.toLowerCase().includes(normalizedQuery),
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
          (exercise) => exercise.exerciseId === selectedExerciseId,
        );

        if (!matchingExercise) return null;

        const workingSets = matchingExercise.sets.filter(
          (set) =>
            !set.isWarmup && set.weight !== undefined && set.reps !== undefined,
        );

        if (workingSets.length === 0) return null;

        const maxWeightSet = workingSets.reduce((max, current) =>
          (current.weight ?? 0) > (max.weight ?? 0) ? current : max,
        );
        const maxRepsSet = workingSets.reduce((max, current) => {
          if ((current.reps ?? 0) > (max.reps ?? 0)) {
            return current;
          }

          if (
            (current.reps ?? 0) === (max.reps ?? 0) &&
            (current.weight ?? 0) > (max.weight ?? 0)
          ) {
            return current;
          }

          return max;
        });
        const bestStrengthSet = workingSets.reduce((best, current) =>
          toEstimatedOneRepMax(current.weight ?? 0, current.reps ?? 0) >
          toEstimatedOneRepMax(best.weight ?? 0, best.reps ?? 0)
            ? current
            : best,
        );
        const volume = workingSets.reduce(
          (sum, set) => sum + (set.weight ?? 0) * (set.reps ?? 0),
          0,
        );

        return {
          date: workout.date.split("T")[0],
          title: workout.title ?? "Workout",
          estimated1RM: roundMetric(
            toEstimatedOneRepMax(
              bestStrengthSet.weight ?? 0,
              bestStrengthSet.reps ?? 0,
            ),
            1,
          ),
          maxWeight: roundMetric(maxWeightSet.weight ?? 0, 1),
          maxReps: maxRepsSet.reps ?? 0,
          volume: roundMetric(volume, 1),
          workingSetCount: workingSets.length,
          bestSetWeight: roundMetric(bestStrengthSet.weight ?? 0, 1),
          bestSetReps: bestStrengthSet.reps ?? 0,
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
          (exercise) => exercise.exerciseId === selectedExerciseId,
        );

        if (!matchingExercise) {
          return [];
        }

        return matchingExercise.sets.map(
          (set): ExerciseSetRow => ({
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
                : null,
          }),
        );
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
          volume:
            row.weight !== null && row.reps !== null && !row.isWarmup
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
              : null,
        });
        continue;
      }

      existing.rows.push(row);

      if (!row.isWarmup && row.weight !== null && row.reps !== null) {
        existing.volume = roundMetric(
          existing.volume + row.weight * row.reps,
          1,
        );

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
      rows: group.rows.sort((a, b) => a.setNumber - b.setNumber),
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
        1,
      ),
      bestWeight: roundMetric(
        Math.max(...chartData.map((row) => row.maxWeight)),
        1,
      ),
      totalVolume: roundMetric(
        chartData.reduce((sum, row) => sum + row.volume, 0),
        1,
      ),
    };
  }, [chartData]);

  const selectedStrengthMetricOption = strengthMetricOptions.find(
    (option) => option.key === selectedStrengthMetric,
  )!;
  const selectedWorkloadMetricOption = workloadMetricOptions.find(
    (option) => option.key === selectedWorkloadMetric,
  )!;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Statistics</h1>
        <p className="text-sm text-muted-foreground">
          Workout history statistics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercise</CardTitle>
          <CardDescription>
            Select an exercise to view strength and workload trends.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="h-auto w-full justify-start px-4 py-3 text-left"
            onClick={() => setShowExercisePicker(true)}
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-medium">
                {selectedExercise?.name ?? "Pick an exercise"}
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedExercise
                  ? `${selectedExercise.category} - ${selectedExercise.muscleGroup}`
                  : "Search available exercises"}
              </span>
            </div>
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading statistics</CardTitle>
            <CardDescription>
              Preparing exercises and workout history.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : error ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Could not load statistics</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : !selectedExerciseId ? (
        <Card>
          <CardHeader>
            <CardTitle>Pick an exercise</CardTitle>
            <CardDescription>
              Choose an exercise above to view statistics.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : chartData.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No workout data found</CardTitle>
            <CardDescription>
              This exercise does not have any completed working sets yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {summaryStats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Sessions" value={summaryStats.sessions} />
              <MetricCard
                label="Best Estimated 1RM"
                value={`${summaryStats.bestEstimated1RM} kg`}
              />
              <MetricCard
                label="Best Weight"
                value={`${summaryStats.bestWeight} kg`}
              />
              <MetricCard
                label="Total Volume"
                value={`${summaryStats.totalVolume} kg`}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Strength Trend</CardTitle>
              <CardDescription>
                Best working sets per session, adjusted for reps.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {strengthMetricOptions.map((option) => (
                  <Button
                    type="button"
                    key={option.key}
                    variant={
                      selectedStrengthMetric === option.key
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedStrengthMetric(option.key)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatChartDate}
                          tickMargin={10}
                          minTickGap={32}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          allowDecimals={
                            selectedStrengthMetricOption.allowDecimals ?? true
                          }
                        />
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
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workload</CardTitle>
              <CardDescription>
                Total working volume and set count per session.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {workloadMetricOptions.map((option) => (
                  <Button
                    type="button"
                    key={option.key}
                    variant={
                      selectedWorkloadMetric === option.key
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedWorkloadMetric(option.key)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatChartDate}
                          tickMargin={10}
                          minTickGap={32}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          allowDecimals={
                            selectedWorkloadMetricOption.allowDecimals ?? true
                          }
                        />
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
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Set History</CardTitle>
              <CardDescription>Grouped by workout session.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {sessionGroups.map((session) => (
                <section key={session.workoutId} className="rounded-lg border">
                  <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium">
                        {formatTableDate(session.date)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {session.title}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{session.volume} kg volume</span>
                      <span>
                        {session.bestSetWeight !== null &&
                        session.bestSetReps !== null
                          ? `Best set ${session.bestSetWeight} kg x ${session.bestSetReps}`
                          : "No working sets"}
                      </span>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Set</TableHead>
                        <TableHead>Reps</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>RPE</TableHead>
                        <TableHead>Warmup</TableHead>
                        <TableHead>Estimated 1RM</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {session.rows.map((row) => (
                        <TableRow
                          key={`${session.workoutId}-${row.setNumber}-${row.weight ?? "na"}`}
                        >
                          <TableCell>{row.setNumber}</TableCell>
                          <TableCell>{row.reps ?? "-"}</TableCell>
                          <TableCell>
                            {row.weight !== null ? `${row.weight} kg` : "-"}
                          </TableCell>
                          <TableCell>
                            {row.rpe !== null ? row.rpe : "-"}
                          </TableCell>
                          <TableCell>{row.isWarmup ? "Yes" : "No"}</TableCell>
                          <TableCell>
                            {row.estimated1RM !== null
                              ? `${row.estimated1RM} kg`
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              ))}
            </CardContent>
          </Card>
        </>
      )}
      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pick exercise</DialogTitle>
            <DialogDescription>
              Search by name, category, or muscle group.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              type="search"
              className="pl-9"
              placeholder="Search exercises"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {filteredExercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No exercises match your search.
              </p>
            ) : (
              filteredExercises.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                  onClick={() => {
                    onSelectExercise(item.id);
                    closeExercisePicker();
                  }}
                >
                  <span className="block font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.category} - {item.muscleGroup}
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
