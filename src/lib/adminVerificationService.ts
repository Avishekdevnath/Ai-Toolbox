import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';

export interface AdminSession {
  id: string;
  email?: string;
  role: 'admin' | 'user' | string;
  isSuperAdmin: boolean;
}

export class AdminVerificationService {
  static async getAdminSession(request: NextRequest): Promise<{ success: boolean; session?: AdminSession }> {
    try {
      const token = request.cookies.get('user_session')?.value;
      const claims = token ? verifyAccessToken(token) : null;
      if (!claims?.id) return { success: false };

      const session: AdminSession = {
        id: claims.id,
        email: claims.email,
        role: claims.role || 'user',
        isSuperAdmin: claims.role === 'admin' && claims.isSuperAdmin === true,
      };

      return { success: session.role === 'admin', session };
    } catch (error) {
      return { success: false };
    }
  }

  static canManageAdmins(session: AdminSession): boolean {
    return session.role === 'admin';
  }

  static async logActivity(userId: string, action: string, details?: Record<string, any>): Promise<void> {
    try {
      console.log('[AdminActivity]', { userId, action, details });
    } catch {}
  }
}


