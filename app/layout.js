import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/header";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { Toaster } from "@/components/ui/sonner";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400","500","600","700"] });

export const metadata = {
  title: "Nova Events",
  description: "Discover, host, and attend modern events.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.className} bg-linear-to-br from-slate-950 via-neutral-900 to-slate-900 text-white`}
        suppressHydrationWarning
      >
        
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
        <ClerkProvider 
          appearance={{
            theme: dark,
          }}>
          <ConvexClientProvider>
              <Header/>
              <main className="relative min-h-screen container mx-auto pt-40 md:pt-32">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">{children}</div>   
                <footer>
                  <div className="relative z-10 py-10 text-center text-sm text-white/50">
                    © 2026 Nova Events. All rights reserved.
                  </div>
                </footer>
                <Toaster richColors/>
              </main>
          </ConvexClientProvider>
        </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
