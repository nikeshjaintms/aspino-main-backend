import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService Unit Tests', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new UsersService(mockRepository);
    jest.clearAllMocks();
  });

  it('should find user by email', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await service.findByEmail('test@example.com');
    expect(result).toEqual(mockUser);
    expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should create user with hashed password', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
    mockRepository.create.mockResolvedValue({
      id: '1',
      name: 'Test',
      email: 'test@example.com',
      password: 'hashedPassword123',
    });

    const result = await service.createUser({
      name: 'Test',
      email: 'test@example.com',
      password: 'plainPassword',
      role: 'ADMIN' as any,
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashedPassword123' }),
    );
    expect(result.id).toBe('1');
  });

  it('should update user and hash password if password was provided', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPass');
    mockRepository.update.mockResolvedValue({ id: '1', name: 'Updated' });

    await service.updateUser('1', { password: 'newPlainPassword' });
    expect(bcrypt.hash).toHaveBeenCalledWith('newPlainPassword', 10);
    expect(mockRepository.update).toHaveBeenCalledWith('1', {
      password: 'newHashedPass',
    });
  });

  it('should delete user', async () => {
    mockRepository.delete.mockResolvedValue({ id: '1' });
    const result = await service.deleteUser('1');
    expect(result).toEqual({ id: '1' });
    expect(mockRepository.delete).toHaveBeenCalledWith('1');
  });
});
