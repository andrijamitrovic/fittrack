using FitTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.Infrastructure.Persistence.EfCore;

public class FitTrackDbContext : DbContext
{
    public FitTrackDbContext(DbContextOptions<FitTrackDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<ExerciseSet> ExerciseSets => Set<ExerciseSet>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(x => x.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(x => x.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(255)
                .IsRequired();

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

            entity.Property(x => x.Role)
                .HasColumnName("role")
                .HasMaxLength(20)
                .HasDefaultValue("user")
                .IsRequired();

            entity.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Exercise>(entity =>
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

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Workout>(entity =>
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

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkoutExercise>(entity =>
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

            entity.HasOne<Workout>()
                .WithMany()
                .HasForeignKey(x => x.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<Exercise>()
                .WithMany()
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ExerciseSet>(entity =>
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

            entity.HasOne<WorkoutExercise>()
                .WithMany()
                .HasForeignKey(x => x.WorkoutExerciseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(x => x.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            entity.Property(x => x.Token)
                .HasColumnName("token")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(x => x.ExpiresAt)
                .HasColumnName("expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("now()");

            entity.HasIndex(x => x.Token).IsUnique();

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

}