namespace TaskManager.Domain.Entities;

public class IdempotencyRecord
{
    public string Key { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}
