using System.Data;
using FitTrack.Application.Common;
using FitTrack.Application.DTOs;
using FitTrack.Application.ReadModels.Workouts;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;
using Microsoft.VisualBasic;

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
                Date = DateTime.UtcNow.Date,
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
            var workouts = await _workoutRepository.GetWorkoutsAsync(userId, isTemplate);

            return new ServiceResult<List<ViewWorkoutDTO>>
            {
                Code = ResultType.Success,
                Data = MapWorkoutReadModelToViewWorkoutDTO(workouts),
                Message = "Workouts succesfully returned."
            };

        }


        public async Task<ServiceResult<ViewWorkoutDTO?>> GetWorkoutAsync(Guid userId, Guid workoutId)
        {
            var workout = await _workoutRepository.GetWorkoutAsync(userId, workoutId);

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
                Data = MapWorkoutReadModelToViewWorkoutDTO(new List<WorkoutReadModel>{workout}).FirstOrDefault(),
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

        private static List<ViewWorkoutDTO> MapWorkoutReadModelToViewWorkoutDTO(IEnumerable<WorkoutReadModel> workouts)
        {
            var workoutViews = new List<ViewWorkoutDTO>();

            foreach (var workout in workouts)
            {
                workoutViews.Add(new ViewWorkoutDTO
                {
                    WorkoutId = workout.WorkoutId,
                    Title = workout.Title,
                    Date = workout.Date,
                    WorkoutNotes = workout.WorkoutNotes,
                    DurationMin = workout.DurationMin,
                    Exercises = MapWorkoutExerciseReadModelToViewExerciseDTO(workout.Exercises)
                });
            }

            return workoutViews;
        }

        private static List<ViewExerciseDTO> MapWorkoutExerciseReadModelToViewExerciseDTO(List<WorkoutExerciseReadModel> exercises)
        {
            var exerciseViews = new List<ViewExerciseDTO>();

            foreach (var exercise in exercises)
            {
                exerciseViews.Add(new ViewExerciseDTO
                {
                    WorkoutExerciseId = exercise.WorkoutExerciseId,
                    ExerciseId = exercise.ExerciseId,
                    OrderIndex = exercise.OrderIndex,
                    ExerciseNotes = exercise.ExerciseNotes,
                    ExerciseName = exercise.ExerciseName,
                    Category = exercise.Category,
                    MuscleGroup = exercise.MuscleGroup,
                    Sets = MapWorkoutSetReadModelToViewSetDTO(exercise.Sets)
                });
            }

            return exerciseViews;
        }

        private static List<ViewSetDTO> MapWorkoutSetReadModelToViewSetDTO(List<WorkoutSetReadModel> sets)
        {
            var setViews = new List<ViewSetDTO>();

            foreach (var set in sets)
            {
                setViews.Add(new ViewSetDTO
                {
                    SetNumber = set.SetNumber,
                    Reps = set.Reps,
                    Weight = set.Weight,
                    Rpe = set.Rpe,
                    IsWarmup = set.IsWarmup 
                });
            }

            return setViews;
        }
    }

}