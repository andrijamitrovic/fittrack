using System.ComponentModel.Design;
using Dapper;
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
        public async Task<User?> CreateUserAsync(User user)
        {
            try
            {
                var sql = "INSERT INTO users (email, password_hash, display_name) " +
                          "VALUES (@Email, @PasswordHash, @DisplayName) RETURNING *";
                using var connection = new NpgsqlConnection(_connectionString);

                return await connection.QuerySingleOrDefaultAsync<User>(sql, new
                {
                    user.Email,
                    user.PasswordHash,
                    user.DisplayName,
                });
            }
            catch (PostgresException ex) when (ex.SqlState == "23505")
            {
                return null;
            }
        }

        public async Task<User?> GetUserAsync(string email)
        {
            var sql = "SELECT * FROM users WHERE email = @Email";

            using var connection = new NpgsqlConnection(_connectionString);

            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            var sql = "SELECT * FROM users WHERE id = @Id";

            using var connection = new NpgsqlConnection(_connectionString);

            return await connection.QuerySingleOrDefaultAsync<User>(sql, new {Id = userId});
        }
    }
}