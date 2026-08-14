import './globals.css';
import type { Metadata } from 'next';
import { StoreProvider } from '@/context/StoreContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getInitialPageData } from '@/lib/server-data';
import { NenoFlexPageTransition } from '@/components/NenoFlexPageTransition';
import { ClientModals } from '@/components/ClientModals';

export const metadata: Metadata = {
  title: 'NenoFlex | Premium Imported Thrift & Streetwear Vault',
  description: 'Flex Your Style. Handpicked imported luxury thrift clothing from Nike, Essentials, TNF, Carhartt & Levi\'s at up to 90% off showroom MSRP. 100% Authenticated & Sanitized.',
  keywords: 'NenoFlex, thrift online India, imported streetwear, vintage Nike hoodie, Carhartt jacket, Levi 501, luxury thrift, street fashion',
  openGraph: {
    title: 'NenoFlex | Premium Imported Thrift & Streetwear',
    description: 'Flex Your Style. Handpicked luxury imported streetwear up to 90% off MSRP.',
    url: 'https://nenoflex.com',
    siteName: 'NenoFlex Official',
    type: 'website',
  },
};

// Next.js ISR: Revalidate catalog every 30 seconds for fresh data
export const revalidate = 30;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side: Fetch initial catalog data BEFORE rendering any HTML
  const { products, siteSettings } = await getInitialPageData();

  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body className="bg-[#0D0D0D] text-white min-h-screen flex flex-col font-sans antialiased" suppressHydrationWarning>
        <StoreProvider initialProducts={products} initialSettings={siteSettings}>
          <NenoFlexPageTransition />
          <ClientModals />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
