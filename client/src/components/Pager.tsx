// The pager of the six lists. The API always answers with the same shape
// (api/src/pagination.ts), so this component always receives the same props.
type Props = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function Pager({ page, totalPages, total, onPageChange }: Props) {
  return (
    <div className="flex items-center gap-4 py-4 text-sm">
      <span className="text-khulula-muted">
        Page {page} of {totalPages} · {total} results
      </span>

      <button
        type="button"
        className="rounded border border-khulula-line-strong px-3 py-1 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>

      <button
        type="button"
        className="rounded border border-khulula-line-strong px-3 py-1 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
