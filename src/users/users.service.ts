import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.userRepository.create(data);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
