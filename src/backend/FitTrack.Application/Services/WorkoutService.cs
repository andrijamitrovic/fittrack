using FitTrack.Application.DTOs;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;
using System.Transactions;

namespace FitTrack.Application.Services
{
    public class WorkoutService
    {
        private readonly IWorkoutRepository _workoutRepository;
        public WorkoutService(IWorkoutRepository workoutRepository)
        {
            _workoutRepository = workoutRepository;
        }

        public Task<Workout> CreateWorkoutAsync(WorkoutDTO workoutDTO)
        {
            var workout = new Workout
            {
                Id = Guid.NewGuid(),
                UserId = workoutDTO.UserId,
                Title = workoutDTO.Title,
                Date = DateTime.Now,
                Notes = workoutDTO.Notes,
                DurationMin = workoutDTO.DurationMin
            };

            List<WorkoutExercise> workoutExercises = new List<WorkoutExercise>();
            List<ExerciseSet> exerciseSets = new List<ExerciseSet>();

            foreach (var workoutExerciseDTO in workoutDTO.WorkoutExercises)
            {
                var workoutExercise = new WorkoutExercise
                {
                    Id = Guid.NewGuid(),
                    WorkoutId = workout.Id,
                    ExerciseId = workoutExerciseDTO.ExerciseId,
                    OrderIndex = workoutExerciseDTO.OrderIndex,
                    Notes = workoutExerciseDTO.Notes
                };
                workoutExercises.Add(workoutExercise);

                foreach (var exerciseSetDTO in workoutExerciseDTO.ExerciseSets)
                {
                    exerciseSets.Add(new ExerciseSet
                    {
                        Id = Guid.NewGuid(),
                        WorkoutExerciseId = workoutExercise.Id,
                        SetNumber = exerciseSetDTO.SetNumber,
                        Reps = exerciseSetDTO.Reps,
                        Weight = exerciseSetDTO.Weight,
                        Rpe = exerciseSetDTO.Rpe,
                        IsWarmup = exerciseSetDTO.IsWarmup
                    });
                }
            }
            return _workoutRepository.CreateWorkoutAsync(workout, workoutExercises, exerciseSets);
        }
    }
}
