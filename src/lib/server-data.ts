import { Product, SiteSettings } from '@/types';
import { SupabaseServerService } from '@/lib/supabase-server';

export interface InitialPageData {
  products: Product[];
  siteSettings: SiteSettings | null;
  fetchTimeMs: number;
}

/**
 * Server-side data fetcher for initial page hydration.
 * Fetches products and site settings concurrently from Supabase.
 * Used by the root layout Server Component to pass initial data
 * into the client StoreProvider, eliminating the empty-catalog flash.
 */
export async function getInitialPageData(): Promise<InitialPageData> {
  const startTime = Date.now();

  try {
    // Fetch products and settings concurrently
    const [products, siteSettings] = await Promise.all([
      SupabaseServerService.fetchProducts(),
      SupabaseServerService.fetchSettings(),
    ]);

    const fetchTimeMs = Date.now() - startTime;

    console.log(`[Server Data] Fetched ${products.length} products + settings in ${fetchTimeMs}ms`);

    return {
      products,
      siteSettings,
      fetchTimeMs,
    };
  } catch (error) {
    const fetchTimeMs = Date.now() - startTime;
    console.error(`[Server Data Error] Failed to fetch initial data in ${fetchTimeMs}ms:`, error);

    return {
      products: [],
      siteSettings: null,
      fetchTimeMs,
    };
  }
}
