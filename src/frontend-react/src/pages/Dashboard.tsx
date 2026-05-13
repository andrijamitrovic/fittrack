import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { loadExercises } from "../services/exerciseService";
import { loadTemplates, loadWorkouts } from "../services/workoutService";
import type { Exercise, WorkoutViewer } from "../types";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CalendarDays, Clock, Dumbbell, History, LayoutTemplate, Plus } from "lucide-react";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
  const [templates, setTemplates] = useState<WorkoutViewer[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([loadWorkouts(), loadTemplates(), loadExercises()])
      .then(([loadedWorkouts, loadedTemplates, loadedExercises]) => {
        setWorkouts(loadedWorkouts);
        setTemplates(loadedTemplates);
        setExercises(loadedExercises);
      })
      .catch((err) => setError(err.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const recentWorkouts = useMemo(() => {
    return [...workouts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [workouts]);

  const featuredTemplates = useMemo(() => templates.slice(0, 4), [templates]);

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.split("T")[0];
    }
    return date.toLocaleDateString();
  }

  function formatExerciseCount(count: number) {
    return `${count} ${count === 1 ? "exercise" : "exercises"}`;
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
          </div>
          <div className="hidden h-9 w-32 animate-pulse rounded-md bg-muted sm:block" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardHeader>
                <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-44 animate-pulse rounded-md bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          {[1, 2].map((item) => (
            <Card key={item}>
              <CardHeader>
                <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 animate-pulse rounded-md bg-muted" />
                <div className="h-20 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Dashboard unavailable</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Recent activity, templates, and quick actions.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickActionCard
          to="/app/workouts/new"
          icon={<Plus className="size-5" />}
          title="Add Workout"
          description="Start a new session."
        />
        <QuickActionCard
          to="/app/workouts"
          icon={<History className="size-5" />}
          title="Workout History"
          description="Review and reuse past workouts."
        />
        <QuickActionCard
          to="/app/templates"
          icon={<LayoutTemplate className="size-5" />}
          title="Templates"
          description="Jump into saved plans."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Workouts" value={workouts.length} />
        <MetricCard label="Templates" value={templates.length} />
        <MetricCard label="Exercises" value={exercises.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Workouts</CardTitle>
              <CardDescription>Your latest logged sessions.</CardDescription>
            </div>

            <CardAction>
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/workouts">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            {recentWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workouts yet.</p>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <Card
                    key={workout.workoutId}
                    size="sm"
                    className="bg-background"
                  >
                    <CardHeader>
                      <div className="min-w-0 space-y-1">
                        <CardTitle>
                          {workout.title || "Untitled workout"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" />
                          {formatDate(workout.date)}
                        </CardDescription>
                      </div>

                      <CardAction>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/app/workouts/new/${workout.workoutId}`)
                          }
                        >
                          Copy
                        </Button>
                      </CardAction>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                        <MetaPill>
                          <Dumbbell className="size-3" />
                          {formatExerciseCount(workout.exercises.length)}
                        </MetaPill>

                        {workout.durationMin && (
                          <MetaPill>
                            <Clock className="size-3" />
                            {workout.durationMin} min
                          </MetaPill>
                        )}
                      </div>

                      {workout.workoutNotes && (
                        <p className="text-sm text-muted-foreground">
                          {workout.workoutNotes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Saved plans ready to reuse.</CardDescription>
            </div>

            <CardAction>
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/templates">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            {featuredTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No templates yet.</p>
            ) : (
              <div className="space-y-3">
                {featuredTemplates.map((template) => (
                  <Card
                    key={template.workoutId}
                    size="sm"
                    className="bg-background"
                  >
                    <CardHeader>
                      <div className="min-w-0 space-y-1">
                        <CardTitle>
                          {template.title || "Untitled template"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5">
                          <Dumbbell className="size-3.5" />
                          {formatExerciseCount(template.exercises.length)}
                        </CardDescription>
                      </div>

                      <CardAction>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/app/workouts/new/${template.workoutId}`)
                          }
                        >
                          Use
                        </Button>
                      </CardAction>
                    </CardHeader>

                    {(template.durationMin || template.workoutNotes) && (
                      <CardContent className="space-y-2">
                        {template.durationMin && (
                          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                            <MetaPill>
                              <Clock className="size-3" />
                              {template.durationMin} min
                            </MetaPill>
                          </div>
                        )}

                        {template.workoutNotes && (
                          <p className="text-sm text-muted-foreground">
                            {template.workoutNotes}
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type QuickActionCardProps = {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

function QuickActionCard({ to, icon, title, description }: QuickActionCardProps) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full border-border/80 transition-colors hover:bg-muted/40">
        <CardHeader className="grid-cols-[auto_1fr] items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

type MetricCardProps = {
  label: string;
  value: number;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card className="bg-muted/20">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-4xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

type MetaPillProps = {
  children: React.ReactNode;
};

function MetaPill({ children }: MetaPillProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-muted/30 px-2 py-1">
      {children}
    </span>
  );
}
