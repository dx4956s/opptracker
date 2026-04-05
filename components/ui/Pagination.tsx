interface Props {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, total, limit, onChange }: Props) {
  if (pages <= 1) return null;

  const from = Math.min((page - 1) * limit + 1, total);
  const to   = Math.min(page * limit, total);

  // Build page number list with ellipsis
  function buildPageList(): (number | "...")[] {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const list: (number | "...")[] = [];
    list.push(1);
    if (page > 3) list.push("...");
    for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p++) list.push(p);
    if (page < pages - 2) list.push("...");
    list.push(pages);
    return list;
  }

  const pageList = buildPageList();

  const btnBase = "flex items-center justify-center w-8 h-8 rounded-[8px] text-[13px] font-medium transition-colors";

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-smoky4 bg-white">
      <p className="text-smoky6 text-[12px]">
        Showing {from}–{to} of {total}
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} ${page === 1 ? "text-smoky5 cursor-not-allowed" : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Page numbers */}
        {pageList.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 text-center text-smoky5 text-[13px]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`${btnBase} ${
                p === page
                  ? "bg-blue500 text-white"
                  : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className={`${btnBase} ${page === pages ? "text-smoky5 cursor-not-allowed" : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
