// Pagination, written once for the six lists of the application.
//
// §6.4 of the cahier des charges asks for a server-side LIMIT on every list,
// including those that fit on one page: the query that fetches everything is
// the one that becomes a problem later. Éco-conception, CP 6.
//
// One file rather than a constant per service, so the six lists answer with the
// same shape.

export const PAGE_SIZE = 10;

// Turns a page number into what Prisma wants: how many rows to skip, and how
// many to take. Page 1 skips nothing, page 2 skips ten.
export function pageQuery(page: number) {
  return {
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  };
}

// The answer every paginated list sends back. `total` counts the whole list,
// not this page: it is what draws "page 2 of 5".
export function pageResult<T>(items: T[], total: number, page: number) {
  return {
    items,
    page,
    page_size: PAGE_SIZE,
    total,
    total_pages: Math.ceil(total / PAGE_SIZE),
  };
}
