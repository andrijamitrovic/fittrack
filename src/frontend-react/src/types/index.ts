export interface User { 
    id?: string;
    email: string;
    password: string;
    displayName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    displayName: string;
}

export interface Exercise {
    id: string;
    name: string;
    category: string;
    muscleGroup: string;
}

export interface Workout {
    id?: string;
    title: string; 
    notes?: string;
    durationMin: number;
    workoutExercises: WorkoutExercise[];
}

export interface WorkoutExercise {
    id?: string;
    exerciseId: string;
    orderIndex: number;
    notes?: string;
    exerciseSets: ExerciseSet[];
}

export interface ExerciseSet {
    id?: string;
    setNumber: number;
    reps?: number;
    weight?: number;
    rpe?: number;
    isWarmup?: boolean;
}

export interface WorkoutViewer {
    workoutId: string;
    title?: string;
    date: string;
    notes?: string;
    durationMin?: number;
    exercises: WorkoutExerciseViewer[];
}
export interface WorkoutExerciseViewer {
    workoutExerciseId: string;
    exerciseId: string;
    orderIndex: number;
    exerciseNotes?: string;
    exerciseName: string;
    category: string;
    muscleGroup: string;
    sets: ExerciseSetViewer[];
}

export interface ExerciseSetViewer {
    setNumber: number; 
    reps?: number;
    weight?: number;
    rpe?: number;
    isWarmup: boolean;
}