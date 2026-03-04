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
    }
}
