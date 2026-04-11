FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY FitTrack.slnx .
COPY FitTrack.Api/*.csproj FitTrack.Api/
COPY FitTrack.Application/*.csproj FitTrack.Application/
COPY FitTrack.Domain/*.csproj FitTrack.Domain/
COPY FitTrack.Infrastructure/*.csproj FitTrack.Infrastructure/
COPY FitTrack.Tests/*.csproj FitTrack.Tests/
COPY FitTrack.E2ETests/*.csproj FitTrack.E2ETests/
RUN dotnet restore FitTrack.slnx

COPY . ./
RUN dotnet publish FitTrack.Api -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN useradd -m -r appuser

COPY --from=build /app ./

RUN chown -R appuser:appuser /app

USER appuser

ENV ASPNET_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT [ "dotnet", "FitTrack.Api.dll" ]