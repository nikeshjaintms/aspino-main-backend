import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService Unit Tests', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
      updatePasswordByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-access-token-xyz'),
    };

    service = new AuthService(mockUserRepository, mockJwtService);
    jest.clearAllMocks();
  });

  describe('loginAdmin', () => {
    it('should log in admin with valid credentials and return access_token', async () => {
      const mockAdmin = {
        id: 'u-1',
        email: 'admin@aspino.com',
        role: 'ADMIN',
        name: 'Admin User',
        password: 'hashed-password',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.loginAdmin({
        email: 'admin@aspino.com',
        password: 'Password123!',
      });

      expect(result.message).toBe('Admin login successful');
      expect(result.access_token).toBe('jwt-access-token-xyz');
      expect(result.admin.email).toBe('admin@aspino.com');
      expect(result.admin.role).toBe('ADMIN');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.loginAdmin({
          email: 'unknown@aspino.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user role is not ADMIN', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'u-2',
        email: 'guard@aspino.com',
        role: 'SECURITY_GUARD',
        password: 'hashed-password',
      });

      await expect(
        service.loginAdmin({
          email: 'guard@aspino.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow('Access denied. Only Admin accounts can log in here.');
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'u-1',
        email: 'admin@aspino.com',
        role: 'ADMIN',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.loginAdmin({
          email: 'admin@aspino.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully for valid current password', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: 'u-1',
        password: 'current-hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');

      const result = await service.changePassword('u-1', {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      });

      expect(result.message).toBe('Password updated successfully');
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith('u-1', 'new-hashed');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('unknown-id', {
          currentPassword: 'old',
          newPassword: 'new',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if current password is wrong', async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: 'u-1',
        password: 'current-hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('u-1', {
          currentPassword: 'wrongOldPassword',
          newPassword: 'new',
        }),
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});
