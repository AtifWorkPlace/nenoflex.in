export type UserRole = 'Customer' | 'Admin' | 'Super Admin';

export type ProductCondition = 'Mint (9.8-10)' | 'Like New (9.4-9.7)' | 'Excellent (9.0-9.3)' | 'Vintage Choice (8.5-8.9)';

export type MainCategory =
  | 'New Arrivals'
  | 'Trending'
  | 'Best Sellers'
  | 'Oversized T-Shirts'
  | 'Graphic Tees'
  | 'Polo Shirts'
  | 'Shirts'
  | 'Hoodies'
  | 'Sweatshirts'
  | 'Jackets'
  | 'Windbreakers'
  | 'Varsity Jackets'
  | 'Denim Jackets'
  | 'Cargo Pants'
  | 'Jeans'
  | 'Joggers'
  | 'Shorts'
  | 'Track Pants'
  | 'Co-ord Sets'
  | 'Jerseys'
  | 'Knitwear'
  | 'Caps'
  | 'Accessories'
  | 'Clearance'
  | string;

export type CollectionName =
  | 'Vintage Collection'
  | 'Y2K Collection'
  | 'Streetwear Collection'
  | 'Minimal Collection'
  | 'Winter Collection'
  | 'Summer Collection'
  | 'Imported Collection'
  | 'Limited Edition'
  | 'Luxury Brands'
  | string;

export type BrandName =
  | 'Nike'
  | 'Adidas'
  | 'Puma'
  | 'Zara'
  | 'H&M'
  | 'Uniqlo'
  | 'Tommy Hilfiger'
  | 'Levi\'s'
  | 'Champion'
  | 'The North Face'
  | 'Carhartt'
  | 'Dickies'
  | 'Essentials'
  | 'Fear of God'
  | 'FILA'
  | 'Lotto'
  | 'Ask Enquired'
  | string;

export interface Product {
  id: string;
  sku: string; // e.g. SKU-TNF-700-BLU
  barcode: string; // e.g. 8901234567890
  name: string;
  brand: BrandName;
  category: MainCategory;
  collection: CollectionName[];
  price: number; // NenoFlex Price in INR
  showroomPrice: number; // Original Showroom MSRP
  discountPercent: number; // e.g. 89% or 90%
  conditionScore: number; // e.g. 9.7 or 9.8 out of 10
  conditionGrade: ProductCondition;
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL' | 'Oversized' | string)[];
  colors: string[];
  material: string;
  weight?: string; // e.g. 650g
  fit: 'Oversized' | 'Regular' | 'Relaxed' | 'Boxy Fit' | 'Slim';
  description: string;
  authenticitySeal: boolean;
  sanitized: boolean;
  image: string; // Primary image
  imageHover?: string; // 2nd image for hover preview
  gallery: string[];
  isNewArrival: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isLimited: boolean;
  stockCount: number; // 0 means SOLD OUT
  rating: number;
  reviewsCount: number;
  tags: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: 'Pending Payment' | 'Placed' | 'Authenticated' | 'Quality Checked' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingCode?: string | null;
  courier?: string | null;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'QR Pre-Paid' | 'UPI' | 'Razorpay' | 'Stripe' | 'Card' | 'COD' | string;
  paymentId?: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  discountAmount?: number;
  minOrder?: number;
}

export interface FooterQuickLink {
  label: string;
  href: string;
}

export interface SiteSettings {
  announcementBanner: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroSecondaryCtaText: string;
  heroTickerText: string;

  // 3 Bento Poster Banners (New Arrivals, Jackets, Jerseys)
  heroPosterBg1?: string;
  heroPosterTag1?: string;
  heroPosterTitle1?: string;
  heroPosterSubtitle1?: string;
  heroPosterLink1?: string;

  heroPosterImage2?: string;
  heroPosterTitle2?: string;
  heroPosterLink2?: string;

  heroPosterImage3?: string;
  heroPosterTitle3?: string;
  heroPosterLink3?: string;

  footerTagline: string;
  footerPhone: string;
  footerWhatsappUrl: string;
  footerInstagram: string;
  footerInstagramUrl: string;
  footerCopyright: string;
  footerQuickLinks?: FooterQuickLink[];
  collectionBoxOrder: string[];
  notificationSound: 'cash-register' | 'luxury-bell' | 'ping' | 'alert';
  customCategories: string[];
  customBrands: Array<{ name: string; logo: string; origin: string }>;
  customFontFamily: string;
  customFontDataUrl?: string;
  promoModal: {
    enabled: boolean;
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonLink: string;
  };
}

export interface FilterState {
  searchQuery: string;
  category: string;
  collection: string;
  brands: BrandName[];
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  fits: string[];
  minCondition: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'newest' | 'discount' | 'condition';
}
