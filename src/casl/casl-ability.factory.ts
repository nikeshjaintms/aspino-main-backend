import { Injectable, Logger } from '@nestjs/common';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { PrismaService } from '../prisma/prisma.service';
import { Action, AppAbility, AppSubject } from './types/casl.types';

@Injectable()
export class CaslAbilityFactory {
  private readonly logger = new Logger(CaslAbilityFactory.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to retrieve or resolve role relation for user
   */
  private async resolveUserWithRole(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) return null;

    if (user.roleRelation) {
      return user;
    }

    const fallbackRole = await this.prisma.role.findFirst({
      where: {
        name: {
          equals: user.role || 'USER',
          mode: 'insensitive',
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (fallbackRole) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { roleId: fallbackRole.id },
      }).catch((e) => this.logger.warn(`Could not update user roleId: ${e.message}`));

      user.roleRelation = fallbackRole;
    }

    return user;
  }

  /**
   * Builds dynamic CASL Ability for the given user from database permissions
   */
  async createForUser(userId: string): Promise<AppAbility> {
    const { can, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    const user = await this.resolveUserWithRole(userId);

    if (!user || !user.roleRelation) {
      return build();
    }

    const assignedPermissions = user.roleRelation.permissions.map(
      (rp) => rp.permission,
    );

    // 1. Check for universal super admin permission
    const isSuperAdmin =
      user.roleRelation.name === 'SUPER_ADMIN' ||
      assignedPermissions.some(
        (p) => p.module === 'all' && p.action === 'manage',
      );

    if (isSuperAdmin) {
      can('manage', 'all');
      return build();
    }

    // 2. Map granular dynamic permissions
    for (const perm of assignedPermissions) {
      const action = perm.action as Action;
      const subject = perm.module as AppSubject;

      can(action, subject);
    }

    return build();
  }

  /**
   * Helper to retrieve flattened user permissions and role details
   */
  async getUserPermissionsPayload(userId: string) {
    const user = await this.resolveUserWithRole(userId);

    if (!user || !user.roleRelation) {
      return {
        role: null,
        isSuperAdmin: false,
        permissions: [],
        rules: [],
      };
    }

    const permissions = user.roleRelation.permissions.map((rp) => ({
      id: rp.permission.id,
      application: rp.permission.application,
      module: rp.permission.module,
      action: rp.permission.action,
      name: rp.permission.name,
      description: rp.permission.description,
    }));

    const isSuperAdmin =
      user.roleRelation.name === 'SUPER_ADMIN' ||
      permissions.some((p) => p.module === 'all' && p.action === 'manage');

    const rules = isSuperAdmin
      ? [{ action: 'manage', subject: 'all' }]
      : permissions.map((p) => ({
          action: p.action,
          subject: p.module,
        }));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.roleRelation ? user.roleRelation.name : user.role,
        roleDisplayName: user.roleRelation?.displayName || user.role,
        isSuperAdmin,
      },
      role: {
        id: user.roleRelation.id,
        name: user.roleRelation.name,
        displayName: user.roleRelation.displayName,
        description: user.roleRelation.description,
      },
      isSuperAdmin,
      permissions,
      rules,
    };
  }
}
