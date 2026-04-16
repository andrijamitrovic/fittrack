using Dapper;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;
using Npgsql;

namespace FitTrack.Infrastructure.Repositories
{
    public class ExerciseRepository : IExerciseRepository
    {
        private readonly string _connectionString;

        public ExerciseRepository(string connectionString)
        {
            _connectionString = connectionString;
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        public async Task<IEnumerable<Exercise>> GetAllAsync()
        {
            var sql = "SELECT * FROM exercises";
            using var connection = new NpgsqlConnection(_connectionString);
            return await connection.QueryAsync<Exercise>(sql);
        }

        public async Task<Exercise?> GetExerciseAsync(Guid id)
        {
            var sql = "SELECT * FROM exercises WHERE id=@Id";
            using var connection = new NpgsqlConnection(_connectionString);
            return await connection.QuerySingleOrDefaultAsync<Exercise>(sql, new
            {
                Id = id
            });
        }

        public async Task<Exercise?> AddExercise(Exercise exercise)
        {
            try
            {
                var sql = "INSERT INTO exercises (name, category, muscle_group, description, is_custom, created_by) " +
                          "VALUES (@Name, @Category, @MuscleGroup, @Description, @IsCustom, @CreatedBy) RETURNING *";
                using var connection = new NpgsqlConnection(_connectionString);

                return await connection.QuerySingleOrDefaultAsync<Exercise>(sql, new
                {
                    exercise.Name,
                    exercise.Category,
                    exercise.MuscleGroup,
                    exercise.Description,
                    exercise.IsCustom,
                    exercise.CreatedBy,
                    exercise.CreatedAt
                });
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                return null;
            }
        }

        public async Task<Exercise?> UpdateExerciseAsync(Exercise exercise)
        {
            try
            {
                var sql = "UPDATE exercises SET name=@Name, category=@Category, muscle_group=@MuscleGroup, description=@Description WHERE id=@Id RETURNING *";

                using var connection = new NpgsqlConnection(_connectionString);

                return await connection.QueryFirstOrDefaultAsync<Exercise>(sql, new
                {
                    exercise.Id,
                    exercise.Name,
                    exercise.Category,
                    exercise.MuscleGroup,
                    exercise.Description,
                    exercise.IsCustom,
                    exercise.CreatedBy,
                    exercise.CreatedAt
                });
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                return null;
            }
        }


        public async Task<bool> DeleteExerciseAsync(Guid id)
        {
            try
            {
                var sql = "DELETE FROM exercises WHERE id = @Id";


                using var connection = new NpgsqlConnection(_connectionString);

                var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
                return rowsAffected > 0;
            } 
            catch
            {
                return false;    
            }
        }
    }
}
