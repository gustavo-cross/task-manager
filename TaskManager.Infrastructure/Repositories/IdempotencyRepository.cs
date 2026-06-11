using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories;

public class IdempotencyRepository : IIdempotencyRepository
{
    private readonly AppDbContext _context;

    public IdempotencyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IdempotencyRecord?> GetByKeyAsync(string key)
    {
        var record = await _context.IdempotencyKeys.FindAsync(key);

        if (record is null || record.ExpiresAt < DateTime.UtcNow)
            return null;

        return record;
    }

    public async Task SaveAsync(IdempotencyRecord record)
    {
        _context.IdempotencyKeys.Add(record);
        await _context.SaveChangesAsync();
    }
}
