using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Data;

namespace TaskManager.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(IEnumerable<TaskItem> Items, int TotalCount)> GetAllAsync(
        int page, int pageSize, TaskStatus? status,
        string? titleContains, string? descriptionContains,
        DateTime? dateFrom, DateTime? dateTo,
        DateTime? completedDateFrom, DateTime? completedDateTo,
        string? sortBy, bool sortDesc, bool showDeleted)
    {
        var query = _context.Tasks.AsQueryable();

        query = query.Where(t => t.IsDeleted == showDeleted);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(titleContains))
            query = query.Where(t => t.Title.Contains(titleContains));

        if (!string.IsNullOrWhiteSpace(descriptionContains))
            query = query.Where(t => t.Description != null && t.Description.Contains(descriptionContains));

        if (dateFrom.HasValue)
            query = query.Where(t => t.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(t => t.CreatedAt <= dateTo.Value);

        if (completedDateFrom.HasValue)
            query = query.Where(t => t.CompletedAt >= completedDateFrom.Value);

        if (completedDateTo.HasValue)
            query = query.Where(t => t.CompletedAt <= completedDateTo.Value);

        query = (sortBy?.ToLowerInvariant(), sortDesc) switch
        {
            ("title", false) => query.OrderBy(t => t.Title),
            ("title", true) => query.OrderByDescending(t => t.Title),
            ("status", false) => query.OrderBy(t => t.Status),
            ("status", true) => query.OrderByDescending(t => t.Status),
            ("completedat", false) => query.OrderBy(t => t.CompletedAt),
            ("completedat", true) => query.OrderByDescending(t => t.CompletedAt),
            (_, false) => query.OrderBy(t => t.CreatedAt),
            (_, true) => query.OrderByDescending(t => t.CreatedAt),
        };

        var totalCount = await query.CountAsync();

        if (pageSize <= 0)
        {
            var allItems = await query.ToListAsync();
            return (allItems, totalCount);
        }

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await _context.Tasks.FindAsync(id);
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<TaskItem> UpdateAsync(TaskItem task)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task DeleteAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task is not null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }

    public async Task SoftDeleteAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task is not null)
        {
            task.IsDeleted = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task RestoreAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task is not null)
        {
            task.IsDeleted = false;
            await _context.SaveChangesAsync();
        }
    }
}
