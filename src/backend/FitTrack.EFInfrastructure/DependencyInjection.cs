
using FitTrack.EFInfrastructure.Identity;
using FitTrack.EFInfrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FitTrack.EFInfrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddEFInfrastructure(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PGConnectionString")
            ?? throw new InvalidOperationException("Connection string was not found.");

        services.AddDbContext<FitTrackDbContext>(options => 
            options.UseNpgsql(connectionString));

        services
            .AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
            })
            .AddEntityFrameworkStores<FitTrackDbContext>()
            .AddDefaultTokenProviders();

        return services;
    }
}