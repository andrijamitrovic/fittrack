import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Dumbbell,
  Layers3,
  Repeat2,
} from "lucide-react";
import { Link, Navigate } from "react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const featureCards = [
  {
    icon: ClipboardList,
    title: "Log the work",
    description:
      "Build sessions with exercises, sets, reps, weight, RPE, and notes without slowing down your training.",
  },
  {
    icon: Repeat2,
    title: "Repeat what works",
    description:
      "Copy recent sessions, reuse templates, and keep your best training structure close at hand.",
  },
  {
    icon: BarChart3,
    title: "Read the trend",
    description:
      "Track volume, best sets, working sets, and estimated one-rep maxes by exercise.",
  },
];

const workflowSteps = [
  "Pick a workout or start fresh",
  "Add exercises and reorder sets",
  "Save the session",
  "Review progress over time",
];

export function Landing() {
  const token = localStorage.getItem("accessToken");

  if (token) {
    return <Navigate to="/app" replace />;
  }
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="relative min-h-screen overflow-hidden border-b">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:56px_56px] opacity-45" />
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.16)_0%,transparent_42%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="size-6" />
            <span className="text-lg font-semibold">Cadence</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-zinc-50"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="transition-colors hover:text-zinc-50"
            >
              Workflow
            </a>
            <a
              href="#progress"
              className="transition-colors hover:text-zinc-50"
            >
              Progress
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="text-zinc-50 hover:bg-white/10 hover:text-zinc-50"
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
            >
              <Link to="/register">Start</Link>
            </Button>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-zinc-300 shadow-sm backdrop-blur">
              <Layers3 className="size-4" />
              Training logs, templates, and progress in one place
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Train with memory.
                <br />
                Progress with proof.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                Cadence helps lifters log clean workouts, copy what worked, and
                spot strength trends before they get buried in old notes.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
              >
                <Link to="/register">
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-zinc-50 hover:bg-white/10 hover:text-zinc-50"
              >
                <Link to="/login">Open your log</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-900/85 p-4 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm text-zinc-400">Today</p>
                <h2 className="text-xl font-semibold">Push Strength</h2>
              </div>
              <span className="rounded-full border border-white/15 px-3 py-1 text-sm text-zinc-400">
                64 min
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-zinc-950/50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">Barbell Bench Press</p>
                  <span className="text-sm text-zinc-400">4 sets</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm text-zinc-400">
                  <span>Set</span>
                  <span>Reps</span>
                  <span>Weight</span>
                  <span>RPE</span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 rounded-md bg-white/10 p-2 text-sm">
                  <span>3</span>
                  <span>5</span>
                  <span>82.5 kg</span>
                  <span>8</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="block text-2xl font-semibold">Copy</span>
                  <span className="text-sm text-zinc-400">recent sessions</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="block text-2xl font-semibold">Track</span>
                  <span className="text-sm text-zinc-400">sets and volume</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="block text-2xl font-semibold">Reuse</span>
                  <span className="text-sm text-zinc-400">templates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-8 max-w-2xl space-y-2">
          <p className="text-sm font-medium text-zinc-400">Features</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Less friction between the set you did and the data you need.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="border-white/10 bg-zinc-900 text-zinc-50"
              >
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-white/10 text-zinc-50">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="workflow"
        className="border-y border-white/10 bg-zinc-900/60"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-400">Workflow</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Start fast, adjust freely, save clean.
            </h2>
            <p className="text-zinc-400">
              Cadence is built around the way training actually happens: repeat
              the plan, change what you need, and keep the history accurate.
            </p>
          </div>

          <div className="grid gap-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-zinc-950 p-4"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-zinc-50 text-sm font-medium text-zinc-950">
                  {index + 1}
                </span>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="progress"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <Card className="overflow-hidden border-white/10 bg-zinc-900 text-zinc-50">
          <CardHeader>
            <CardTitle className="text-2xl">
              Progress that is easy to read
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Pick an exercise and see the story across sessions: strength,
              volume, working sets, and set history.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">Best estimated 1RM</p>
              <p className="mt-2 text-3xl font-semibold">101.8 kg</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">Total volume</p>
              <p className="mt-2 text-3xl font-semibold">4,622 kg</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">Sessions tracked</p>
              <p className="mt-2 text-3xl font-semibold">18</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
