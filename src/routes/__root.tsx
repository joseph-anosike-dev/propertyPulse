import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="primary-button">Go home <ArrowUpRight size={16} /></Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="primary-button"
          >
            Try again
          </button>
          <Link to="/" className="secondary-button">
            Go home
          </Link>
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
      { title: "Olori Properties | Distinctive Nigerian homes" },
      { name: "description", content: "Find distinctive homes and investment property across Nigeria, with a viewing plan tailored to you." },
      { name: "author", content: "Olori Properties" },
      { property: "og:title", content: "Olori Properties | Distinctive Nigerian homes" },
      { property: "og:description", content: "Find distinctive homes and investment property across Nigeria, with a viewing plan tailored to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" />
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-frame">
        <header className="site-header">
          <div className="shell flex items-center justify-between">
            <Link to="/" className="brand-mark" onClick={() => setMenuOpen(false)}>
              <span className="brand-mark-symbol">O</span>
              <span><strong>olori</strong><small>properties</small></span>
            </Link>
            <button type="button" className="icon-button md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} title={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
            <nav className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-5 border-b border-line bg-paper px-6 py-6 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
              <Link to="/" className="nav-link" activeProps={{ className: "nav-link nav-link-active" }} onClick={() => setMenuOpen(false)}>Collection</Link>
              <a href="/#approach" className="nav-link" onClick={() => setMenuOpen(false)}>Our approach</a>
              <a href="/#contact" className="nav-link" onClick={() => setMenuOpen(false)}>Talk to an adviser</a>
              <Link to="/" className="header-cta" onClick={() => setMenuOpen(false)}>Find a home <ArrowUpRight size={15} /></Link>
            </nav>
          </div>
        </header>
        <main><Outlet /></main>
        <footer id="contact" className="site-footer">
          <div className="shell grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div><div className="brand-mark brand-mark-footer"><span className="brand-mark-symbol">O</span><span><strong>olori</strong><small>properties</small></span></div><p className="mt-5 max-w-sm text-sm leading-6 text-slate">A considered way to find your next address across Nigeria.</p></div>
            <div className="text-sm text-slate md:text-right"><p>Private viewings · Lagos & beyond</p><p className="mt-2">hello@olori.properties</p></div>
          </div>
          <div className="shell mt-10 border-t border-line pt-5 text-xs text-slate">© {new Date().getFullYear()} Olori Properties. All rights reserved.</div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
