using FitTrack.Application.Common;
using FitTrack.Application.DTOs;
using FitTrack.Application.Interfaces;
using FitTrack.Domain.Entities;

namespace FitTrack.Application.Services
{
    public class ExerciseService
    {
        private readonly IExerciseRepository _exerciseRepository;
        public ExerciseService(IExerciseRepository exerciseRepository)
        {
            _exerciseRepository = exerciseRepository;
        }

        public async Task<ServiceResult<IEnumerable<Exercise>>> GetAllAsync()
        {
            return new ServiceResult<IEnumerable<Exercise>>
            {
                Code = ResultType.Success,
                Data = await _exerciseRepository.GetAllAsync(),
                Message = "Exercises returned."
            };
        }

        public async Task<ServiceResult<Exercise?>> AddExerciseAsync(ExerciseDTO exercise, Guid userId)
        {

            var repoResult = await _exerciseRepository.AddExerciseAsync(new Exercise
            {
                Name = exercise.Name,
                Category = exercise.Category,
                MuscleGroup = exercise.MuscleGroup,
                Description = exercise.Description,
                IsCustom = true,
                CreatedBy = userId
            });

            return new ServiceResult<Exercise?>
            {
                Code = repoResult.Code,
                Data = repoResult.Data,
                Message = repoResult.Code switch
                {
                    ResultType.Success => "Exercise added.",
                    ResultType.Conflict => "This exercise already exists",
                    _ => "Exercise could not be added."
                }
            };
        }

        public async Task<ServiceResult<Exercise?>> GetExerciseAsync(Guid id)
        {
            if (await _exerciseRepository.GetExerciseAsync(id) is not Exercise exercise)
            {
                return new ServiceResult<Exercise?>
                {
                    Code = ResultType.NotFound,
                    Data = null,
                    Message = "Exercise not found."
                };
            }
            else
            {
                return new ServiceResult<Exercise?>
                {
                    Code = ResultType.Success,
                    Data = exercise,
                    Message = "Exercise found."
                };
            }
        }

        public async Task<ServiceResult<Exercise?>> UpdateExerciseAsync(ExerciseDTO exercise, Guid id, Guid userId)
        {
            var repoResult = await _exerciseRepository.UpdateExerciseAsync(new Exercise
            {
                Id = id,
                Name = exercise.Name,
                Category = exercise.Category,
                MuscleGroup = exercise.MuscleGroup,
                Description = exercise.Description,
                IsCustom = true,
                CreatedBy = userId
            });

            return new ServiceResult<Exercise?>
            {
                Code = repoResult.Code,
                Data = repoResult.Data,
                Message = repoResult.Code switch
                {
                    ResultType.Success => "Exercise updated successfully.",
                    ResultType.NotFound => "Exercise not found.",
                    ResultType.Conflict => "Exercise already exists.",
                    _ => "Exercise could not be updated."
                }
            };
        }

        public async Task<ServiceResult<bool>> DeleteExerciseAsync(Guid id)
        {
            var code = await _exerciseRepository.DeleteExerciseAsync(id);

            return new ServiceResult<bool>
            {
                Code = code,
                Data = code == ResultType.Success,
                Message = code switch
                {
                    ResultType.Success => "Exercise deleted successfully.",
                    ResultType.NotFound => "Exercise not found.",
                    ResultType.Conflict => "Exercise is used in a workout.",
                    _ => "Exercise could not be deleted."
                }
            };
        }
    }
}
