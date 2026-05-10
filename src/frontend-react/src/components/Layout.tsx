import { NavLink, Outlet, useNavigate } from "react-router";
import { isAdmin } from "../utils/auth";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/workouts", label: "Workouts" },
    { to: "/newworkout", label: "Add workout" },
    { to: "/templates", label: "Templates" },
    { to: "/statistics", label: "Statistics" },
  ];

  const adminItems = [
    { to: "/admin/users", label: "Users" },
    { to: "/admin/exercises", label: "Exercises" },
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    closeMenu();
    navigate("/login");
  }

  function navLinkClass(isActive: boolean) {
    return cn(
      "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
      isActive && "text-foreground",
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-6">
            <NavLink
              to="/"
              className="flex items-center gap-2"
              onClick={closeMenu}
            >
              <svg
                className="size-7"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <line x1={10} y1={18} x2={26} y2={18} />
                  <line x1={7} y1={13} x2={7} y2={23} />
                  <line x1={10} y1={11} x2={10} y2={25} />
                  <line x1={26} y1={11} x2={26} y2={25} />
                  <line x1={29} y1={13} x2={29} y2={23} />
                </g>
              </svg>
              <span className="text-lg font-semibold">Cadence</span>
            </NavLink>

            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}

              {isAdmin() &&
                adminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => navLinkClass(isActive)}
                  >
                    {item.label}
                  </NavLink>
                ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <ThemeToggle />

              <Button type="button" variant="outline" onClick={handleLogout}>
                Log out
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </div>

          {menuOpen && (
            <div id="mobile-nav" className="border-t md:hidden">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                        isActive && "bg-muted text-foreground",
                      )
                    }
                    onClick={closeMenu}
                  >
                    {item.label}
                  </NavLink>
                ))}

                {isAdmin() &&
                  adminItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                          isActive && "bg-muted text-foreground",
                        )
                      }
                      onClick={closeMenu}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                <ThemeToggle showLabel className="justify-start" />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
