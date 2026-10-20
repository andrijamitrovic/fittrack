using FitTrack.Application.Common;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;
using FitTrack.EFInfrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FitTrack.EFInfrastructure.Repositories;

public class EfExerciseRepository: IExerciseRepository
{
    private readonly FitTrackDbContext _dbContext;

    public EfExerciseRepository(FitTrackDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Exercise>> GetAllAsync()
    {
        return await _dbContext.Exercises
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Exercise?> GetExerciseAsync(Guid id)
    {
        return await _dbContext.Exercises
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<(ResultType Code, Exercise? Data)> AddExerciseAsync(Exercise exercise)
    {
        try
        {
            _dbContext.Exercises.Add(exercise);
            await _dbContext.SaveChangesAsync();

            return (ResultType.Success, exercise);
        }
        catch (DbUpdateException ex) when (IsPostgresError(ex, PostgresErrorCodes.UniqueViolation))
        {
            return (ResultType.Conflict, null);
        }
        catch
        {
            return (ResultType.Failure, null);
        }
    }

    public async Task<(ResultType Code, Exercise? Data)> UpdateExerciseAsync(Exercise exercise)
    {
        try
        {
            var existing = await _dbContext.Exercises
                .FirstOrDefaultAsync(x => x.Id == exercise.Id);
            
            if (existing is null)
            {
                return (ResultType.NotFound, null);
            }

            existing.Name = exercise.Name;
            existing.Category = exercise.Category;
            existing.MuscleGroup = exercise.MuscleGroup;
            existing.Description = exercise.Description;

            await _dbContext.SaveChangesAsync();

            return (ResultType.Success, existing);
        }
        catch (DbUpdateException ex) when (IsPostgresError(ex, PostgresErrorCodes.UniqueViolation))
        {
            return (ResultType.Conflict, null);
        }
        catch
        {
            return (ResultType.Failure, null);
        }
    }

    public async Task<ResultType> DeleteExerciseAsync(Guid id)
    {
        try
        {
            var exercise = await _dbContext.Exercises
                .FirstOrDefaultAsync(x => x.Id == id);

            if (exercise is null)
            {
                return ResultType.NotFound;
            }

            _dbContext.Exercises.Remove(exercise);
            await _dbContext.SaveChangesAsync();

            return ResultType.Success;
        }
        catch (DbUpdateException ex) when (IsPostgresError(ex, PostgresErrorCodes.ForeignKeyViolation))
        {
            return ResultType.Conflict;
        }
        catch
        {
            return ResultType.Failure;
        }
    }

    private static bool IsPostgresError(DbUpdateException exception, string sqlState)
    {
        return exception.InnerException is PostgresException postgresException
            && postgresException.SqlState == sqlState;
    }
}