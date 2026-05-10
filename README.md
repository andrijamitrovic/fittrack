# FitTrack

FitTrack is a simple workout tracking app for logging gym sessions, managing exercises, and reusing workout templates.

The project uses a .NET backend, a React frontend, PostgreSQL, and Docker for easier local running and deployment.

## Tech Stack

- .NET / ASP.NET Core Web API
- Dapper
- PostgreSQL
- JWT authentication
- React
- TypeScript
- Vite
- Docker
- Docker Compose
- xUnit
- Playwright

## Features

- Register and log in with JWT-based authentication
- Store users, exercises, workouts, workout exercises, and exercise sets
- Browse a seeded exercise library
- Log workouts with exercises, sets, reps, weight, RPE, warmups, and notes
- Save workouts as templates
- Start a workout from an existing workout or template
- View previous workouts
- Manage users and exercises from admin routes
- Run unit and end-to-end tests

## Project Structure

The project is split into a backend, frontend, database migrations, and Docker configuration.

- `src/backend/` contains the .NET solution.
- `FitTrack.Api/` exposes the HTTP API used by the frontend.
- `FitTrack.Application/` contains services, DTOs, interfaces, and shared application logic.
- `FitTrack.Domain/` contains the domain entities.
- `FitTrack.Infrastructure/` contains Dapper repositories and database access code.
- `FitTrack.Tests/` contains unit tests.
- `FitTrack.E2ETests/` contains Playwright end-to-end tests.
- `src/frontend-react/` contains the Vite React app.
- `database/migrations/` contains PostgreSQL schema and seed SQL scripts.
- `docker-compose.yml` runs the production-style backend, frontend, and database containers.
- `docker-compose.dev.yml` runs the local development PostgreSQL container.

```txt
fittrack/
|-- README.md
|-- docker-compose.yml
|-- docker-compose.dev.yml
|-- nginx.conf
|-- database/
|   `-- migrations/
|-- docs/
`-- src/
    |-- backend/
    |   |-- Dockerfile
    |   |-- FitTrack.slnx
    |   |-- FitTrack.Api/
    |   |   |-- Controllers/
    |   |   |-- Program.cs
    |   |   |-- appsettings.json
    |   |   `-- appsettings.Development.json
    |   |-- FitTrack.Application/
    |   |-- FitTrack.Domain/
    |   |-- FitTrack.Infrastructure/
    |   |-- FitTrack.Tests/
    |   `-- FitTrack.E2ETests/
    `-- frontend-react/
        |-- Dockerfile
        |-- package.json
        |-- vite.config.ts
        |-- index.html
        `-- src/
            |-- App.tsx
            |-- components/
            |-- pages/
            |-- services/
            |-- types/
            `-- utils/
```

## Running With Docker

Create an environment file from the example:

```bash
cp .env.example .env
```

Update the values in `.env`, then run:

```bash
docker compose up --build -d
```

The frontend is served through nginx on:

```txt
http://localhost
https://localhost
```

The backend API runs inside Docker on port `8080` and is proxied by nginx under:

```txt
/api
```

The production compose file mounts certificates from `/etc/letsencrypt`, as configured in `nginx.conf`.

## Running Locally

Before starting the app, update your local environment files.

Create or update `.env` in the project root:

```bash
cp .env.example .env
```

Set your local database and JWT values:

```env
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=fittrack
JWT_KEY=your-secret-key-at-least-32-characters
JWT_ISSUER=fittrack.com
JWT_AUDIENCE=fittrack.com
JWT_EXPIRY=1440
```

Create `src/backend/FitTrack.Api/appsettings.Development.json`.

This file is ignored by git and should contain your local backend settings:

```json
{
  "ConnectionStrings": {
    "PGConnectionString": "Host=localhost;Port=5432;Database=fittrack;Username=your_db_user;Password=your_db_password"
  },
  "JwtSettings": {
    "Key": "your-secret-key-at-least-32-characters",
    "Issuer": "fittrack.com",
    "Audience": "fittrack.com",
    "ExpiryMinutes": "1440"
  }
}
```

Make sure the database name, username, password, and JWT values match your `.env`.

Start PostgreSQL with Docker:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Start the backend:

```bash
cd src/backend
ASPNETCORE_ENVIRONMENT=Development dotnet run --project FitTrack.Api
```

The backend API will be available at:

```txt
http://localhost:5212
```

Start the frontend:

```bash
cd src/frontend-react
npm install
npm run dev
```

The Vite frontend usually runs at:

```txt
http://localhost:5173
```

The frontend proxies `/api` requests to the backend during local development.
## Usage

Open the frontend in your browser, register a user, and log in.

After logging in, you can browse the dashboard, create a workout, add exercises and sets, save workouts as templates, repeat previous workouts, and review workout history.

Admin users can also manage exercises and users from the admin pages.

## API Endpoints

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token/refresh
GET    /api/auth
DELETE /api/auth/{id}

GET    /api/exercises
POST   /api/exercises
GET    /api/exercises/{id}
PUT    /api/exercises/{id}
DELETE /api/exercises/{id}

GET    /api/workouts
POST   /api/workouts
GET    /api/workouts/{id}
GET    /api/workouts/workout-templates
POST   /api/workouts/workout-templates
POST   /api/workouts/from-workout/{workoutId}/as-template
POST   /api/workouts/from-workout/{workoutId}/as-workout
```

Some endpoints require a valid JWT access token. Admin endpoints require an admin role.

## Testing

Run the backend tests from the backend folder:

```bash
cd src/backend
dotnet test .\FitTrack.slnx
```

Run frontend checks from the frontend folder:

```bash
cd src/frontend-react
npm run lint
npm run build
```

## Notes

The PostgreSQL schema and seed data are stored in `database/migrations`.

When running with Docker, PostgreSQL data is stored in a Docker volume so application data can persist between container restarts.

Local authentication tokens are stored by the frontend and refreshed through the refresh-token endpoint.
