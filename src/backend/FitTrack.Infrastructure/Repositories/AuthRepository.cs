using Dapper;
using FitTrack.Application.Common;
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

        public async Task<(ResultType Code, RefreshToken? Data)> CreateRefreshTokenAsync(Guid userId, string token)
        {
            try
            {
                var sql = @"INSERT INTO refresh_tokens (user_id, token)
                            VALUES (@UserId, @Token)
                            RETURNING *";

                using var connection = new NpgsqlConnection(_connectionString);

                var created = await connection.QuerySingleAsync<RefreshToken>(sql, new
                {
                    UserId = userId,
                    Token = token
                });

                return (ResultType.Success, created);
            }
            catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.ForeignKeyViolation)
            {
                return (ResultType.NotFound, null);
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

        public async Task<ResultType> DeleteRefreshTokenAsync(RefreshToken refreshToken)
        {
            try
            {
                var sql = "DELETE FROM refresh_tokens WHERE id = @Id";

                using var connection = new NpgsqlConnection(_connectionString);

                var rowsAffected = await connection.ExecuteAsync(sql, new
                {
                    Id = refreshToken.Id
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

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            var sql = @"SELECT *
                        FROM refresh_tokens
                        WHERE token = @Token
                          AND expires_at > NOW()";

            using var connection = new NpgsqlConnection(_connectionString);

            return await connection.QuerySingleOrDefaultAsync<RefreshToken>(sql, new
            {
                Token = token
            });
        }
    }
}
