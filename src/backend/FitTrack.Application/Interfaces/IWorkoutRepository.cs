using FitTrack.Application.DTOs;
using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IWorkoutRepository
    {
        Task<Workout> CreateWorkoutAsync(Workout workout, List<WorkoutExercise> workoutExercises, List<ExerciseSet> exerciseSets);
        Task<List<WorkoutDetailRow>> GetWorkoutsAsync(Guid userId, bool isTemplate);
        Task<List<WorkoutTemplateDetailRow>> GetWorkoutTemplatesAsync(Guid userId);
    }
}
