import './globals.css';
import type { Metadata } from 'next';
import { StoreProvider } from '@/context/StoreContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { QuickViewModal } from '@/components/QuickViewModal';
import { PromoModal } from '@/components/PromoModal';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body className="bg-[#0D0D0D] text-white min-h-screen flex flex-col font-sans antialiased" suppressHydrationWarning>
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <QuickViewModal />
          <PromoModal />
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
