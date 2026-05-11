import { useMemo, useState } from "react";
import type { Exercise, WorkoutExercise } from "../types";
import { WorkoutExerciseSetComponent } from "./WorkoutExerciseSet";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Search, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";

import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type DraftExerciseSet = WorkoutExercise["exerciseSets"][number] & {
  clientId: string;
};

type DraftWorkoutExercise = Omit<WorkoutExercise, "exerciseSets"> & {
  clientId: string;
  exerciseSets: DraftExerciseSet[];
};

interface WorkoutExerciseProps {
  id: string;
  exercisesList: Exercise[];
  exercise: DraftWorkoutExercise;
  onAddSet: () => void;
  onUpdateSet: (
    setIndex: number,
    field: string,
    value: number | undefined,
  ) => void;
  onDeleteSet: (setIndex: number) => void;
  onDeleteExercise: () => void;
  onSelectExercise: (id: string) => void;
  onReorderSets: (oldIndex: number, newIndex: number) => void;
}

export function WorkoutExerciseComponent({
  id,
  exercisesList,
  exercise,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onDeleteExercise,
  onSelectExercise,
  onReorderSets,
}: WorkoutExerciseProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [query, setQuery] = useState("");

  const selectedExercise = exercisesList.find(
    (item) => item.id === exercise.exerciseId,
  );

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return exercisesList;
    }

    return exercisesList.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.muscleGroup.toLowerCase().includes(normalizedQuery),
    );
  }, [exercisesList, query]);

  function closeExercisePicker() {
    setShowExercisePicker(false);
    setQuery("");
  }

  function handleSetDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = exercise.exerciseSets.findIndex(
      (set) => set.clientId === active.id,
    );
    const newIndex = exercise.exerciseSets.findIndex(
      (set) => set.clientId === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onReorderSets(oldIndex, newIndex);
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-60" : undefined}
    >
      <CardHeader>
        <div>
          <CardTitle>
            {selectedExercise?.name ?? "No exercise selected"}
          </CardTitle>
          <CardDescription>
            {selectedExercise
              ? `${selectedExercise.category} - ${selectedExercise.muscleGroup}`
              : "Pick an exercise to start adding sets."}
          </CardDescription>
        </div>

        <CardAction className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowExercisePicker(true)}
          >
            Pick exercise
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onDeleteExercise}
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleSetDragEnd}
        >
          <SortableContext
            items={exercise.exerciseSets.map((set) => set.clientId)}
            strategy={verticalListSortingStrategy}
          >
            {exercise.exerciseSets.map((set, setIndex) => (
              <WorkoutExerciseSetComponent
                key={set.clientId}
                id={set.clientId}
                set={set}
                onChange={(field, value) => onUpdateSet(setIndex, field, value)}
                onDelete={() => onDeleteSet(setIndex)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <Button type="button" variant="outline" onClick={onAddSet}>
          Add set
        </Button>
      </CardContent>
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
            {filteredExercises.map((item) => (
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
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
