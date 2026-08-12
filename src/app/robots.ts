import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/checkout', '/dashboard', '/api/orders'],
      },
    ],
    sitemap: 'https://www.nenoflex.in/sitemap.xml',
  };
}
