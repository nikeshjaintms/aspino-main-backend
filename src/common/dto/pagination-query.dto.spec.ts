import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto Unit Tests', () => {
  const transformAndValidate = async (plain: any) => {
    const dto = plainToInstance(PaginationQueryDto, plain);
    const errors = await validate(dto);
    return { dto, errors };
  };

  it('should accept valid standard pagination parameters', async () => {
    const { dto, errors } = await transformAndValidate({
      page: '1',
      limit: '10',
      search: 'test',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.search).toBe('test');
    expect(dto.sortOrder).toBe('desc');
  });

  it('should accept page=2, limit=25', async () => {
    const { dto, errors } = await transformAndValidate({
      page: '2',
      limit: '25',
    });
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(25);
  });

  it('should fail validation when page is 0', async () => {
    const { errors } = await transformAndValidate({ page: '0', limit: '10' });
    expect(errors.length).toBeGreaterThan(0);
    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
    expect(pageError?.constraints).toHaveProperty('min');
  });

  it('should fail validation when page is negative (-1)', async () => {
    const { errors } = await transformAndValidate({ page: '-1', limit: '10' });
    expect(errors.length).toBeGreaterThan(0);
    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
  });

  it('should fail validation when page is non-numeric string "abc"', async () => {
    const { errors } = await transformAndValidate({ page: 'abc', limit: '10' });
    expect(errors.length).toBeGreaterThan(0);
    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
  });

  it('should fail validation when limit is 0', async () => {
    const { errors } = await transformAndValidate({ page: '1', limit: '0' });
    expect(errors.length).toBeGreaterThan(0);
    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
    expect(limitError?.constraints).toHaveProperty('min');
  });

  it('should fail validation when limit is negative (-1)', async () => {
    const { errors } = await transformAndValidate({ page: '1', limit: '-1' });
    expect(errors.length).toBeGreaterThan(0);
    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
  });

  it('should fail validation when limit is non-numeric string "abc"', async () => {
    const { errors } = await transformAndValidate({ page: '1', limit: 'abc' });
    expect(errors.length).toBeGreaterThan(0);
    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
  });

  it('should fail validation when limit exceeds 100 (e.g., limit=999999)', async () => {
    const { errors } = await transformAndValidate({ page: '1', limit: '999999' });
    expect(errors.length).toBeGreaterThan(0);
    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
    expect(limitError?.constraints).toHaveProperty('max');
  });

  it('should handle optional / missing parameters with defaults', async () => {
    const { dto, errors } = await transformAndValidate({});
    expect(errors.length).toBe(0);
    expect(dto.sortOrder).toBe('desc');
  });

  it('should reject invalid sortOrder values', async () => {
    const { errors } = await transformAndValidate({ sortOrder: 'INVALID' });
    expect(errors.length).toBeGreaterThan(0);
    const sortError = errors.find((e) => e.property === 'sortOrder');
    expect(sortError).toBeDefined();
  });
});
