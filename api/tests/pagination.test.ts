// The one UNIT test of the project, and it is here to be exactly that.
//
// The three other tests all talk to PostgreSQL, because what they check —
// a row lock, a rollback, a column read on every request — only exists in a
// real database. They are integration tests.
//
// CP 9 asks for both kinds, so this file is the other kind: pageQuery and
// pageResult are pure functions. Same input, same output, always. No database,
// no Redis, no mocks, nothing to start beforehand — `npm test` alone runs it.
//
// It is deliberately the smallest honest example. Pagination is a rule of the
// cahier des charges (§6.4, éco-conception): every list is limited server-side,
// ten per page, and all six lists answer with the same shape.

import { test, expect } from 'vitest';
import { pageQuery, pageResult, PAGE_SIZE } from '../src/pagination';

test('page 1 skips nothing, page 3 skips two pages', () => {
  expect(pageQuery(1)).toEqual({ skip: 0, take: PAGE_SIZE });
  expect(pageQuery(3)).toEqual({ skip: 20, take: PAGE_SIZE });
});

test('the number of pages is rounded up, so a partial page still counts', () => {
  // 14 animals is the seed, and the reason the number was chosen: one full page
  // and one page of four. Rounding down would hide those four.
  const result = pageResult(['an animal'], 14, 2);

  expect(result.total_pages).toBe(2);
  expect(result.total).toBe(14);
  expect(result.page).toBe(2);
});
