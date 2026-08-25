import { AuditService } from './services/audit.service';

describe('AuditService Unit Tests', () => {
  let service: AuditService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      activityLog: {
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
    };
    service = new AuditService(mockPrisma);
  });

  it('should query activity logs with pagination and filters', async () => {
    mockPrisma.activityLog.count.mockResolvedValue(20);
    mockPrisma.activityLog.findMany.mockResolvedValue([
      { id: '1', action: 'LOGIN', createdAt: new Date() },
    ]);

    const result = await service.getLogs({
      page: 1,
      limit: 10,
      action: 'LOGIN',
    });

    expect(result.pagination.total).toBe(20);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.data.length).toBe(1);
  });
});
