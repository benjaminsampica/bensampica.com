
namespace HtmxMinimalApi.Features.Shared;

public abstract class PagedRequest
{
    private int _page = 1;

    public int Page
    {
        get => _page;
        set => _page = value <= 0 ? 1 : value;
    }

    public virtual int Size { get; set; } = 10;
    public int Skip => (Page - 1) * Size;
    
    protected static ValueTask<T> BindInternalAsync<T>(HttpContext context)
        where T : PagedRequest
    {
        var result = Activator.CreateInstance<T>();

        _ = int.TryParse(context.Request.Query[nameof(Page)], out var page);
        result.Page = page;
        
        _ = int.TryParse(context.Request.Query[nameof(Size)], out var size);
        result.Size = size;

        return ValueTask.FromResult(result);
    }
}

public abstract class PagedResponse<T> where T : class
{
    public required int Page { get; init; }
    public required int Size { get; init; }
    public required int TotalCount { get; init; }
    public required ICollection<T> Items { get; init; } = [];

    public int TotalPages => (int)Math.Ceiling((decimal)TotalCount / Size);
    public bool HasMorePages => Page < TotalPages;
}