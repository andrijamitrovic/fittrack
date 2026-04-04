using Dapper;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;
using Npgsql;

namespace FitTrack.Infrastructure.Repositories
{
    public class AuthRepository : IAuthRepository
    {

        private readonly string _connectionString;

        public AuthRepository(string connectionString)
        {
            _connectionString = connectionString;
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        public async Task<RefreshToken?> CreateRefreshTokenAsync(Guid userId, string token)
        {
            var sql = "INSERT INTO refresh_tokens (user_id, token)" +
                      "VALUES (@UserId, @Token) RETURNING *";
            using var connection = new NpgsqlConnection(_connectionString);

            return await connection.QuerySingleOrDefaultAsync<RefreshToken>(sql, new
            {
                UserId = userId,
                Token = token
            });
        }

        public async Task DeleteRefreshTokenAsync(RefreshToken refreshToken)
        {
            var sql = "DELETE FROM refresh_tokens WHERE id = @Id";

            using var connection = new NpgsqlConnection(_connectionString);

            await connection.ExecuteAsync(sql, new
            {
                id = refreshToken.Id
            });

            return;
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            var sql = "SELECT * FROM refresh_tokens WHERE token = @Token AND expires_at > NOW()";

            using var connection = new NpgsqlConnection(_connectionString);

            return await connection.QuerySingleOrDefaultAsync<RefreshToken>(sql, new
            {
                Token = token
            });
        }
    }
}