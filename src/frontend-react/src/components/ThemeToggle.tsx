import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { Button } from "./ui/button";

type ThemeToggleProps = {
  showLabel?: boolean;
  className?: string;
};

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      className={className}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {showLabel && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </Button>
  );
}
