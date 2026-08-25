import { createPaginatedResponse } from './pagination.util';

describe('Pagination Utility Unit Tests', () => {
  it('should correctly calculate pagination metadata for 0 records', () => {
    const result = createPaginatedResponse([], 0, 1, 10);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it('should correctly calculate pagination for 1 record', () => {
    const data = [{ id: '1', name: 'Item 1' }];
    const result = createPaginatedResponse(data, 1, 1, 10);
    expect(result.pagination.total).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it('should correctly calculate pagination for 9 records with limit 10', () => {
    const data = Array.from({ length: 9 }, (_, i) => ({ id: `${i + 1}` }));
    const result = createPaginatedResponse(data, 9, 1, 10);
    expect(result.pagination.total).toBe(9);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNextPage).toBe(false);
  });

  it('should correctly calculate pagination for 10 records with limit 10', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ id: `${i + 1}` }));
    const result = createPaginatedResponse(data, 10, 1, 10);
    expect(result.pagination.total).toBe(10);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNextPage).toBe(false);
  });

  it('should correctly calculate pagination for 11 records with limit 10 (Page 1 of 2)', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ id: `${i + 1}` }));
    const result = createPaginatedResponse(data, 11, 1, 10);
    expect(result.pagination.total).toBe(11);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it('should correctly calculate pagination for 11 records with limit 10 (Page 2 of 2 - Last Page)', () => {
    const data = [{ id: '11' }];
    const result = createPaginatedResponse(data, 11, 2, 10);
    expect(result.pagination.total).toBe(11);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  it('should correctly calculate pagination for 20 records with limit 10', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ id: `${i + 1}` }));
    const result = createPaginatedResponse(data, 20, 1, 10);
    expect(result.pagination.total).toBe(20);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.hasNextPage).toBe(true);
  });

  it('should correctly calculate pagination for 21 records with limit 10 (3 total pages)', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ id: `${i + 1}` }));
    const result = createPaginatedResponse(data, 21, 2, 10);
    expect(result.pagination.total).toBe(21);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  it('should correctly handle large datasets (1,000 records with limit 25 = 40 pages)', () => {
    const data = Array.from({ length: 25 }, (_, i) => ({ id: `${i + 1}` }));
    const result = createPaginatedResponse(data, 1000, 15, 25);
    expect(result.pagination.total).toBe(1000);
    expect(result.pagination.totalPages).toBe(40);
    expect(result.pagination.page).toBe(15);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  it('should correctly handle 10,000+ records with limit 50 (200 pages)', () => {
    const data = Array.from({ length: 50 }, (_, i) => ({ id: `${i + 1}` }));
    const result = createPaginatedResponse(data, 10000, 200, 50);
    expect(result.pagination.total).toBe(10000);
    expect(result.pagination.totalPages).toBe(200);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  it('should gracefully handle unpaginated or null page/limit inputs', () => {
    const data = [{ id: '1' }, { id: '2' }];
    const result = createPaginatedResponse(data, 2);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });
});
