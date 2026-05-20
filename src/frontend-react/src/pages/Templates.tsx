import { Copy, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { deleteTemplateAsync, loadTemplates } from "../services/workoutService";
import type { WorkoutViewer } from "../types";

export function Templates() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function makeWorkout(workoutId: string) {
    navigate(`/app/workouts/new/${workoutId}`);
  }

  async function deleteTemplate(workoutId: string) {
    await deleteTemplateAsync(workoutId);
    setWorkouts((current) => current.filter((w) => w.workoutId !== workoutId));
  }

  function formatExerciseCount(count: number) {
    return `${count} ${count === 1 ? "exercise" : "exercises"}`;
  }

  useEffect(() => {
    loadTemplates()
      .then(setWorkouts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <TemplatesPageHeader />

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardHeader>
                <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-24 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <TemplatesPageHeader />

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Could not load templates</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <TemplatesPageHeader />

        <Card>
          <CardHeader>
            <CardTitle>No templates yet</CardTitle>
            <CardDescription>
              Turn a workout into a template to reuse it later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TemplatesPageHeader />

      <div className="space-y-4">
        {workouts.map((workout) => (
          <Card key={workout.workoutId}>
            <CardHeader>
              <div className="min-w-0 space-y-1">
                <CardTitle>{workout.title || "Untitled template"}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-3">
                  <span>{formatExerciseCount(workout.exercises.length)}</span>
                  {workout.durationMin && (
                    <span>{workout.durationMin} min</span>
                  )}
                </CardDescription>
              </div>

              <CardAction className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Use"
                  onClick={() => makeWorkout(workout.workoutId)}
                >
                  <Copy className="size-4" />
                  <span className="hidden sm:inline">Use</span>{" "}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Edit"
                  onClick={() =>
                    navigate(`/app/templates/edit/${workout.workoutId}`)
                  }
                >
                  <Pencil className="size-4" />
                  <span className="hidden sm:inline">Edit</span>{" "}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  aria-label="Delete"
                  onClick={() => deleteTemplate(workout.workoutId)}
                >
                  <Trash2 className="size-4" />
                  <span className="hidden sm:inline">Delete</span>{" "}
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent className="space-y-4">
              {workout.workoutNotes && (
                <p className="text-sm text-muted-foreground">
                  {workout.workoutNotes}
                </p>
              )}

              <div className="space-y-2">
                {workout.exercises.map((exercise) => (
                  <details
                    key={exercise.workoutExerciseId}
                    className="rounded-lg border bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium">
                      <span>{exercise.exerciseName}</span>
                      <span className="text-muted-foreground">
                        {exercise.sets.length} sets
                      </span>
                    </summary>

                    <div className="border-t px-4 py-3">
                      <div className="grid gap-2">
                        {exercise.sets.map((set) => (
                          <div
                            key={set.setNumber}
                            className="grid grid-cols-4 gap-3 rounded-md bg-muted/30 px-3 py-2 text-sm"
                          >
                            <span className="font-medium">
                              Set {set.setNumber}
                            </span>
                            <span>{set.reps ?? "-"} reps</span>
                            <span>{set.weight ?? "-"} kg</span>
                            <span>RPE {set.rpe ?? "-"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TemplatesPageHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
      <p className="text-sm text-muted-foreground">
        Reusable workout structures for fast planning.
      </p>
    </div>
  );
}
