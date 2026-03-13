using FitTrack.Application.DTOs;
using FitTrack.Domain.Entities;

namespace FitTrack.Api.Interfaces
{
    public interface IWorkoutService
    {
        public Task<Workout> CreateWorkout(WorkoutDTO workoutDTO);
    }
}
