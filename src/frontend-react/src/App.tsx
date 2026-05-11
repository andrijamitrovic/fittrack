import { Route, Routes } from "react-router";
import "./App.css";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { PublicRoute } from "./components/PublicRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { WorkoutHistory } from "./pages/WorkoutHistory";
import { WorkoutLog } from "./pages/WorkoutLog";
import { Templates } from "./pages/Templates";
import { AdminRoute } from "./components/AdminRoute";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminExercises } from "./pages/AdminExercises";
import { Statistics } from "./pages/Statistics";
import { Landing } from "./pages/Landing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            {" "}
            <Login />{" "}
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            {" "}
            <Register />{" "}
          </PublicRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="templates/edit/:workoutId"
          element={<WorkoutLog mode="edit-template" />}
        />

        <Route path="workouts" element={<WorkoutHistory />} />
        <Route path="workouts/new" element={<WorkoutLog mode="create" />} />
        <Route
          path="workouts/new/:workoutId"
          element={<WorkoutLog mode="copy" />}
        />
        <Route
          path="workouts/edit/:workoutId"
          element={<WorkoutLog mode="edit" />}
        />
        <Route path="templates" element={<Templates />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
      <Route
        path="/app/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route path="users" element={<AdminUsers />} />
        <Route path="exercises" element={<AdminExercises />} />
      </Route>
    </Routes>
  );
}

export default App;
