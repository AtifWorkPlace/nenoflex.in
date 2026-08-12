import { NextResponse } from 'next/server';
import { Product } from '@/types';
import { SupabaseServerService } from '@/lib/supabase-server';
import { ServerAuth } from '@/lib/auth';

function validateProductSchema(prod: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!prod || typeof prod !== 'object') return { valid: false, errors: ['Invalid product payload'] };
  if (!prod.name || typeof prod.name !== 'string' || prod.name.trim().length === 0) errors.push('Product name is required');
  if (typeof prod.price !== 'number' || isNaN(prod.price) || prod.price < 0) errors.push('Price must be a non-negative number');
  if (typeof prod.stockCount !== 'number' || isNaN(prod.stockCount) || prod.stockCount < 0) errors.push('Stock count must be a non-negative integer');
  if (!prod.brand || typeof prod.brand !== 'string') errors.push('Brand is required');
  if (!prod.category || typeof prod.category !== 'string') errors.push('Category is required');

  const checkImageString = (img: string, label: string) => {
    if (typeof img === 'string') {
      if (img.startsWith('data:image') || img.includes('base64')) {
        errors.push(`Product image must be uploaded to Supabase Storage first. Raw Base64 payloads are prohibited on ${label}.`);
      }
    }
  };

  if (prod.image) checkImageString(prod.image, 'main image');
  if (prod.imageHover) checkImageString(prod.imageHover, 'hover image');
  if (Array.isArray(prod.gallery)) {
    prod.gallery.forEach((img: any, idx: number) => checkImageString(img, `gallery[${idx}]`));
  }

  return { valid: errors.length === 0, errors };
}

export async function GET() {
  const startTime = Date.now();
  try {
    // Fetch products and settings concurrently
    const [products, siteSettings] = await Promise.all([
      SupabaseServerService.fetchProducts(),
      SupabaseServerService.fetchSettings(),
    ]);

    const fetchTimeMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        products,
        siteSettings,
        meta: { fetchTimeMs, productCount: products.length },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    const fetchTimeMs = Date.now() - startTime;
    const isDbError = error?.message?.includes('DATABASE_');
    return NextResponse.json(
      {
        success: false,
        message: isDbError ? 'Database temporarily unavailable' : 'Failed to fetch catalog',
        meta: { fetchTimeMs },
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}

export async function POST(req: Request) {
  // Enforce Server Admin Authorization for all catalog mutations
  const auth = ServerAuth.verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, message: auth.error || 'Unauthorized admin request' },
      { status: 401 }
    );
  }

  try {
    const payload = await req.json();
    const { action, product, products, siteSettings } = payload;

    if (action === 'save_settings' && siteSettings) {
      const saved = await SupabaseServerService.saveSettings(siteSettings);
      if (saved) {
        await SupabaseServerService.saveAuditLog({
          id: `audit-${Date.now()}`,
          action: 'UPDATE_SITE_SETTINGS',
          actorEmail: auth.session!.email,
          actorRole: auth.session!.role,
          targetResource: 'Site Settings',
          details: 'Updated global site settings and layout',
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({ success: true, message: 'Site settings saved to Supabase Cloud', siteSettings });
      }
      return NextResponse.json({ success: false, message: 'Failed to persist site settings' }, { status: 500 });
    }

    if (action === 'set_all' && Array.isArray(products)) {
      const saved = await SupabaseServerService.saveFullCatalog(products);
      if (saved) {
        return NextResponse.json({ success: true, message: 'Catalog snapshot updated', products });
      }
      return NextResponse.json({ success: false, message: 'Failed to update catalog snapshot' }, { status: 500 });
    }

    if (action === 'add' && product) {
      const val = validateProductSchema(product);
      if (!val.valid) {
        return NextResponse.json({ success: false, message: `Product validation failed: ${val.errors.join(', ')}` }, { status: 400 });
      }

      const saved = await SupabaseServerService.saveProduct(product);
      if (saved) {
        await SupabaseServerService.saveAuditLog({
          id: `audit-${Date.now()}`,
          action: 'ADD_PRODUCT',
          actorEmail: auth.session!.email,
          actorRole: auth.session!.role,
          targetResource: 'Products Catalog',
          details: `Added product: ${product.name} (SKU: ${product.sku})`,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({ success: true, message: 'Product created in Supabase Cloud', product });
      }
      return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 });
    }

    if (action === 'update' && product) {
      const val = validateProductSchema(product);
      if (!val.valid) {
        return NextResponse.json({ success: false, message: `Product validation failed: ${val.errors.join(', ')}` }, { status: 400 });
      }

      const saved = await SupabaseServerService.saveProduct(product);
      if (saved) {
        await SupabaseServerService.saveAuditLog({
          id: `audit-${Date.now()}`,
          action: 'UPDATE_PRODUCT',
          actorEmail: auth.session!.email,
          actorRole: auth.session!.role,
          targetResource: 'Products Catalog',
          details: `Updated product: ${product.name} (ID: ${product.id})`,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({ success: true, message: 'Product updated in Supabase Cloud', product });
      }
      return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 });
    }

    if (action === 'delete' && product?.id) {
      const deleted = await SupabaseServerService.deleteProduct(product.id);
      if (deleted) {
        await SupabaseServerService.saveAuditLog({
          id: `audit-${Date.now()}`,
          action: 'DELETE_PRODUCT',
          actorEmail: auth.session!.email,
          actorRole: auth.session!.role,
          targetResource: 'Products Catalog',
          details: `Deleted product ID: ${product.id}`,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({ success: true, message: 'Product deleted from Supabase Cloud' });
      }
      return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error processing product mutation' }, { status: 500 });
  }
}
