using Dapper;
using FitTrack.Application.Common;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;
using Npgsql;

namespace FitTrack.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(string connectionString)
        {
            _connectionString = connectionString;
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        public async Task<(ResultType Code, User? Data)> CreateUserAsync(User user)
        {
            try
            {
                var sql = @"INSERT INTO users (email, password_hash, display_name)
                            VALUES (@Email, @PasswordHash, @DisplayName)
                            RETURNING *";

                using var connection = new NpgsqlConnection(_connectionString);

                var created = await connection.QuerySingleAsync<User>(sql, new
                {
                    user.Email,
                    user.PasswordHash,
                    user.DisplayName
                });

                return (ResultType.Success, created);
            }
            catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                return (ResultType.Conflict, null);
            }
            catch
            {
                return (ResultType.Failure, null);
            }
        }

        public async Task<User?> GetUserAsync(string email)
        {
            var sql = "SELECT * FROM users WHERE email = @Email";

            using var connection = new NpgsqlConnection(_connectionString);

            return await connection.QuerySingleOrDefaultAsync<User>(sql, new
            {
                Email = email
            });
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            var sql = "SELECT * FROM users WHERE id = @Id";

            using var connection = new NpgsqlConnection(_connectionString);

            return await connection.QuerySingleOrDefaultAsync<User>(sql, new
            {
                Id = userId
            });
        }

        public async Task<IEnumerable<User>> GetUsersAsync()
        {
            var sql = "SELECT id, email, display_name, role, created_at, updated_at FROM users";

            using var connection = new NpgsqlConnection(_connectionString);

            return await connection.QueryAsync<User>(sql);
        }

        public async Task<ResultType> DeleteUser(Guid userId)
        {
            try
            {
                var sql = "DELETE FROM users WHERE id = @Id";

                using var connection = new NpgsqlConnection(_connectionString);

                var rowsAffected = await connection.ExecuteAsync(sql, new
                {
                    Id = userId
                });

                return rowsAffected == 0
                    ? ResultType.NotFound
                    : ResultType.Success;
            }
            catch
            {
                return ResultType.Failure;
            }
        }
    }
}
