using FitTrack.Domain.Entities;

namespace FitTrack.Api.Interfaces
{
    public interface IExerciseService
    {
        public Task<IEnumerable<Exercise>> GetAllAsync();
    }
}
