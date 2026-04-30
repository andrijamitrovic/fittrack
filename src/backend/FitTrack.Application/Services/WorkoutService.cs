using FitTrack.Application.Common;
using FitTrack.Application.DTOs;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;

namespace FitTrack.Application.Services
{
    public class WorkoutService
    {
        private readonly IWorkoutRepository _workoutRepository;
        public WorkoutService(IWorkoutRepository workoutRepository)
        {
            _workoutRepository = workoutRepository;
        }

        public async Task<ServiceResult<Workout?>> CreateWorkoutAsync(WorkoutDTO workoutDTO, Guid userId, bool isTemplate)
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
            Workout? returnWorkout = await _workoutRepository.CreateWorkoutAsync(workout, workoutExercises, exerciseSets);
            if (returnWorkout == null)
            {
                return new ServiceResult<Workout?>
                {
                    Code = ResultType.Failure,
                    Data = null,
                    Message = "Workout was not created."
                };
            }
            else
            {
                return new ServiceResult<Workout?>
                {
                    Code = ResultType.Success,
                    Data = returnWorkout,
                    Message = "Workout created successfully."
                };
            }
        }

        public async Task<ServiceResult<List<ViewWorkoutDTO>>> GetWorkoutsAsync(Guid userId, bool isTemplate)
        {
            var result = await _workoutRepository.GetWorkoutsAsync(userId, isTemplate);
            var workouts = MapWorkoutRows(result);

            return new ServiceResult<List<ViewWorkoutDTO>>
            {
                Code = ResultType.Success,
                Data = [.. workouts],
                Message = "Workouts succesfully returned."
            };

        }


        public async Task<ServiceResult<ViewWorkoutDTO?>> GetWorkoutAsync(Guid userId, Guid workoutId, bool isTemplate)
        {
            List<WorkoutDetailRow> result = await _workoutRepository.GetWorkoutAsync(userId, workoutId, isTemplate);
            var workout = MapWorkoutRows(result).FirstOrDefault();

            if (workout == null)
            {
                return new ServiceResult<ViewWorkoutDTO?>
                {
                    Code = ResultType.NotFound,
                    Data = null,
                    Message = "Workout not found."
                };
            }

            return new ServiceResult<ViewWorkoutDTO?>
            {
                Code = ResultType.Success,
                Data = workout,
                Message = "Workout succesfully returned."
            };

        }

        public async Task<ServiceResult<bool>> DeleteWorkoutAsync(Guid userId, Guid workoutId, bool isTemplate)
        {
            var result = await _workoutRepository.DeleteWorkoutAsync(userId, workoutId, isTemplate);

            return new ServiceResult<bool>
            {
                Code = result,
                Data = result == ResultType.Success,
                Message = result switch
                {
                    ResultType.Success => "Workout deleted successfully.",
                    ResultType.NotFound => "Workout not found.",
                    _ => "Workout could not be deleted."
                }
            };
        }

        public async Task<ServiceResult<Workout?>> UpdateWorkoutAsync(Guid userId, Guid id, WorkoutDTO workoutDTO, bool isTemplate)
        {
            var workout = new Workout
            {
                Id = id,
                UserId = userId,
                Title = workoutDTO.Title,
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
            var returnWorkout = await _workoutRepository.UpdateWorkoutAsync(userId, workout, workoutExercises, exerciseSets);

            return new ServiceResult<Workout?>
            {
                Code = returnWorkout.Code,
                Data = returnWorkout.Data,
                Message = returnWorkout.Code switch
                {
                    ResultType.Success => "Workout updated successfully.",
                    ResultType.NotFound => "Workout not found.",
                    _ => "Workout could not be updated."
                }
            };
        }

        private static List<ViewWorkoutDTO> MapWorkoutRows(IEnumerable<WorkoutDetailRow> workouts)
        {
            return [..workouts.GroupBy(
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
                                             })];
        }
    }

}