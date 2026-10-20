using FitTrack.Application.Common;
using FitTrack.Application.ReadModels.Workouts;
using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IWorkoutRepository
    {
        Task<Workout?> CreateWorkoutAsync(Workout workout);
        Task<List<WorkoutReadModel>> GetWorkoutsAsync(Guid userId, bool isTemplate);
        Task<WorkoutReadModel?> GetWorkoutAsync(Guid userId, Guid workoutId);
        Task<(ResultType Code, Workout? Data)> UpdateWorkoutAsync(Guid userId, Workout workout);
        Task<ResultType> DeleteWorkoutAsync(Guid userId, Guid workoutId, bool isTemplate);
    }
}
