using FitTrack.Application.Common;
using FitTrack.Application.DTOs;
using FitTrack.Application.Interfaces;
using FitTrack.Application.Services;
using FitTrack.Domain.Entities;
using Moq;

namespace FitTrack.Tests;

public class ExerciseServiceTests
{
    private readonly Mock<IExerciseRepository> _mockExerciseRepository;
    private readonly ExerciseService _exerciseService;

    public ExerciseServiceTests()
    {
        _mockExerciseRepository = new Mock<IExerciseRepository>();
        _exerciseService = new ExerciseService(_mockExerciseRepository.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsExercise()
    {

        var exercises = new List<Exercise>
        {
            new Exercise
            {
                Id = Guid.NewGuid(),
                Name = "Bench Press",
                Category = "Strength",
                MuscleGroup = "Chest",
                IsCustom = true
            }
        };

        _mockExerciseRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(exercises);

        var result = await _exerciseService.GetAllAsync();

        Assert.Equal(ResultType.Success, result.Code);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data);
    }

    [Fact]
    public async Task AddExerciseAsync_ValidInput_ReturnsSuccessAndMapsFields()
    {
        var repo = new Mock<IExerciseRepository>();
        var service = new ExerciseService(repo.Object);
        var userId = Guid.NewGuid();

        Exercise? captured = null;

        var dto = new ExerciseDTO
        {
            Name = "Bench Press",
            Category = "Strength",
            MuscleGroup = "Chest",
            Description = "Flat barbell press"
        };

        repo.Setup(r => r.AddExerciseAsync(It.IsAny<Exercise>()))
            .Callback<Exercise>(exercise => captured = exercise)
            .ReturnsAsync((ResultType.Success, new Exercise
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Category = dto.Category,
                MuscleGroup = dto.MuscleGroup,
                Description = dto.Description,
                IsCustom = true,
                CreatedBy = userId
            }));

        var result = await service.AddExerciseAsync(dto, userId);

        Assert.Equal(ResultType.Success, result.Code);
        Assert.NotNull(result.Data);
        Assert.NotNull(captured);
        Assert.Equal(dto.Name, captured.Name);
        Assert.Equal(dto.Category, captured.Category);
        Assert.Equal(dto.MuscleGroup, captured.MuscleGroup);
        Assert.Equal(dto.Description, captured.Description);
        Assert.True(captured.IsCustom);
        Assert.Equal(userId, captured.CreatedBy);
    }

    [Fact]
    public async Task AddExerciseAsync_Duplicate_ReturnsConflict()
    {
        var repo = new Mock<IExerciseRepository>();
        var service = new ExerciseService(repo.Object);

        var dto = new ExerciseDTO
        {
            Name = "Bench Press",
            Category = "Strength",
            MuscleGroup = "Chest"
        };

        repo.Setup(r => r.AddExerciseAsync(It.IsAny<Exercise>()))
            .ReturnsAsync((ResultType.Conflict, (Exercise?)null));

        var result = await service.AddExerciseAsync(dto, Guid.NewGuid());

        Assert.Equal(ResultType.Conflict, result.Code);
        Assert.Null(result.Data);
        Assert.Equal("This exercise already exists", result.Message);
    }


    [Fact]
    public async Task GetExerciseAsync_NotFound_ReturnsNotFound()
    {
        var repo = new Mock<IExerciseRepository>();
        var service = new ExerciseService(repo.Object);
        var id = Guid.NewGuid();

        repo.Setup(r => r.GetExerciseAsync(id)).ReturnsAsync((Exercise?)null);

        var result = await service.GetExerciseAsync(id);

        Assert.Equal(ResultType.NotFound, result.Code);
        Assert.Null(result.Data);
        Assert.Equal("Exercise not found.", result.Message);
    }

    [Fact]
    public async Task UpdateExerciseAsync_Conflict_ReturnsConflict()
    {
        var repo = new Mock<IExerciseRepository>();
        var service = new ExerciseService(repo.Object);

        var dto = new ExerciseDTO
        {
            Name = "Bench Press",
            Category = "Strength",
            MuscleGroup = "Chest"
        };

        repo.Setup(r => r.UpdateExerciseAsync(It.IsAny<Exercise>()))
            .ReturnsAsync((ResultType.Conflict, (Exercise?)null));

        var result = await service.UpdateExerciseAsync(dto, Guid.NewGuid(), Guid.NewGuid());

        Assert.Equal(ResultType.Conflict, result.Code);
        Assert.Null(result.Data);
        Assert.Equal("Exercise already exists.", result.Message);
    }

    [Fact]
    public async Task DeleteExerciseAsync_Conflict_ReturnsConflictMessage()
    {
        var repo = new Mock<IExerciseRepository>();
        var service = new ExerciseService(repo.Object);
        var id = Guid.NewGuid();

        repo.Setup(r => r.DeleteExerciseAsync(id)).ReturnsAsync(ResultType.Conflict);

        var result = await service.DeleteExerciseAsync(id);

        Assert.Equal(ResultType.Conflict, result.Code);
        Assert.False(result.Data);
        Assert.Equal("Exercise is used in a workout.", result.Message);
    }
}