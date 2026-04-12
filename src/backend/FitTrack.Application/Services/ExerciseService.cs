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

        public Task<IEnumerable<Exercise>> GetAllAsync()
        {
            return _exerciseRepository.GetAllAsync();
        }

        public async Task<Exercise?> AddExercise(ExerciseDTO exercise, Guid userId)
        {
            return await _exerciseRepository.AddExercise(new Exercise
            {
                Name = exercise.Name,
                Category = exercise.Category,
                MuscleGroup = exercise.MuscleGroup,
                Description = exercise.Description,
                IsCustom = true,
                CreatedBy = userId
            });
        }
        public async Task<Exercise?> GetExerciseAsync(Guid id)
        {
            return await _exerciseRepository.GetExerciseAsync(id);
        }
    }
}
