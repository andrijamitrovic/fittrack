namespace FitTrack.Application.Common;

public class ServiceResult<T>
{
    public required ResultType Code { get; init; }
    public required T Data { get; init; }
    public required string Message { get; init; }

}