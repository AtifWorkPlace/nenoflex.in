import { NextResponse } from 'next/server';
import { ServerAuth } from '@/lib/auth';
import { SupabaseServerService } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const pass = (password || '').trim();

    let role: 'Super Admin' | 'Admin' | null = null;

    if (cleanEmail === 'superadmin@nenoflex.com' && pass === 'superadmin123') {
      role = 'Super Admin';
    } else if (cleanEmail === 'admin@nenoflex.com' && pass === 'admin123') {
      role = 'Admin';
    }

    if (!role) {
      // Log failed admin login attempt
      await SupabaseServerService.saveAuditLog({
        id: `audit-${Date.now()}`,
        action: 'FAILED_ADMIN_LOGIN',
        actorEmail: cleanEmail || 'unknown',
        actorRole: 'Customer',
        targetResource: 'Admin Auth Gateway',
        details: 'Failed admin login attempt with incorrect credentials',
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { success: false, message: 'Invalid admin email or password' },
        { status: 401 }
      );
    }

    const token = ServerAuth.generateAdminToken(cleanEmail, role);

    // Log successful admin login
    await SupabaseServerService.saveAuditLog({
      id: `audit-${Date.now()}`,
      action: 'ADMIN_LOGIN',
      actorEmail: cleanEmail,
      actorRole: role,
      targetResource: 'Admin Dashboard',
      details: `${role} logged in successfully`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      timestamp: new Date().toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      token,
      userRole: role,
      message: `${role} authenticated successfully`,
    });

    response.cookies.set('nenoflex_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Admin authentication failed' },
      { status: 500 }
    );
  }
}
