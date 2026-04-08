using FitTrack.Application.DTOs;
using FitTrack.Application.Interfaces;
using FitTrack.Application.Services;
using FitTrack.Domain.Entities;
using Moq;

namespace FitTrack.Tests
{
    public class WorkoutServiceTests
    {
        private readonly Mock<IWorkoutRepository> _mockRepo;
        private readonly WorkoutService _service;

        public WorkoutServiceTests()
        {
            _mockRepo = new Mock<IWorkoutRepository>();
            _service = new WorkoutService(_mockRepo.Object);
        }

        [Fact]
        public async Task CreateWorkout_ValidInput_ReturnsWorkout()
        {
            _mockRepo.Setup(r => r.CreateWorkoutAsync(
                It.IsAny<Workout>(),
                It.IsAny<List<WorkoutExercise>>(),
                It.IsAny<List<ExerciseSet>>()
            )).ReturnsAsync(new Workout
                            {
                                Id = Guid.NewGuid(),
                                UserId = Guid.NewGuid(),
                                Title = "Push Day",
                                Date = DateTime.Now,
                                IsTemplate = false
                            });

            var result = await _service.CreateWorkoutAsync(new WorkoutDTO
            {
                Title = "Push Day",
                DurationMin = 60,
                WorkoutExercises = new List<WorkoutExerciseDTO>()
            }, Guid.NewGuid(), true);
        }
    }
}
