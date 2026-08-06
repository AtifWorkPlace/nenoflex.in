import { UserRole } from '@/types';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  actorRole: UserRole;
  targetResource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// In-Memory Audit Logs Array
const auditLogsStore: AuditLog[] = [];

// Rate Limiter Bucket Store (IP -> count)
const rateLimiterMap = new Map<string, { count: number; resetTime: number }>();

export const SecuritySuite = {
  // 1. JWT Simulation & Token Validation
  generateToken: (userId: string, email: string, role: UserRole): string => {
    const payload: JwtPayload = {
      userId,
      email,
      role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    return btoa(JSON.stringify(payload));
  },

  verifyToken: (token: string): JwtPayload | null => {
    try {
      const decoded: JwtPayload = JSON.parse(atob(token));
      if (Date.now() > decoded.exp) return null;
      return decoded;
    } catch {
      return null;
    }
  },

  // 2. Role-Based Access Control (RBAC) Guard
  hasPermission: (userRole: UserRole, requiredRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      'Customer': 1,
      'Admin': 2,
      'Super Admin': 3,
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },

  // 3. XSS Input Sanitizer
  sanitizeInput: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // 4. CSRF Token Generator & Validator
  generateCsrfToken: (): string => {
    return `csrf-${Math.random().toString(36).substring(2)}-${Date.now()}`;
  },

  validateCsrfToken: (token: string, sessionToken: string): boolean => {
    return Boolean(token && sessionToken && token === sessionToken);
  },

  // 5. Rate Limiter (Token Bucket per IP)
  checkRateLimit: (ip: string, limit = 100, windowMs = 60000): { allowed: boolean; remaining: number } => {
    const now = Date.now();
    const record = rateLimiterMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimiterMap.set(ip, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    record.count += 1;
    return { allowed: true, remaining: limit - record.count };
  },

  // 6. Audit Logging System
  logAuditAction: (action: string, actorEmail: string, actorRole: UserRole, targetResource: string, details: string, ipAddress = '127.0.0.1'): AuditLog => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      actorEmail,
      actorRole,
      targetResource,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    };
    auditLogsStore.unshift(log);
    return log;
  },

  getAuditLogs: (): AuditLog[] => {
    return [...auditLogsStore];
  },

  // 7. Secure HTTP Headers (Helmet Specs)
  getSecureHeaders: () => {
    return {
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
    };
  }
};
