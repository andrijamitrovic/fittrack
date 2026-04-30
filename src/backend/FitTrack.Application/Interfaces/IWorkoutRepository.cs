using FitTrack.Application.Common;
using FitTrack.Application.DTOs;
using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IWorkoutRepository
    {
        Task<Workout?> CreateWorkoutAsync(Workout workout, List<WorkoutExercise> workoutExercises, List<ExerciseSet> exerciseSets);
        Task<List<WorkoutDetailRow>> GetWorkoutsAsync(Guid userId, bool isTemplate);
        Task<List<WorkoutDetailRow>> GetWorkoutAsync(Guid userId, Guid workoutId, bool isTemplate);
        Task<(ResultType Code, Workout? Data)> UpdateWorkoutAsync(Guid userId, Workout workout, List<WorkoutExercise> workoutExercises, List<ExerciseSet> exerciseSets);
        Task<ResultType> DeleteWorkoutAsync(Guid userId, Guid workoutId, bool isTemplate);
    }
}
