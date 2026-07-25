function ReportsPagination({ onPageChange, pagination }) {
  if (!pagination) {
    return null
  }

  const { page, totalPages, hasNextPage, hasPreviousPage } = pagination

  return (
    <nav className="reports-pagination" aria-label="Report history pagination">
      <button
        className="dashboard-secondary-action"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        Previous
      </button>
      <span aria-live="polite">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>
      <button
        className="dashboard-secondary-action"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        Next
      </button>
    </nav>
  )
}

export default ReportsPagination

