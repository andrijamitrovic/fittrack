import { BarChart3, ClipboardList, Dumbbell, Repeat2 } from "lucide-react";
import { Link } from "react-router";
import heroImage from "../assets/hero.png";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const features = [
  {
    icon: ClipboardList,
    title: "Log every session",
    description: "Track exercises, sets, reps, weight, RPE, notes, and workout history in one place.",
  },
  {
    icon: Repeat2,
    title: "Reuse what works",
    description: "Copy past workouts or build templates so your next session starts faster.",
  },
  {
    icon: BarChart3,
    title: "See progress",
    description: "Follow strength trends, volume, working sets, and estimated one-rep maxes over time.",
  },
];

export function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
              <Dumbbell className="size-4" />
              Workout tracking for consistent training
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Cadence helps you train with a plan, not a guess.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Log workouts, reuse templates, copy past sessions, and understand your strength progress with simple charts.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/register">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Cadence workout tracking preview"
              className="aspect-[4/3] w-full rounded-xl border object-cover shadow-sm"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Workout builder</CardTitle>
              <CardDescription>Add exercises, sets, weights, and notes without fighting the interface.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="rounded-lg border bg-muted/30 px-3 py-2">Bench Press · 4 sets</div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">Squat · 3 sets</div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">Deadlift · 3 sets</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Save repeatable training days and start from them whenever you need.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="rounded-lg border bg-muted/30 px-3 py-2">Upper Strength</div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">Lower Volume</div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">Pull Session</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Review your best sets, volume, and progress by exercise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-2 w-4/5 rounded-full bg-primary" />
              <div className="h-2 w-3/5 rounded-full bg-muted-foreground/40" />
              <div className="h-2 w-11/12 rounded-full bg-primary/70" />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
