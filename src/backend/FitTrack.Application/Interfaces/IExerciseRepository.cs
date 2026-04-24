using FitTrack.Application.Common;
using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IExerciseRepository
    {
        Task<IEnumerable<Exercise>> GetAllAsync();
        Task<Exercise?> GetExerciseAsync(Guid id);
        Task<(ResultType Code, Exercise? Data)> AddExercise(Exercise exercise);
        Task<(ResultType Code, Exercise? Data)> UpdateExerciseAsync(Exercise exercise);
        Task<ResultType> DeleteExerciseAsync(Guid id);
    }
}
