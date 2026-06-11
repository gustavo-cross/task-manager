using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces;

public interface IIdempotencyRepository
{
    Task<IdempotencyRecord?> GetByKeyAsync(string key);
    Task SaveAsync(IdempotencyRecord record);
}
