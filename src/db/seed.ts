import { INITIAL_PRODUCTS } from '@/data/products';
import { SecuritySuite } from '@/lib/security';

export interface SeedData {
  users: Array<{ id: string; email: string; role: 'Super Admin' | 'Admin' | 'Customer'; name: string }>;
  products: typeof INITIAL_PRODUCTS;
  siteSettings: {
    announcementBanner: string;
    heroTitle: string;
    heroSubtitle: string;
    footerTagline: string;
    footerPhone: string;
    footerInstagram: string;
    footerCopyright: string;
    collectionBoxOrder: string[];
  };
}

export const getSeedData = (): SeedData => {
  return {
    users: [
      {
        id: 'user-super-1',
        email: 'superadmin@nenoflex.com',
        role: 'Super Admin',
        name: 'NenoFlex Owner',
      },
      {
        id: 'user-admin-1',
        email: 'admin@nenoflex.com',
        role: 'Admin',
        name: 'Vault Store Manager',
      },
    ],
    products: INITIAL_PRODUCTS,
    siteSettings: {
      announcementBanner: 'from showrooms 89%-90% off!!',
      heroTitle: 'New Drops Jerseys 🔥 🚀',
      heroSubtitle: 'Handpicked Imported Vintage & Streetwear Vault',
      footerTagline: 'Flex Your Style. Premium Handpicked Imported Vault.',
      footerPhone: '+91 60001 49919',
      footerInstagram: '@flexnagaon',
      footerCopyright: '© 2026 NenoFlex Official. All rights reserved.',
      collectionBoxOrder: ['bento-banner', 'jerseys', 'jackets-fleeces', 'brands'],
    },
  };
};

export const runSeedScript = () => {
  const data = getSeedData();
  SecuritySuite.logAuditAction(
    'SEED_DATABASE',
    'superadmin@nenoflex.com',
    'Super Admin',
    'System Database',
    `Seeded ${data.products.length} products, site settings, and RBAC roles successfully.`
  );
  return data;
};
