"use client";

import Link from "next/link";
import { RefreshCw, SearchX, WifiOff } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/ui/logo";

export function NotFoundView({ withLogo = false }: { withLogo?: boolean }) {
  return (
    <div className="container-x flex min-h-[60dvh] flex-col">
      {withLogo && (
        <div className="py-8">
          <Logo />
        </div>
      )}
      <div className="m-auto">
        <p className="eyebrow mb-2 text-center text-clay">Error 404</p>
        <EmptyState
          icon={SearchX}
          title="This page has wandered off"
          body="The link may be broken, or the page may have moved. Let's get you back to something beautiful."
          actions={
            <>
              <Link href="/" className={buttonVariants({ size: "lg" })}>
                Back to home
              </Link>
              <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Shop the collection
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}

export function ErrorView({ error, reset, withLogo = false }: { error: Error & { digest?: string }; reset: () => void; withLogo?: boolean }) {
  const network = /fetch|network|offline|timeout/i.test(error.message);
  return (
    <div className="container-x flex min-h-[60dvh] flex-col">
      {withLogo && (
        <div className="py-8">
          <Logo />
        </div>
      )}
      <div className="m-auto">
        <EmptyState
          icon={network ? WifiOff : RefreshCw}
          title={network ? "We can't reach the server" : "Something went wrong"}
          body={
            network
              ? "Please check your internet connection and try again. Your bag and wishlist are safe."
              : "An unexpected error got in the way. It's not you. Try again, or head back to the home page."
          }
          actions={
            <>
              <Button size="lg" onClick={reset}>
                <RefreshCw className="size-4" /> Try again
              </Button>
              <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Back to home
              </Link>
            </>
          }
        />
        {error.digest && <p className="-mt-8 pb-10 text-center font-mono text-[0.7rem] text-stone">Reference: {error.digest}</p>}
      </div>
    </div>
  );
}
