import { Product } from '@/types';

export const BRANDS_LIST = [
  { name: 'Nike', logo: '✔️', origin: 'USA' },
  { name: 'Adidas', logo: '👟', origin: 'Germany' },
  { name: 'The North Face', logo: '🏔️', origin: 'USA' },
  { name: 'Stüssy', logo: '🎨', origin: 'USA' },
  { name: 'Puma', logo: '🐆', origin: 'Germany' },
  { name: 'Carhartt', logo: '🔨', origin: 'USA' },
  { name: 'Champion', logo: '🏆', origin: 'USA' },
  { name: 'Supreme', logo: '🔴', origin: 'USA' },
];

export const COLLECTIONS_LIST = [
  { name: 'Vintage Collection', desc: 'Handpicked Tokyo & US Thrifting', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', itemCount: 12, tag: 'CURATED VAULT' },
  { name: 'Streetwear Collection', desc: 'Imported Heavyweight Fleece & Tees', image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80', itemCount: 8, tag: 'HIGH DEMAND' },
  { name: 'Fleeces & Outerwear', desc: 'Nike, TNF & Premium Outerwear', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', itemCount: 15, tag: 'LIMITED EDITIONS' },
];

// Clean Empty Products Store (Ready for Admin Uploads)
export const INITIAL_PRODUCTS: Product[] = [];
