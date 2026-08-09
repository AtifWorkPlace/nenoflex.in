import crypto from 'crypto';
import { UserRole } from '@/types';

export interface AdminSession {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || 'nenoflex_production_jwt_secret_9981273912739';

export const ServerAuth = {
  // Generate Cryptographically Signed HMAC SHA-256 JWT Token
  generateAdminToken: (email: string, role: UserRole): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Date.now();
    const payload: AdminSession = {
      userId: `admin-${crypto.randomBytes(4).toString('hex')}`,
      email,
      role,
      iat: now,
      exp: now + 24 * 60 * 60 * 1000, // 24 hours
    };

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64url');

    return `${base64Header}.${base64Payload}.${signature}`;
  },

  // Verify Cryptographically Signed HMAC SHA-256 JWT Token
  verifyAdminRequest: (req: Request): { authorized: boolean; session?: AdminSession; error?: string } => {
    try {
      const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
      const cookieHeader = req.headers.get('cookie');

      let token: string | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (authHeader) {
        token = authHeader;
      } else if (cookieHeader) {
        const match = cookieHeader.match(/nenoflex_admin_session=([^;]+)/);
        if (match) token = match[1];
      }

      if (!token) {
        return { authorized: false, error: 'Unauthorized: Missing admin session token' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { authorized: false, error: 'Unauthorized: Malformed JWT token format' };
      }

      const [base64Header, base64Payload, providedSignature] = parts;

      // Recalculate HMAC SHA-256 Signature
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${base64Header}.${base64Payload}`)
        .digest('base64url');

      // Timing-Safe Signature Comparison
      const providedSigBuf = Buffer.from(providedSignature);
      const expectedSigBuf = Buffer.from(expectedSignature);

      if (providedSigBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(providedSigBuf, expectedSigBuf)) {
        return { authorized: false, error: 'Unauthorized: Cryptographic token signature verification failed' };
      }

      // Decode and validate payload claims
      const payloadJson = Buffer.from(base64Payload, 'base64url').toString('utf-8');
      const decoded: AdminSession = JSON.parse(payloadJson);

      if (!decoded || !decoded.role || !decoded.exp) {
        return { authorized: false, error: 'Unauthorized: Missing required token claims' };
      }

      if (Date.now() > decoded.exp) {
        return { authorized: false, error: 'Unauthorized: Admin session expired' };
      }

      if (decoded.role !== 'Admin' && decoded.role !== 'Super Admin') {
        return { authorized: false, error: 'Forbidden: Insufficient role permissions' };
      }

      return { authorized: true, session: decoded };
    } catch (e) {
      return { authorized: false, error: 'Unauthorized: Token validation exception' };
    }
  }
};
