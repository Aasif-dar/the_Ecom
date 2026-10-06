"use client";

import { ErrorView } from "@/components/layout/error-views";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView error={error} reset={reset} withLogo />;
}
