using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<IdempotencyRecord> IdempotencyKeys => Set<IdempotencyRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(t => t.Status)
                .HasConversion<string>();
        });

        modelBuilder.Entity<IdempotencyRecord>(entity =>
        {
            entity.HasKey(r => r.Key);

            entity.Property(r => r.Key)
                .HasMaxLength(36);

            entity.Property(r => r.Response)
                .HasColumnType("nvarchar(max)");
        });
    }
}
