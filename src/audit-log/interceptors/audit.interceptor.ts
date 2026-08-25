import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';
import {
  LOG_ACTIVITY_KEY,
  LogActivityOptions,
} from '../decorators/log-activity.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Check if the route has custom activity log metadata
    const decoratorOptions = this.reflector.get<LogActivityOptions>(
      LOG_ACTIVITY_KEY,
      context.getHandler(),
    );

    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isLogin =
      (url.includes('/auth') && url.includes('login')) || url.includes('login');

    // Only log if it's mutating, or if it is a login request, or if it has the decorator explicitly
    if (!isMutating && !isLogin && !decoratorOptions) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          this.logEvent(
            request,
            responseBody,
            context.switchToHttp().getResponse().statusCode,
            decoratorOptions,
          );
        },
        error: (error) => {
          const statusCode = error.status || 500;
          this.logEvent(
            request,
            error.response || error.message,
            statusCode,
            decoratorOptions,
          );
        },
      }),
    );
  }

  private async logEvent(
    request: any,
    responseBody: any,
    statusCode: number,
    decoratorOptions?: LogActivityOptions,
  ) {
    try {
      const { method, url, query, params, body } = request;
      const clientIp = this.getClientIp(request);
      const userAgent = request.headers['user-agent'];

      // 1. Resolve User details
      let userId: string | null = null;
      let userEmail: string | null = null;
      let userName: string | null = null;
      let userRole: string | null = null;

      // Try reading from JWT guard populated request.user
      if (request.user) {
        userId = request.user.userId || request.user.id || null;
        userEmail = request.user.email || null;
        userName = request.user.name || null;
        userRole = request.user.role || null;
      }

      // If request.user is missing, attempt parsing JWT from Authorization header
      if (!userEmail && request.headers && request.headers.authorization) {
        try {
          const authHeader = request.headers.authorization;
          if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payloadBase64 = token.split('.')[1];
            if (payloadBase64) {
              const decoded = JSON.parse(
                Buffer.from(payloadBase64, 'base64').toString('utf8'),
              );
              userId = userId || decoded.sub || decoded.userId || null;
              userEmail = userEmail || decoded.email || null;
              userName = userName || decoded.name || decoded.email || null;
              userRole = userRole || decoded.role || null;
            }
          }
        } catch (e) {
          // Token decode fallback ignore
        }
      }

      // If it was a successful login, extract user details from the response body
      if (
        url.includes('login') &&
        responseBody &&
        statusCode >= 200 &&
        statusCode < 300
      ) {
        const u = responseBody.user || responseBody.admin || responseBody;
        if (u && typeof u === 'object') {
          userId = userId || u.id || u.userId || null;
          userEmail = userEmail || u.email || null;
          userName = userName || u.name || null;
          userRole = userRole || u.role || 'ADMIN';
        }
      }

      // 2. Resolve Action & Entity Type
      let action = '';
      let entityType: string | null = null;
      let entityId: string | null = null;

      if (decoratorOptions) {
        action = decoratorOptions.action;
        entityType = decoratorOptions.entityType || null;
      } else {
        const fallback = this.getFallbackAction(method, url);
        action = fallback.action;
        entityType = fallback.entityType;
      }

      // If logging login attempt explicitly
      if (url.includes('login')) {
        action = 'LOGIN';
        entityType = 'Auth';
      }

      // Extract entityId if present in route params or response body
      if (params && (params.id || params.gatePassId || params.userId)) {
        entityId = params.id || params.gatePassId || params.userId;
      } else if (responseBody && (responseBody.id || responseBody.userId)) {
        entityId = responseBody.id || responseBody.userId;
      }

      // 3. Sanitization
      const sanitizedRequestBody = this.sanitize(body);
      const sanitizedResponseBody = this.sanitize(responseBody);

      // Save to database asynchronously
      await this.auditService.createLog({
        userId,
        userEmail,
        userName,
        userRole,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        method,
        url,
        ip: clientIp || null,
        userAgent: userAgent || null,
        statusCode,
        requestBody: sanitizedRequestBody || {},
        queryParams: query || {},
        routeParams: params || {},
        responseBody: sanitizedResponseBody || {},
      });
    } catch (err) {
      this.logger.error(
        `Error processing activity log entry: ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }

  /**
   * Sanitizes payloads recursively, masking sensitive fields.
   */
  private sanitize(obj: any): any {
    if (!obj) return obj;
    if (typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const scrubbed: any = {};
    const sensitiveKeys = [
      'password',
      'currentpassword',
      'newpassword',
      'token',
      'accesstoken',
      'access_token',
      'client_secret',
      'secret',
    ];

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        scrubbed[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        scrubbed[key] = this.sanitize(value);
      } else {
        scrubbed[key] = value;
      }
    }
    return scrubbed;
  }

  /**
   * Generates a fallback human-readable action name based on route and HTTP method
   */
  private getFallbackAction(
    method: string,
    url: string,
  ): { action: string; entityType: string } {
    const path = url.split('?')[0];
    const parts = path.split('/').filter(Boolean);

    let rawEntity = 'System';
    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      // Check if last element is a parameter/id
      const isId =
        last.includes('-') || !isNaN(Number(last)) || last.length > 20;
      const entityPart =
        isId && parts.length > 1 ? parts[parts.length - 2] : last;

      rawEntity = entityPart
        .replace(/-./g, (match) => match[1].toUpperCase())
        .replace(/^./, (match) => match[0].toUpperCase());

      // Simple singularization
      if (rawEntity.endsWith('s') && !rawEntity.endsWith('ss')) {
        rawEntity = rawEntity.slice(0, -1);
      }
    }

    const prefixMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    const actionPrefix = prefixMap[method] || method;
    return {
      action: `${actionPrefix}_${rawEntity.toUpperCase()}`,
      entityType: rawEntity,
    };
  }

  /**
   * Resolves client IP address, supporting local mappings, proxies and reverse headers
   */
  private getClientIp(request: any): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips =
        typeof forwardedFor === 'string'
          ? forwardedFor.split(',')
          : forwardedFor;
      if (ips.length > 0) {
        const rawIp = ips[0].trim();
        return rawIp === '::1' ? '127.0.0.1' : rawIp;
      }
    }
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp === '::1' ? '127.0.0.1' : realIp;
    }
    const ip = request.ip || request.connection?.remoteAddress || '';
    if (ip === '::1') return '127.0.0.1';
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }
}
