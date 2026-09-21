import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roleRelation: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roleRelation: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: any): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
      include: {
        roleRelation: true,
      },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async updatePasswordByEmail(
    email: string,
    hashedPassword: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        roleRelation: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        roleRelation: true,
      },
    });
  }

  async updateRole(id: string, roleId: string): Promise<User> {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    return this.prisma.user.update({
      where: { id },
      data: {
        roleId,
        role: role ? role.name : 'USER',
      },
      include: {
        roleRelation: true,
      },
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
