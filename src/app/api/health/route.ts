import { NextResponse } from 'next/server';
import { SupabaseServerService } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'unknown';
  let productCount = 0;

  try {
    const products = await SupabaseServerService.fetchProducts();
    productCount = products.length;
    dbStatus = productCount > 0 ? 'ok' : 'connected_empty';
  } catch (error) {
    dbStatus = 'error';
  }

  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      app: 'ok',
      database: dbStatus,
      productCount,
      storage: 'ok',
      runtime: 'Next.js 15 App Router',
      responseTimeMs,
      timestamp: new Date().toISOString(),
    },
    {
      status: dbStatus === 'ok' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
