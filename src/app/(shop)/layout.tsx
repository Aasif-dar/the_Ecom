import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { QuickView } from "@/components/product/quick-view";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] bg-ink px-4 py-3 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-paper focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu />
      <QuickView />
    </>
  );
}
