import { Product } from '@/types';

// Helper function to normalize raw database records into standard Product format
export function normalizeProductFromDb(item: any): Product {
  if (!item) return {} as Product;
  return {
    id: String(item.id || `nf-${Date.now()}`),
    sku: String(item.sku || 'SKU-NF-100'),
    barcode: String(item.barcode || '8901234567890'),
    name: String(item.name || 'Vault Product'),
    brand: (item.brand as Product['brand']) || 'Nike',
    category: (item.category as Product['category']) || 'Sweatshirts',
    collection: Array.isArray(item.collection) ? item.collection : ['Vintage Collection'],
    price: Number(item.price || 0),
    showroomPrice: Number(item.showroomPrice ?? item.showroom_price ?? (item.price ? item.price * 10 : 8999)),
    discountPercent: Number(item.discountPercent ?? item.discount_percent ?? 90),
    conditionScore: Number(item.conditionScore ?? item.condition_score ?? 9.8),
    conditionGrade: (item.conditionGrade || item.condition_grade || 'Mint (9.8-10)') as Product['conditionGrade'],
    sizes: Array.isArray(item.sizes) ? item.sizes : ['M', 'L'],
    colors: Array.isArray(item.colors) ? item.colors : ['Black'],
    material: String(item.material || '100% Cotton'),
    weight: String(item.weight || '500g'),
    fit: (item.fit as Product['fit']) || 'Boxy Fit',
    description: String(item.description || ''),
    authenticitySeal: Boolean(item.authenticitySeal ?? item.authenticity_seal ?? true),
    sanitized: Boolean(item.sanitized ?? true),
    image: String(item.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'),
    imageHover: String(item.imageHover ?? item.image_hover ?? item.image),
    gallery: Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : [item.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
    isNewArrival: Boolean(item.isNewArrival ?? item.is_new_arrival ?? true),
    isTrending: Boolean(item.isTrending ?? item.is_trending ?? true),
    isBestSeller: Boolean(item.isBestSeller ?? item.is_best_seller ?? false),
    isLimited: Boolean(item.isLimited ?? item.is_limited ?? true),
    stockCount: Number(item.stockCount ?? item.stock_count ?? 1),
    rating: Number(item.rating || 5.0),
    reviewsCount: Number(item.reviewsCount ?? item.reviews_count ?? 12),
    tags: Array.isArray(item.tags) ? item.tags : ['thrift'],
  };
}
