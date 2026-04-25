using FitTrack.Application.Interfaces;
using FitTrack.Application.Services;
using FitTrack.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


var connectionString = builder.Configuration.GetConnectionString("PGConnectionString")!;
var jwtSettings = builder.Configuration.GetSection("JwtSettings")!;

var jwtDictionary = jwtSettings.Get<Dictionary<string, string>>()
    ?? throw new InvalidOperationException("JwtSettings are missing.");

var key = jwtSettings["Key"]
    ?? throw new InvalidOperationException("JwtSettings:Key is missing.");
    
// Add services to the container.
builder.Services.AddScoped<IExerciseRepository>(provider => new ExerciseRepository(connectionString));
builder.Services.AddScoped<ExerciseService>();
builder.Services.AddScoped<IWorkoutRepository>(provider => new WorkoutRepository(connectionString));
builder.Services.AddScoped<WorkoutService>();
builder.Services.AddScoped<IUserRepository>(provider => new UserRepository(connectionString));
builder.Services.AddScoped<IAuthRepository>(provider => new AuthRepository(connectionString));
builder.Services.AddScoped<AuthService>(provider => new AuthService(
                                                        provider.GetRequiredService<IUserRepository>(),
                                                        provider.GetRequiredService<IAuthRepository>(),
                                                        jwtDictionary));
builder.Services.AddControllers();

var secretKey = Encoding.UTF8.GetBytes(key);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(secretKey)
        };
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
                      {
                          policy.AllowAnyOrigin()
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});


var app = builder.Build();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();


app.Run();