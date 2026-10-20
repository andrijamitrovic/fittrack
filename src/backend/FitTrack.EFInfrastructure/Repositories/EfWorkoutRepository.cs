using FitTrack.Application.Common;
using FitTrack.Application.Interfaces;
using FitTrack.Application.ReadModels.Workouts;
using FitTrack.Domain.Entities;
using FitTrack.EFInfrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.EFInfrastructure.Repositories;

public class EfWorkoutRepository : IWorkoutRepository
{
    private readonly FitTrackDbContext _dbContext;

    public EfWorkoutRepository(FitTrackDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Workout?> CreateWorkoutAsync(Workout workout)
    {
        try
        {
            _dbContext.Workouts.Add(workout);
            await _dbContext.SaveChangesAsync();
            return workout;
        }
        catch
        {
            return null;
        }
    }

    public async Task<List<WorkoutReadModel>> GetWorkoutsAsync(Guid userId, bool isTemplate)
    {
        var workouts = await WorkoutGraph()
            .Where(x => x.UserId == userId && x.IsTemplate == isTemplate)
            .OrderByDescending(x => x.Date)
            .ToListAsync();

        return workouts.Select(MapWorkout).ToList();
    }

    public async Task<WorkoutReadModel?> GetWorkoutAsync(Guid userId, Guid workoutId)
    {
        var workout = await WorkoutGraph()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == workoutId);

        return workout is null ? null : MapWorkout(workout);
    }

    public async Task<(ResultType Code, Workout? Data)> UpdateWorkoutAsync(Guid userId, Workout workout)
    {
        try
        {
            var existing = await _dbContext.Workouts
                .Include(x => x.WorkoutExercises)
                .ThenInclude(x => x.ExerciseSets)
                .FirstOrDefaultAsync(x =>
                    x.Id == workout.Id &&
                    x.UserId == userId &&
                    x.IsTemplate == workout.IsTemplate);

            if (existing is null)
            {
                return (ResultType.NotFound, null);
            }

            existing.Title = workout.Title;
            existing.Notes = workout.Notes;
            existing.DurationMin = workout.DurationMin;
            existing.UpdatedAt = DateTime.UtcNow;

            _dbContext.WorkoutExercises.RemoveRange(existing.WorkoutExercises);
            existing.WorkoutExercises = workout.WorkoutExercises;

            await _dbContext.SaveChangesAsync();
            return (ResultType.Success, existing);
        }
        catch
        {
            return (ResultType.Failure, null);
        }
    }

    public async Task<ResultType> DeleteWorkoutAsync(Guid userId, Guid workoutId, bool isTemplate)
    {
        try
        {
            var rowsAffected = await _dbContext.Workouts
                .Where(x => x.Id == workoutId && x.UserId == userId && x.IsTemplate == isTemplate)
                .ExecuteDeleteAsync();

            return rowsAffected == 0 ? ResultType.NotFound : ResultType.Success;
        }
        catch
        {
            return ResultType.Failure;
        }
    }

    private IQueryable<Workout> WorkoutGraph()
    {
        return _dbContext.Workouts
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.WorkoutExercises.OrderBy(we => we.OrderIndex))
            .ThenInclude(x => x.Exercise)
            .Include(x => x.WorkoutExercises)
            .ThenInclude(x => x.ExerciseSets.OrderBy(set => set.SetNumber));
    }

    private static WorkoutReadModel MapWorkout(Workout workout)
    {
        return new WorkoutReadModel
        {
            WorkoutId = workout.Id,
            Title = workout.Title,
            Date = workout.Date ?? DateTime.MinValue,
            WorkoutNotes = workout.Notes,
            DurationMin = workout.DurationMin,
            Exercises = workout.WorkoutExercises
                .OrderBy(x => x.OrderIndex)
                .Select(x => new WorkoutExerciseReadModel
                {
                    WorkoutExerciseId = x.Id,
                    ExerciseId = x.ExerciseId,
                    OrderIndex = x.OrderIndex,
                    ExerciseNotes = x.Notes,
                    ExerciseName = x.Exercise?.Name ?? string.Empty,
                    Category = x.Exercise?.Category ?? string.Empty,
                    MuscleGroup = x.Exercise?.MuscleGroup ?? string.Empty,
                    Sets = x.ExerciseSets
                        .OrderBy(set => set.SetNumber)
                        .Select(set => new WorkoutSetReadModel
                        {
                            SetNumber = set.SetNumber,
                            Reps = set.Reps,
                            Weight = set.Weight,
                            Rpe = set.Rpe,
                            IsWarmup = set.IsWarmup ?? false
                        })
                        .ToList()
                })
                .ToList()
        };
    }
}
