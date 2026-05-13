import { useEffect, useState } from "react";
import {
  addExerciseAsync,
  deleteExerciseAsync,
  loadExercises,
  updateExerciseAsync,
} from "../services/exerciseService";
import type { Exercise } from "../types";
import { ExerciseForm } from "../components/ExerciseAddForm";
import { Dumbbell, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export function AdminExercises() {
  const [showForm, setShowForm] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  async function saveExercise(exercise: Exercise) {
    const newExercise = { ...exercise, id: crypto.randomUUID() };
    await addExerciseAsync(newExercise);
    setExercises((prev) => [...prev, newExercise]);
  }
  async function updateExercise(exercise: Exercise) {
    await updateExerciseAsync(exercise);
    setExercises((prev) =>
      prev.map((x) => (x.id === exercise.id ? exercise : x)),
    );
  }
  async function deleteExercise(exerciseId: string) {
    await deleteExerciseAsync(exerciseId);
    setExercises(exercises.filter((x) => x.id !== exerciseId));
  }

  useEffect(() => {
    loadExercises()
      .then(setExercises)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading exercises</CardTitle>
          <CardDescription>Fetching the exercise library.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Could not load exercises</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Exercises</h1>
          <p className="text-sm text-muted-foreground">
            Manage the exercise library.
          </p>
        </div>

        <Button type="button" onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          Add exercise
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="size-5" />
            Exercise library
          </CardTitle>
          <CardDescription>
            {exercises.length}{" "}
            {exercises.length === 1 ? "exercise" : "exercises"} found.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {exercises.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No exercises found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Muscle group</TableHead>
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {exercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell className="font-medium">
                      {exercise.name}
                    </TableCell>
                    <TableCell>{exercise.category}</TableCell>
                    <TableCell>{exercise.muscleGroup}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingExercise(exercise)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteExercise(exercise.id)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add exercise</DialogTitle>
            <DialogDescription>
              Add a new exercise to the library.
            </DialogDescription>
          </DialogHeader>

          <ExerciseForm
            key="new-exercise"
            formExercise={null}
            onAdd={async (exercise) => {
              await saveExercise(exercise);
              setShowForm(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingExercise !== null}
        onOpenChange={(open) => !open && setEditingExercise(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit exercise</DialogTitle>
            <DialogDescription>
              Update this exercise in the library.
            </DialogDescription>
          </DialogHeader>

          {editingExercise && (
            <ExerciseForm
              key={editingExercise.id}
              formExercise={editingExercise}
              onAdd={async (updated) => {
                await updateExercise(updated);
                setEditingExercise(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
