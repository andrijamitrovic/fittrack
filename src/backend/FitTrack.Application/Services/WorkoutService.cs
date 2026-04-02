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

        public async Task<Workout> CreateWorkoutAsync(WorkoutDTO workoutDTO, Guid userId, bool isTemplate)
        {
            var workout = new Workout
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = workoutDTO.Title,
                Date = DateTime.Now,
                Notes = workoutDTO.Notes,
                DurationMin = workoutDTO.DurationMin,
                IsTemplate = isTemplate
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
            return await _workoutRepository.CreateWorkoutAsync(workout, workoutExercises, exerciseSets);
        }

        public async Task<List<ViewWorkoutDTO>> GetWorkoutsAsync(Guid userId, bool isTemplate, Guid? workoutId = null)
        {
            var result = await _workoutRepository.GetWorkoutsAsync(userId, isTemplate, workoutId);
            if (result == null)
            {
                return new List<ViewWorkoutDTO>();
            }
            var workouts = result.GroupBy(
                                            w => new
                                            {
                                                w.WorkoutId,
                                                w.Title,
                                                w.Date,
                                                w.WorkoutNotes,
                                                w.DurationMin
                                            },
                                             w => new
                                             {
                                                 w.WorkoutExerciseId,
                                                 w.ExerciseId,
                                                 w.OrderIndex,
                                                 w.ExerciseNotes,
                                                 w.ExerciseName,
                                                 w.Category,
                                                 w.MuscleGroup,
                                                 w.SetNumber,
                                                 w.Reps,
                                                 w.Weight,
                                                 w.Rpe,
                                                 w.IsWarmup
                                             },
                                             (key, g) => new ViewWorkoutDTO
                                             {
                                                 WorkoutId = key.WorkoutId,
                                                 Title = key.Title,
                                                 Date = key.Date,
                                                 WorkoutNotes = key.WorkoutNotes,
                                                 DurationMin = key.DurationMin,
                                                 Exercises = [.. g.GroupBy(
                                                     e => new
                                                     {
                                                         e.WorkoutExerciseId,
                                                         e.ExerciseId,
                                                         e.OrderIndex,
                                                         e.ExerciseNotes,
                                                         e.ExerciseName,
                                                         e.Category,
                                                         e.MuscleGroup
                                                     },
                                                     e => new
                                                     {
                                                         e.SetNumber,
                                                         e.Reps,
                                                         e.Weight,
                                                         e.Rpe,
                                                         e.IsWarmup
                                                     },
                                                     (key, g) => new ViewExerciseDTO
                                                     {
                                                         WorkoutExerciseId = key.WorkoutExerciseId,
                                                         ExerciseId = key.ExerciseId,
                                                         OrderIndex = key.OrderIndex,
                                                         ExerciseNotes = key.ExerciseNotes,
                                                         ExerciseName = key.ExerciseName,
                                                         Category = key.Category,
                                                         MuscleGroup = key.MuscleGroup,
                                                         Sets = [.. g.Select(s => new ViewSetDTO
                                                         {
                                                             SetNumber = s.SetNumber,
                                                             Reps = s.Reps,
                                                             Weight = s.Weight,
                                                             Rpe = s.Rpe,
                                                             IsWarmup = s.IsWarmup
                                                         })]
                                                     }
                                                     )]
                                             });

            return [.. workouts];
        }

        public async Task<Workout?> CopyWorkout(Guid userId, bool isTemplate, Guid? workoutId = null)
        {
            // isTemplate value is ignored when workoutId is provided
            List<ViewWorkoutDTO> result = await GetWorkoutsAsync(userId, false, workoutId);

            if (result.Any() == false)
            {
                return null;    
            }
            
            ViewWorkoutDTO workoutResult = result.First();

            var workout = new Workout
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = workoutResult.Title,
                Date = DateTime.Now,
                IsTemplate = isTemplate
            };

            List<WorkoutExercise> workoutExercises = new List<WorkoutExercise>();
            List<ExerciseSet> exerciseSets = new List<ExerciseSet>();

            foreach (var workoutExerciseDTO in workoutResult.Exercises)
            {
                var workoutExercise = new WorkoutExercise
                {
                    Id = Guid.NewGuid(),
                    WorkoutId = workout.Id,
                    ExerciseId = workoutExerciseDTO.ExerciseId,
                    OrderIndex = workoutExerciseDTO.OrderIndex
                };
                workoutExercises.Add(workoutExercise);

                foreach (var exerciseSetDTO in workoutExerciseDTO.Sets)
                {
                    exerciseSets.Add(new ExerciseSet
                    {
                        Id = Guid.NewGuid(),
                        WorkoutExerciseId = workoutExercise.Id,
                        SetNumber = exerciseSetDTO.SetNumber,
                        Reps = exerciseSetDTO.Reps,
                        Weight = exerciseSetDTO.Weight,
                    });
                }
            }
            return await _workoutRepository.CreateWorkoutAsync(workout, workoutExercises, exerciseSets);
        }
    }

}