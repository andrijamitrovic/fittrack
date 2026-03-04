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
    }
}
