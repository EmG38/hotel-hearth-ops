import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { HotelProvider } from "@/lib/hotel-store";
import { I18nProvider } from "@/lib/i18n";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display text-on-surface">404</h1>
        <h2 className="text-title-lg mt-4 text-on-surface">Screen not found</h2>
        <p className="text-body mt-2 text-on-surface-variant">
          This part of the console doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="text-label inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-on-primary transition-colors hover:bg-primary/90"
          >
            Back to Property Board
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-md text-center">
        <h1 className="text-title-lg text-on-surface">This screen didn't load</h1>
        <p className="text-body mt-2 text-on-surface-variant">
          Something went wrong. Try again or go back to the Property Board.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="text-label inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-on-primary hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="text-label inline-flex items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-on-surface hover:bg-surface-container"
          >
            Property Board
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Golden Sands Hotel — Operations Console" },
      {
        name: "description",
        content: "Internal housekeeping and front-desk operations console for a 100-room hotel.",
      },
      { property: "og:title", content: "Golden Sands Hotel — Operations Console" },
      {
        property: "og:description",
        content: "Internal housekeeping and front-desk operations console for a 100-room hotel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <HotelProvider>
        <I18nProvider>
          <AppShell>
          {/* Required: nested routes render here. */}
          <Outlet />
          </AppShell>
          <Toaster position="bottom-right" richColors closeButton expand={false} />
        </I18nProvider>
      </HotelProvider>
    </QueryClientProvider>
  );
}
