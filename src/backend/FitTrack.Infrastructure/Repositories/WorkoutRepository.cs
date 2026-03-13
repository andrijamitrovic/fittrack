using Dapper;
using FitTrack.Application.DTOs;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;
using Npgsql;

namespace FitTrack.Infrastructure.Repositories
{
    public class WorkoutRepository : IWorkoutRepository
    {
        private readonly string _connectionString;

        public WorkoutRepository(string connectionString)
        {
            _connectionString = connectionString;
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        }
        public async Task<Workout> CreateWorkoutAsync(Workout workout, List<WorkoutExercise> workoutExercises, List<ExerciseSet> exerciseSets)
        {
            var createWorkout = "INSERT INTO workouts (id, user_id, title, date, notes, duration_min)" +
                                "VALUES (@Id, @UserId, @Title, @Date, @Notes, @DurationMin) RETURNING id";
            var createWorkoutExercise = "INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, notes)" +
                                        "VALUES (@Id, @WorkoutId, @ExerciseId, @OrderIndex, @Notes) RETURNING id";
            var createExerciseSet = "INSERT INTO exercise_sets (id, workout_exercise_id, set_number, reps, weight, rpe, is_warmup)" +
                                    "VALUES (@Id, @WorkoutExerciseId, @SetNumber, @Reps, @Weight, @Rpe, @IsWarmup)";
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();
            await connection.ExecuteAsync(createWorkout, workout, transaction : transaction);

            foreach (var workoutExercise in workoutExercises)
            {
                await connection.ExecuteAsync(createWorkoutExercise, workoutExercise, transaction : transaction);
            }

            foreach (var exerciseSet in exerciseSets)
            {
                await connection.ExecuteAsync(createExerciseSet, exerciseSet, transaction: transaction);
            }

            await transaction.CommitAsync();

            var getWorkout = "SELECT * FROM workouts WHERE id = @Id";


            return await connection.QuerySingleAsync<Workout>(getWorkout, new { workout.Id });
        }

    }
}
