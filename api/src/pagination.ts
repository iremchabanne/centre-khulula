// Pagination, written once for the six lists of the application.
//
// WHY IT IS A RULE AND NOT AN OPTION. §6.4 of the cahier des charges asks for a
// server-side LIMIT on every list, including the ones that fit on one page. A
// list is short today and long in two years, and the query that fetches
// everything is the one that becomes a problem — not the short answer it
// happens to return right now. Éco-conception, CP 6.
//
// One file rather than a constant repeated in each service, because the six
// lists must answer with the same shape. A frontend that reads `total_pages`
// on one screen and something else on the next is a frontend with a bug in it.

export const PAGE_SIZE = 10;

// Turns a page number into what Prisma wants: how many rows to skip, and how
// many to take. Page 1 skips nothing, page 2 skips ten.
export function pageQuery(page: number) {
  return {
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  };
}

// The answer every paginated list sends back.
//
// `total` is the number of rows in the whole list, not on this page — it is
// what lets the interface draw "page 2 of 5" and decide whether to show the
// control at all.
export function pageResult<T>(items: T[], total: number, page: number) {
  return {
    items,
    page,
    page_size: PAGE_SIZE,
    total,
    total_pages: Math.ceil(total / PAGE_SIZE),
  };
}
