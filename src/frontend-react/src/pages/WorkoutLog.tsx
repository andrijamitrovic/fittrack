import { useEffect, useState, type ChangeEvent } from "react";
import type { Exercise, WorkoutExercise } from "../types";
import { WorkoutExerciseComponent } from "../components/WorkoutExercise";
import {
  createWorkout,
  loadWorkout,
  updateWorkoutAsync,
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

type DraftExerciseSet = WorkoutExercise["exerciseSets"][number] & {
  clientId: string;
};

type DraftWorkoutExercise = Omit<WorkoutExercise, "exerciseSets"> & {
  clientId: string;
  exerciseSets: DraftExerciseSet[];
};

type WorkoutLogMode = "create" | "copy" | "edit";

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

  const pageTitle =
    mode === "edit"
      ? "Edit Workout"
      : mode === "copy"
        ? "Copy Workout"
        : "Add Workout";

  const pageDescription =
    mode === "edit"
      ? "Update the session, reorder sets, then save your changes."
      : "Build the session, add sets, then save it to your history.";

  const submitLabel = mode === "edit" ? "Save changes" : "Save workout";

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
      if (mode === "edit") {
        if (!workoutId) {
          throw new Error("Workout id is required for editing.");
        }

        await updateWorkoutAsync(buildWorkoutViewerForUpdate(), workoutId);
      } else {
        await createWorkout({
          notes: notes || undefined,
          title,
          durationMin: 1,
          workoutExercises,
        });
      }

      navigate("/workouts");
    } catch (err: any) {
      setSaveError(err.message || "Failed to save workout");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadExercises()
      .then(setExercisesList)
      .catch((err) => console.error(err));

    if (workoutId) {
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
    }
  }, []);

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
    </div>
  );
}
