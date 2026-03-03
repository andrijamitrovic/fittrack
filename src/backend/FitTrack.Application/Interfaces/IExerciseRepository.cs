using FitTrack.Domain.Entities;

namespace FitTrack.Application.Interfaces
{
    public interface IExerciseRepository
    {
        Task<IEnumerable<Exercise>> GetAllAsync();
    }
}
