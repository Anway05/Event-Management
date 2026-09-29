import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/header";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nova Events - Discover & Host Unforgettable Experiences",
  description: "Find local and virtual events, connect with passionate communities, and create your own experiences with ease.",
  keywords: ["events", "tickets", "meetups", "workshops", "conferences", "nova events"],
  icons: {
    icon: "/logo-transparent.png",
    shortcut: "/logo-transparent.png",
    apple: "/logo-transparent.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.className} bg-background text-foreground antialiased selection:bg-purple-500/30 selection:text-purple-300 min-h-screen flex flex-col transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              theme: dark,
            }}
          >
            <ConvexClientProvider>
              <Header />
              <main className="relative flex-1 container mx-auto px-4 sm:px-6 pt-36 md:pt-28 pb-16">
                {/* Background Ambient Glowing Orbs */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 dark:bg-orange-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
                  <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl animate-pulse delay-700" />
                </div>

                <div className="relative z-10">{children}</div>

                <footer className="mt-20 border-t border-border/40 pt-10 pb-6 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto px-4">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                        NOVA EVENTS
                      </span>
                    </div>
                    <div>
                      © {new Date().getFullYear()} Nova Events Inc. Built with Next.js, Convex & TypeScript.
                    </div>
                  </div>
                </footer>
                <Toaster richColors position="top-right" />
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
