import { startGoogleLogin } from "../services/authService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ThemeToggle";

export function Login() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Log In</CardTitle>
          <CardDescription>Continue with your Google account.</CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            type="button"
            className="w-full"
            onClick={() => startGoogleLogin()}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
