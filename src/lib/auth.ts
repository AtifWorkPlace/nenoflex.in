import { UserRole } from '@/types';

export interface AdminSession {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
}

const ADMIN_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SECRET_KEY || 'nenoflex_admin_secret_key_2026';

export const ServerAuth = {
  // Sign Admin Session Token
  generateAdminToken: (email: string, role: UserRole): string => {
    const payload: AdminSession = {
      userId: `admin-${Date.now()}`,
      email,
      role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    return btoa(JSON.stringify(payload));
  },

  // Verify Admin Session Token from Request
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

      const decoded: AdminSession = JSON.parse(atob(token));
      if (!decoded || !decoded.role) {
        return { authorized: false, error: 'Unauthorized: Invalid token payload' };
      }

      if (Date.now() > decoded.exp) {
        return { authorized: false, error: 'Unauthorized: Admin session expired' };
      }

      if (decoded.role !== 'Admin' && decoded.role !== 'Super Admin') {
        return { authorized: false, error: 'Forbidden: Insufficient privileges' };
      }

      return { authorized: true, session: decoded };
    } catch (e) {
      return { authorized: false, error: 'Unauthorized: Invalid token' };
    }
  }
};
