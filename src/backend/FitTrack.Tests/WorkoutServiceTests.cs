using FitTrack.Application.Common;
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
            Guid userId = Guid.NewGuid();
            Guid workoutId = Guid.NewGuid();
            string title = "Push Day";
            string notes = "Chest and triceps";
            var durationMin = 60;

            var dto = new WorkoutDTO
            {
                Title = title,
                Notes = notes,
                DurationMin = durationMin,
                WorkoutExercises = new List<WorkoutExerciseDTO>
                {
                    new WorkoutExerciseDTO
                    {
                        ExerciseId = Guid.NewGuid(),
                        OrderIndex = 0,
                        ExerciseSets = new List<ExerciseSetDTO>
                        {
                            new ExerciseSetDTO
                            {
                                SetNumber = 1
                            }
                        }
                    }
                }
            };

            _mockRepo.Setup(r => r.CreateWorkoutAsync(
                It.IsAny<Workout>(),
                It.IsAny<List<WorkoutExercise>>(),
                It.IsAny<List<ExerciseSet>>()
            )).ReturnsAsync(new Workout
            {
                Id = workoutId,
                UserId = userId,
                Title = title,
                Notes = notes,
                DurationMin = durationMin,
                Date = DateTime.Now,
                IsTemplate = false
            });

            var result = await _service.CreateWorkoutAsync(dto, userId, false);

            Assert.Equal(ResultType.Success, result.Code);
            Assert.NotNull(result.Data);
            Assert.Equal(title, result.Data.Title);
            Assert.Equal(notes, result.Data.Notes);
            Assert.Equal(durationMin, result.Data.DurationMin);
        }

        [Fact]
        public async Task CreateWorkout_RepositoryReturnsNull_ReturnsFailure()
        {
            Guid userId = Guid.NewGuid();
            string title = "Push Day";
            string notes = "Chest and triceps";
            var durationMin = 60;
            var expectedMessage = "Workout was not created.";

            var dto = new WorkoutDTO
            {
                Title = title,
                Notes = notes,
                DurationMin = durationMin,
                WorkoutExercises = new List<WorkoutExerciseDTO>
                {
                    new WorkoutExerciseDTO
                    {
                        ExerciseId = Guid.NewGuid(),
                        OrderIndex = 0,
                        ExerciseSets = new List<ExerciseSetDTO>
                        {
                            new ExerciseSetDTO
                            {
                                SetNumber = 1
                            }
                        }
                    }
                }
            };

            _mockRepo.Setup(r => r.CreateWorkoutAsync(
                It.IsAny<Workout>(),
                It.IsAny<List<WorkoutExercise>>(),
                It.IsAny<List<ExerciseSet>>()
            )).ReturnsAsync((Workout?)null);


            var result = await _service.CreateWorkoutAsync(dto, userId, false);

            Assert.Equal(ResultType.Failure, result.Code);
            Assert.Null(result.Data);
            Assert.Equal(expectedMessage, result.Message);
        }

        [Fact]
        public async Task GetWorkoutsAsync_EmptyRepositoryResult_ReturnsEmptyList()
        {
            Guid userId = Guid.NewGuid();
            Guid workoutId = Guid.NewGuid();

            _mockRepo.Setup(r => r.GetWorkoutsAsync(
                It.IsAny<Guid>(),
                It.IsAny<bool>()
            )).ReturnsAsync(new List<WorkoutDetailRow>());

            var result = await _service.GetWorkoutsAsync(userId, false);

            Assert.Equal(ResultType.Success, result.Code);
            Assert.NotNull(result.Data);
            Assert.Empty(result.Data);
        }

        [Fact]
        public async Task GetWorkoutsAsync_ValidInput_ReturnsMappedWorkouts()
        {
            Guid userId = Guid.NewGuid();
            var workoutId = Guid.NewGuid();
            var workoutExerciseId = Guid.NewGuid();
            var exerciseId = Guid.NewGuid();
            var date = DateTime.Now;
            var title = "Push Day";
            var workoutNotes = "Chest and triceps";
            var durationMin = 60;
            var exerciseNotes = "Controlled tempo";
            var exerciseName = "Bench Press";
            var category = "Strength";
            var muscleGroup = "Chest";

            var rows = new List<WorkoutDetailRow>
            {
                new WorkoutDetailRow
                {
                    WorkoutId = workoutId,
                    Title = title,
                    Date = date,
                    WorkoutNotes = workoutNotes,
                    DurationMin = durationMin,
                    WorkoutExerciseId = workoutExerciseId,
                    ExerciseId = exerciseId,
                    OrderIndex = 0,
                    ExerciseNotes = exerciseNotes,
                    ExerciseName = exerciseName,
                    Category = category,
                    MuscleGroup = muscleGroup,
                    SetNumber = 1,
                    Reps = 10,
                    Weight = 60,
                    Rpe = 8,
                    IsWarmup = false
                }
            };

            _mockRepo.Setup(r => r.GetWorkoutsAsync(
                It.IsAny<Guid>(),
                It.IsAny<bool>()
            )).ReturnsAsync(rows);

            var result = await _service.GetWorkoutsAsync(userId, false);

            Assert.Equal(ResultType.Success, result.Code);
            Assert.NotNull(result.Data);
            Assert.Single(result.Data);
            Assert.Equal(title, result.Data[0].Title);
            Assert.Equal(durationMin, result.Data[0].DurationMin);
            Assert.Single(result.Data[0].Exercises);
            Assert.Single(result.Data[0].Exercises[0].Sets);
        }

        [Fact]
        public async Task UpdateWorkoutAsync_ValidInput_ReturnsSuccess()
        {
            var userId = Guid.NewGuid();
            var workoutId = Guid.NewGuid();
            var exerciseId = Guid.NewGuid();

            var dto = new WorkoutDTO
            {
                Title = "Updated Push Day",
                Notes = "Updated notes",
                DurationMin = 75,
                WorkoutExercises =
                [
                    new WorkoutExerciseDTO
                    {
                        ExerciseId = exerciseId,
                        OrderIndex = 1,
                        Notes = "Bench notes",
                        ExerciseSets =
                        [
                            new ExerciseSetDTO
                            {
                                SetNumber = 1,
                                Reps = 5,
                                Weight = 100,
                                Rpe = 8,
                                IsWarmup = false
                            }
                        ]
                    }
                ]
            };

            _mockRepo
                .Setup(r => r.UpdateWorkoutAsync(
                    userId,
                    It.IsAny<Workout>(),
                    It.IsAny<List<WorkoutExercise>>(),
                    It.IsAny<List<ExerciseSet>>()
                ))
                .ReturnsAsync((ResultType.Success, new Workout
                {
                    Id = workoutId,
                    UserId = userId,
                    Title = dto.Title,
                    Notes = dto.Notes,
                    DurationMin = dto.DurationMin,
                    IsTemplate = false
                }));

            var result = await _service.UpdateWorkoutAsync(userId, workoutId, dto, false);

            Assert.Equal(ResultType.Success, result.Code);
            Assert.NotNull(result.Data);
            Assert.Equal("Workout updated successfully.", result.Message);
            Assert.Equal(dto.Title, result.Data.Title);
        }

        [Fact]
        public async Task UpdateWorkoutAsync_Template_SetsIsTemplateTrue()
        {
            var userId = Guid.NewGuid();
            var workoutId = Guid.NewGuid();
            Workout? capturedWorkout = null;

            var dto = new WorkoutDTO
            {
                Title = "Template",
                DurationMin = 60,
                WorkoutExercises = []
            };

            _mockRepo
                .Setup(r => r.UpdateWorkoutAsync(
                    userId,
                    It.IsAny<Workout>(),
                    It.IsAny<List<WorkoutExercise>>(),
                    It.IsAny<List<ExerciseSet>>()
                ))
                .Callback<Guid, Workout, List<WorkoutExercise>, List<ExerciseSet>>(
                    (_, workout, _, _) => capturedWorkout = workout
                )
                .ReturnsAsync((ResultType.Success, new Workout
                {
                    Id = workoutId,
                    UserId = userId,
                    Title = dto.Title,
                    DurationMin = dto.DurationMin,
                    IsTemplate = true
                }));

            var result = await _service.UpdateWorkoutAsync(userId, workoutId, dto, true);

            Assert.Equal(ResultType.Success, result.Code);
            Assert.NotNull(capturedWorkout);
            Assert.True(capturedWorkout.IsTemplate);
        }

        [Fact]
        public async Task DeleteWorkoutAsync_NotFound_ReturnsNotFound()
        {
            var userId = Guid.NewGuid();
            var workoutId = Guid.NewGuid();

            _mockRepo
                .Setup(r => r.DeleteWorkoutAsync(userId, workoutId, false))
                .ReturnsAsync(ResultType.NotFound);

            var result = await _service.DeleteWorkoutAsync(userId, workoutId, false);

            Assert.Equal(ResultType.NotFound, result.Code);
            Assert.False(result.Data);
            Assert.Equal("Workout not found.", result.Message);
        }

        [Fact]
        public async Task GetWorkoutAsync_EmptyRepositoryResult_ReturnsNotFound()
        {
            var userId = Guid.NewGuid();
            var workoutId = Guid.NewGuid();

            _mockRepo
                .Setup(r => r.GetWorkoutAsync(userId, workoutId))
                .ReturnsAsync([]);

            var result = await _service.GetWorkoutAsync(userId, workoutId);

            Assert.Equal(ResultType.NotFound, result.Code);
            Assert.Null(result.Data);
        }
    }
}
