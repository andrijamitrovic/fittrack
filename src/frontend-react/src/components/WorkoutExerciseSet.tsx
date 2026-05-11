import type { ExerciseSet } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WorkoutExerciseSetProps {
  id: string;
  set: ExerciseSet;
  onChange: (field: string, value: number | undefined) => void;
  onDelete: () => void;
}

export function WorkoutExerciseSetComponent({
  id,
  set,
  onChange,
  onDelete,
}: WorkoutExerciseSetProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid gap-3 rounded-lg border bg-background p-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:items-end ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="self-end"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </Button>
      <div className="space-y-2">
        <Label>Reps</Label>
        <Input
          required
          type="number"
          min={1}
          max={100}
          value={set.reps ?? ""}
          onChange={(e) => {
            const val =
              e.target.value === "" ? undefined : Number(e.target.value);
            onChange("reps", val);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Weight</Label>
        <Input
          required
          type="number"
          min={1}
          max={1000}
          step="0.5"
          value={set.weight ?? ""}
          onChange={(e) => {
            const val =
              e.target.value === "" ? undefined : Number(e.target.value);
            onChange("weight", val);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>RPE</Label>
        <Input
          required
          type="number"
          min={1}
          max={10}
          value={set.rpe ?? ""}
          onChange={(e) => {
            const val =
              e.target.value === "" ? undefined : Number(e.target.value);
            onChange("rpe", val);
          }}
        />
      </div>

      <Button type="button" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
