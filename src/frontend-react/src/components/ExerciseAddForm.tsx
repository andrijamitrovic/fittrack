import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { Exercise } from "../types";

type ExerciseFormProps = {
  onAdd: (exercise: Exercise) => void | Promise<void>;
  formExercise: Exercise | null;
};

export function ExerciseForm({ onAdd, formExercise }: ExerciseFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");

  useEffect(() => {
    if (formExercise) {
      setName(formExercise.name);
      setCategory(formExercise.category);
      setMuscleGroup(formExercise.muscleGroup);
    } else {
      setName("");
      setCategory("");
      setMuscleGroup("");
    }
  }, [formExercise]);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    onAdd({
      id: formExercise?.id ?? "",
      name,
      category,
      muscleGroup,
    });

    if (!formExercise) {
      setName("");
      setCategory("");
      setMuscleGroup("");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="exercise-name">Name</Label>
        <Input
          id="exercise-name"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exercise-category">Category</Label>
        <Input
          id="exercise-category"
          value={category}
          required
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exercise-muscle">Muscle group</Label>
        <Input
          id="exercise-muscle"
          value={muscleGroup}
          required
          onChange={(e) => setMuscleGroup(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        {formExercise ? "Save changes" : "Add exercise"}
      </Button>
    </form>
  );
}
