import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { Exercise } from "../types";

type ExerciseFormProps = {
  onAdd: (exercise: Exercise) => void | Promise<void>;
  formExercise: Exercise | null;
};

export function ExerciseForm({ onAdd, formExercise }: ExerciseFormProps) {
  const [form, setForm] = useState({
    name: formExercise?.name ?? "",
    category: formExercise?.category ?? "",
    muscleGroup: formExercise?.muscleGroup ?? "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await onAdd({
      id: formExercise?.id ?? "",
      name: form.name,
      category: form.category,
      muscleGroup: form.muscleGroup,
    });

    if (!formExercise) {
      setForm({
        name: "",
        category: "",
        muscleGroup: "",
      });
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="exercise-name">Name</Label>
        <Input
          id="exercise-name"
          value={form.name}
          required
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exercise-category">Category</Label>
        <Input
          id="exercise-category"
          value={form.category}
          required
          onChange={(e) => updateField("category", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exercise-muscle">Muscle group</Label>
        <Input
          id="exercise-muscle"
          value={form.muscleGroup}
          required
          onChange={(e) => updateField("muscleGroup", e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        {formExercise ? "Save changes" : "Add exercise"}
      </Button>
    </form>
  );
}
