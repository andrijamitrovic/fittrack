using FitTrack.Domain.Entities;
using FitTrack.EFInfrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.EFInfrastructure.Persistence;

public class FitTrackDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public FitTrackDbContext(DbContextOptions<FitTrackDbContext> options)
        : base(options)
    {
    }

    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<ExerciseSet> ExerciseSets => Set<ExerciseSet>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(x => x.DisplayName)
                .HasColumnName("display_name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");
        });

        builder.Entity<Exercise>(entity =>
        {
            entity.ToTable("exercises");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(x => x.Name)
                .HasColumnName("name")
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.Category)
                .HasColumnName("category")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(x => x.MuscleGroup)
                .HasColumnName("muscle_group")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(x => x.Description)
                .HasColumnName("description");

            entity.Property(x => x.IsCustom)
                .HasColumnName("is_custom")
                .HasDefaultValue(false)
                .IsRequired();

            entity.Property(x => x.CreatedBy)
                .HasColumnName("created_by");

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasIndex(x => new { x.Name, x.Category, x.MuscleGroup })
                .IsUnique();
        });

        builder.Entity<Workout>(entity =>
        {
            entity.ToTable("workouts");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(x => x.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(x => x.Title)
                .HasColumnName("title")
                .HasMaxLength(200);

            entity.Property(x => x.Date)
                .HasColumnName("date")
                .HasColumnType("date")
                .HasDefaultValueSql("CURRENT_DATE");

            entity.Property(x => x.Notes)
                .HasColumnName("notes");

            entity.Property(x => x.DurationMin)
                .HasColumnName("duration_min");

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.Property(x => x.IsTemplate)
                .HasColumnName("is_template")
                .HasDefaultValue(false)
                .IsRequired();

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => x.UserId);
        });

        builder.Entity<WorkoutExercise>(entity =>
        {
            entity.ToTable("workout_exercises");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(x => x.WorkoutId)
                .HasColumnName("workout_id")
                .IsRequired();

            entity.Property(x => x.ExerciseId)
                .HasColumnName("exercise_id")
                .IsRequired();

            entity.Property(x => x.OrderIndex)
                .HasColumnName("order_index")
                .IsRequired();

            entity.Property(x => x.Notes)
                .HasColumnName("notes");

            entity.HasOne(x => x.Workout)
                .WithMany(x => x.WorkoutExercises)
                .HasForeignKey(x => x.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Exercise)
                .WithMany(x => x.WorkoutExercises)
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(x => x.WorkoutId);
            entity.HasIndex(x => x.ExerciseId);
        });

        builder.Entity<ExerciseSet>(entity =>
        {
            entity.ToTable("exercise_sets");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(x => x.WorkoutExerciseId)
                .HasColumnName("workout_exercise_id")
                .IsRequired();

            entity.Property(x => x.SetNumber)
                .HasColumnName("set_number")
                .IsRequired();

            entity.Property(x => x.Reps)
                .HasColumnName("reps");

            entity.Property(x => x.Weight)
                .HasColumnName("weight")
                .HasColumnType("decimal(6,2)");

            entity.Property(x => x.Rpe)
                .HasColumnName("rpe")
                .HasColumnType("decimal(3,1)");

            entity.Property(x => x.IsWarmup)
                .HasColumnName("is_warmup")
                .HasDefaultValue(false);

            entity.Property(x => x.Completed)
                .HasColumnName("completed")
                .HasDefaultValue(true);

            entity.HasOne(x => x.WorkoutExercise)
                .WithMany(x => x.ExerciseSets)
                .HasForeignKey(x => x.WorkoutExerciseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => x.WorkoutExerciseId);
        });
    }
}