namespace TaskManager.Application.DTOs;

public class TaskSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public TaskStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool IsDeleted { get; set; }
}
