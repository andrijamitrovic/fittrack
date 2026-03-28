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
            var createWorkout = "INSERT INTO workouts (id, user_id, title, date, notes, duration_min, is_template)" +
                                "VALUES (@Id, @UserId, @Title, @Date, @Notes, @DurationMin, @IsTemplate) RETURNING id";
            var createWorkoutExercise = "INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, notes)" +
                                        "VALUES (@Id, @WorkoutId, @ExerciseId, @OrderIndex, @Notes) RETURNING id";
            var createExerciseSet = "INSERT INTO exercise_sets (id, workout_exercise_id, set_number, reps, weight, rpe, is_warmup)" +
                                    "VALUES (@Id, @WorkoutExerciseId, @SetNumber, @Reps, @Weight, @Rpe, @IsWarmup)";
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();
            await connection.ExecuteAsync(createWorkout, workout, transaction: transaction);

            foreach (var workoutExercise in workoutExercises)
            {
                await connection.ExecuteAsync(createWorkoutExercise, workoutExercise, transaction: transaction);
            }

            foreach (var exerciseSet in exerciseSets)
            {
                await connection.ExecuteAsync(createExerciseSet, exerciseSet, transaction: transaction);
            }

            await transaction.CommitAsync();

            var getWorkout = "SELECT * FROM workouts WHERE id = @Id";


            return await connection.QuerySingleAsync<Workout>(getWorkout, new { workout.Id });
        }

        public async Task<List<WorkoutDetailRow>> GetWorkoutsAsync(Guid userId, bool isTemplate)
        {
            var sql = @"SELECT w.id as workout_id, w.title, w.date, w.notes as workout_notes, w.duration_min,
                                we.id as workout_exercise_id, we.order_index, we.notes as exercise_notes,
                                e.name as exercise_name, e.category, e.muscle_group,
                                es.set_number, es.reps, es.weight, es.rpe, es.is_warmup
                        FROM workouts w
                        JOIN workout_exercises we ON w.id = we.workout_id
                        JOIN exercises e ON we.exercise_id = e.id
                        JOIN exercise_sets es ON es.workout_exercise_id = we.id
                        WHERE w.user_id = @UserId AND w.is_template = false
                        ORDER BY w.date DESC, we.order_index, es.set_number";
            using var connection = new NpgsqlConnection(_connectionString);
            return [.. await connection.QueryAsync<WorkoutDetailRow>(sql, new { UserId = userId })];
        }

        public async Task<List<WorkoutTemplateDetailRow>> GetWorkoutTemplatesAsync(Guid userId)
        {
            var sql = @"SELECT w.id as workout_id, w.title,
                                we.id as workout_exercise_id, we.order_index,
                                e.name as exercise_name, e.category, e.muscle_group,
                                es.set_number, es.reps, es.weight
                        FROM workouts w
                        JOIN workout_exercises we ON w.id = we.workout_id
                        JOIN exercises e ON we.exercise_id = e.id
                        JOIN exercise_sets es ON es.workout_exercise_id = we.id
                        WHERE w.user_id = @UserId AND w.is_template = true
                        ORDER BY w.date DESC, we.order_index, es.set_number";
            using var connection = new NpgsqlConnection(_connectionString);
            return [.. await connection.QueryAsync<WorkoutTemplateDetailRow>(sql, new { UserId = userId })];
        }
    }
}
