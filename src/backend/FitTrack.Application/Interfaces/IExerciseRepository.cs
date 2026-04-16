using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IExerciseRepository
    {
        Task<IEnumerable<Exercise>> GetAllAsync();
        Task<Exercise?> AddExercise(Exercise exercise);
        Task<Exercise?> GetExerciseAsync(Guid id);
        Task<Exercise?> UpdateExerciseAsync(Exercise exercise);
        Task<bool> DeleteExerciseAsync(Guid id);
    }
}
