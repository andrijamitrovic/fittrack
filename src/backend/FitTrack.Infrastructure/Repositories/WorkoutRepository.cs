using Dapper;
using FitTrack.Application.Common;
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
        public async Task<Workout?> CreateWorkoutAsync(Workout workout, List<WorkoutExercise> workoutExercises, List<ExerciseSet> exerciseSets)
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


            return await connection.QuerySingleOrDefaultAsync<Workout>(getWorkout, new { workout.Id });
        }

        public async Task<List<WorkoutDetailRow>> GetWorkoutsAsync(Guid userId, bool isTemplate)
        {
            var sql = @"SELECT w.id as workout_id, w.title, w.date, w.notes as workout_notes, w.duration_min,
                                we.id as workout_exercise_id, we.order_index, we.notes as exercise_notes, we.exercise_id,
                                e.name as exercise_name, e.category, e.muscle_group,
                                es.set_number, es.reps, es.weight, es.rpe, es.is_warmup
                        FROM workouts w
                        JOIN workout_exercises we ON w.id = we.workout_id
                        JOIN exercises e ON we.exercise_id = e.id
                        JOIN exercise_sets es ON es.workout_exercise_id = we.id
                        WHERE w.user_id = @UserId
                        AND w.is_template = @IsTemplate
                        ORDER BY w.date DESC, we.order_index, es.set_number";
            using var connection = new NpgsqlConnection(_connectionString);
            return [.. await connection.QueryAsync<WorkoutDetailRow>(sql, new { UserId = userId, IsTemplate = isTemplate })];


        }

        public async Task<List<WorkoutDetailRow>> GetWorkoutAsync(Guid userId, Guid workoutId, bool isTemplate)
        {
            var sql = @"SELECT w.id as workout_id, w.title, w.date, w.notes as workout_notes, w.duration_min,
                                we.id as workout_exercise_id, we.order_index, we.notes as exercise_notes, we.exercise_id,
                                e.name as exercise_name, e.category, e.muscle_group,
                                es.set_number, es.reps, es.weight, es.rpe, es.is_warmup
                        FROM workouts w
                        JOIN workout_exercises we ON w.id = we.workout_id
                        JOIN exercises e ON we.exercise_id = e.id
                        JOIN exercise_sets es ON es.workout_exercise_id = we.id
                        WHERE w.user_id = @UserId
                        AND w.id = @WorkoutId
                        AND is_template = @IsTemplate
                        ORDER BY w.date DESC, we.order_index, es.set_number";

            using var connection = new NpgsqlConnection(_connectionString);
            return [.. await connection.QueryAsync<WorkoutDetailRow>(sql, new { UserId = userId, WorkoutId = workoutId, IsTemplate = isTemplate })];

        }

        public async Task<ResultType> DeleteWorkoutAsync(Guid userId, Guid workoutId, bool isTemplate)
        {
            try
            {
                var sql = @"DELETE 
                        FROM workouts
                        WHERE id = @Id 
                        AND user_id = @UserId
                        AND is_template = @IsTemplate";

                using var connection = new NpgsqlConnection(_connectionString);

                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = workoutId, UserId = userId, IsTemplate = isTemplate });

                return rowsAffected == 0
                        ? ResultType.NotFound
                        : ResultType.Success;
            }
            catch
            {
                return ResultType.Failure;
            }
        }

        public async Task<(ResultType Code, Workout? Data)> UpdateWorkoutAsync(Guid userId, Workout workout, List<WorkoutExercise> workoutExercises, List<ExerciseSet> exerciseSets)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var updateWorkoutSql = @"
                    UPDATE workouts
                    SET title = @Title,
                        notes = @Notes,
                        duration_min = @DurationMin,
                        is_template = @IsTemplate
                    WHERE id = @Id 
                    AND user_id = @UserId
                    AND is_template = @IsTemplate";

                var updated = await connection.ExecuteAsync(
                    updateWorkoutSql,
                    workout,
                    transaction: transaction
                );

                if (updated == 0)
                {
                    await transaction.RollbackAsync();
                    return (ResultType.NotFound, null);
                }

                var deleteChildrenSql = @"
                    DELETE FROM workout_exercises
                    WHERE workout_id = @WorkoutId";

                await connection.ExecuteAsync(
                    deleteChildrenSql,
                    new { WorkoutId = workout.Id },
                    transaction: transaction
                );

                var createWorkoutExercise = "INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, notes)" +
                            "VALUES (@Id, @WorkoutId, @ExerciseId, @OrderIndex, @Notes) RETURNING id";
                var createExerciseSet = "INSERT INTO exercise_sets (id, workout_exercise_id, set_number, reps, weight, rpe, is_warmup)" +
                                        "VALUES (@Id, @WorkoutExerciseId, @SetNumber, @Reps, @Weight, @Rpe, @IsWarmup)";


                foreach (var workoutExercise in workoutExercises)
                {
                    await connection.ExecuteAsync(createWorkoutExercise, workoutExercise, transaction: transaction);
                }

                foreach (var exerciseSet in exerciseSets)
                {
                    await connection.ExecuteAsync(createExerciseSet, exerciseSet, transaction: transaction);
                }

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                return (ResultType.Failure, null);
            }

            try
            {
                var getWorkoutSql = "SELECT * FROM workouts WHERE id = @Id";
                var savedWorkout = await connection.QuerySingleOrDefaultAsync<Workout>(
                    getWorkoutSql,
                    new { workout.Id }
                );
                return (ResultType.Success, savedWorkout);
            }
            catch
            {
                return (ResultType.Failure, null);
            }

        }
    }
}
