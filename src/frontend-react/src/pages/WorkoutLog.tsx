import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Exercise, WorkoutExercise, WorkoutViewer } from "../types";
import { WorkoutExerciseComponent } from "../components/WorkoutExercise";
import {
  createWorkout,
  loadWorkout,
  updateWorkoutAsync,
  updateTemplateAsync,
} from "../services/workoutService";
import { loadExercises } from "../services/exerciseService";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { loadWorkouts } from "../services/workoutService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

type DraftExerciseSet = WorkoutExercise["exerciseSets"][number] & {
  clientId: string;
};

type DraftWorkoutExercise = Omit<WorkoutExercise, "exerciseSets"> & {
  clientId: string;
  exerciseSets: DraftExerciseSet[];
};

type WorkoutLogMode = "create" | "copy" | "edit" | "edit-template";

type WorkoutLogProps = {
  mode: WorkoutLogMode;
};

export function WorkoutLog({ mode }: WorkoutLogProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const navigate = useNavigate();
  const { workoutId } = useParams();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<DraftWorkoutExercise[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutViewer[]>([]);
  const [workoutSearchOpen, setWorkoutSearchOpen] = useState(false);
  const [workoutQuery, setWorkoutQuery] = useState("");

  function copyFromWorkout(workoutId: string) {
    setWorkoutSearchOpen(false);
    setWorkoutQuery("");
    navigate(`/app/workouts/new/${workoutId}`);
  }

  const filteredWorkouts = useMemo(() => {
    const normalizedQuery = workoutQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return recentWorkouts;
    }

    return recentWorkouts.filter((workout) => {
      const title = workout.title?.toLowerCase() ?? "";
      const notes = workout.workoutNotes?.toLowerCase() ?? "";
      const exerciseNames = workout.exercises
        .map((exercise) => exercise.exerciseName.toLowerCase())
        .join(" ");

      return (
        title.includes(normalizedQuery) ||
        notes.includes(normalizedQuery) ||
        exerciseNames.includes(normalizedQuery)
      );
    });
  }, [recentWorkouts, workoutQuery]);

  const pageTitle =
    mode === "edit-template"
      ? "Edit Template"
      : mode === "edit"
        ? "Edit Workout"
        : mode === "copy"
          ? "Copy Workout"
          : "Add Workout";

  const pageDescription =
    mode === "edit-template"
      ? "Update the reusable workout structure and save your template."
      : mode === "edit"
        ? "Update the session, reorder sets, then save your changes."
        : "Build the session, add sets, then save it to your history.";

  const submitLabel =
    mode === "edit-template"
      ? "Save template"
      : mode === "edit"
        ? "Save changes"
        : "Save workout";

  const workoutExercises = exercises.map((exercise, exerciseIndex) => ({
    exerciseId: exercise.exerciseId,
    orderIndex: exerciseIndex + 1,
    exerciseSets: exercise.exerciseSets.map((set, setIndex) => ({
      setNumber: setIndex + 1,
      reps: set.reps,
      weight: set.weight,
      rpe: set.rpe,
      isWarmup: set.isWarmup,
    })),
  }));

  function handleChangeTitle(e: ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleChangeNotes(e: ChangeEvent<HTMLTextAreaElement>) {
    setNotes(e.target.value);
  }

  function deleteExercise(exerciseIndex: number) {
    setExercises(exercises.filter((_, i) => i !== exerciseIndex));
  }

  function createClientId() {
    return crypto.randomUUID();
  }

  function addExercise() {
    setExercises([
      ...exercises,
      {
        clientId: createClientId(),
        exerciseId: "",
        orderIndex: exercises.length + 1,
        exerciseSets: [],
      },
    ]);
  }

  function selectExercise(exerciseIndex: number, exerciseId: string) {
    const updated = [...exercises];
    updated[exerciseIndex].exerciseId = exerciseId;
    setExercises([...updated]);
  }

  function addSet(exerciseIndex: number) {
    const updated = [...exercises];

    updated[exerciseIndex].exerciseSets.push({
      clientId: createClientId(),
      setNumber: updated[exerciseIndex].exerciseSets.length + 1,
      reps: undefined,
      weight: undefined,
      rpe: undefined,
      isWarmup: false,
    });

    setExercises(updated);
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: number | undefined,
  ) {
    const updated = [...exercises];
    updated[exerciseIndex].exerciseSets[setIndex] = {
      ...updated[exerciseIndex].exerciseSets[setIndex],
      [field]: value,
    };
    setExercises([...updated]);
  }

  function deleteSet(exerciseIndex: number, setIndex: number) {
    const updated = [...exercises];
    updated[exerciseIndex].exerciseSets = updated[
      exerciseIndex
    ].exerciseSets.filter((_, i) => i !== setIndex);
    setExercises([...updated]);
  }

  function reorderSets(
    exerciseIndex: number,
    oldIndex: number,
    newIndex: number,
  ) {
    setExercises((current) => {
      const updated = [...current];
      const exercise = updated[exerciseIndex];

      updated[exerciseIndex] = {
        ...exercise,
        exerciseSets: arrayMove(exercise.exerciseSets, oldIndex, newIndex).map(
          (set, index) => ({
            ...set,
            setNumber: index + 1,
          }),
        ),
      };

      return updated;
    });
  }

  async function saveWorkout() {
    if (exercises.length === 0) {
      setSaveError("Add at least one exercise.");
      return;
    }

    if (exercises.some((exercise) => !exercise.exerciseId)) {
      setSaveError("Pick an exercise for each exercise group.");
      return;
    }

    if (exercises.some((exercise) => exercise.exerciseSets.length === 0)) {
      setSaveError("Add at least one set for each exercise.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      if (mode === "edit" || mode === "edit-template") {
        if (!workoutId) {
          throw new Error("Workout id is required for editing.");
        }

        if (mode === "edit-template") {
          await updateTemplateAsync(buildWorkoutViewerForUpdate(), workoutId);
        } else {
          await updateWorkoutAsync(buildWorkoutViewerForUpdate(), workoutId);
        }
      } else {
        await createWorkout({
          notes: notes || undefined,
          title,
          durationMin: 1,
          workoutExercises,
        });
      }

      navigate(mode === "edit-template" ? "/app/templates" : "/app/workouts");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save workout");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadExercises()
      .then(setExercisesList)
      .catch((err) => console.error(err));

    loadWorkouts()
      .then((items) => {
        const sorted = [...items].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setRecentWorkouts(sorted);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!workoutId) {
      if (mode === "create") {
        setTitle("");
        setNotes("");
        setExercises([]);
      }

      return;
    }

    loadWorkout(workoutId)
      .then((workout) => {
        setTitle(workout.title || "");
        setNotes(workout.workoutNotes || "");
        setExercises(
          workout.exercises.map((e, index) => ({
            clientId: createClientId(),
            exerciseId: e.exerciseId,
            orderIndex: index + 1,
            exerciseSets: e.sets.map((s, setIndex) => ({
              clientId: createClientId(),
              setNumber: setIndex + 1,
              reps: s.reps,
              weight: s.weight,
              rpe: s.rpe,
              isWarmup: s.isWarmup,
            })),
          })),
        );
      })
      .catch((err) => console.error(err));
  }, [workoutId, mode]);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    saveWorkout();
  }

  function handleExerciseDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setExercises((current) => {
      const oldIndex = current.findIndex((item) => item.clientId === active.id);
      const newIndex = current.findIndex((item) => item.clientId === over.id);

      return arrayMove(current, oldIndex, newIndex).map((exercise, index) => ({
        ...exercise,
        orderIndex: index + 1,
      }));
    });
  }

  function buildWorkoutViewerForUpdate() {
    return {
      workoutId: workoutId!,
      title,
      date: new Date().toISOString(),
      workoutNotes: notes || undefined,
      durationMin: 1,
      exercises: workoutExercises.map((exercise, exerciseIndex) => {
        const selectedExercise = exercisesList.find(
          (item) => item.id === exercise.exerciseId,
        );

        return {
          workoutExerciseId: `local-${exerciseIndex}`,
          exerciseId: exercise.exerciseId,
          orderIndex: exercise.orderIndex,
          exerciseName: selectedExercise?.name ?? "Unknown exercise",
          category: selectedExercise?.category ?? "",
          muscleGroup: selectedExercise?.muscleGroup ?? "",
          sets: exercise.exerciseSets.map((set) => ({
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            isWarmup: set.isWarmup ?? false,
          })),
        };
      }),
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>
      </div>
      {mode === "create" && recentWorkouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Start from existing workout</CardTitle>
            <CardDescription>
              Copy a recent workout and adjust it for today.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {recentWorkouts.slice(0, 3).map((workout) => (
              <div
                key={workout.workoutId}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {workout.title || "Untitled workout"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {workout.date.split("T")[0]} · {workout.exercises.length}{" "}
                    exercises
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyFromWorkout(workout.workoutId)}
                >
                  Copy
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setWorkoutSearchOpen(true)}
            >
              Browse all workouts
            </Button>
          </CardContent>
        </Card>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Workout details</CardTitle>
            <CardDescription>
              Name the session and add optional notes.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={handleChangeTitle}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={handleChangeNotes}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercises</CardTitle>
            <CardDescription>Add exercises and track sets.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleExerciseDragEnd}
            >
              <SortableContext
                items={exercises.map((exercise) => exercise.clientId)}
                strategy={verticalListSortingStrategy}
              >
                {exercises.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No exercises added yet.
                  </div>
                ) : (
                  exercises.map((exercise, index) => (
                    <WorkoutExerciseComponent
                      id={exercise.clientId}
                      key={exercise.clientId}
                      exercisesList={exercisesList}
                      exercise={exercise}
                      onAddSet={() => addSet(index)}
                      onUpdateSet={(setIndex, field, value) =>
                        updateSet(index, setIndex, field, value)
                      }
                      onDeleteExercise={() => deleteExercise(index)}
                      onDeleteSet={(setIndex) => deleteSet(index, setIndex)}
                      onSelectExercise={(id) => selectExercise(index, id)}
                      onReorderSets={(oldIndex, newIndex) =>
                        reorderSets(index, oldIndex, newIndex)
                      }
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>

            <div className="flex justify-end border-t pt-4">
              <Button type="button" variant="outline" onClick={addExercise}>
                <Plus className="size-4" />
                Add exercise
              </Button>
            </div>
          </CardContent>
        </Card>

        {saveError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>

      <Dialog open={workoutSearchOpen} onOpenChange={setWorkoutSearchOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Copy workout</DialogTitle>
            <DialogDescription>
              Search your workout history and copy one into a new session.
            </DialogDescription>
          </DialogHeader>

          <Input
            autoFocus
            placeholder="Search by title, notes, or exercise"
            value={workoutQuery}
            onChange={(e) => setWorkoutQuery(e.target.value)}
          />

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {filteredWorkouts.map((workout) => (
              <button
                type="button"
                key={workout.workoutId}
                className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                onClick={() => copyFromWorkout(workout.workoutId)}
              >
                <span className="block font-medium">
                  {workout.title || "Untitled workout"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {workout.date.split("T")[0]} · {workout.exercises.length}{" "}
                  exercises
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
