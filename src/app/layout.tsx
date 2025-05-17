import '@/lib/suppressConsoleWarnings';
import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/Preloader";
import { LanguageProvider } from "@/components/LanguageProvider";
import '../styles/wave.css';

export const metadata: Metadata = {
  title: "نوجست",
  description: "پلتفرمی برای کشف، رای دادن و بحث در مورد جدیدترین محصولات و استارتاپ‌های ایرانی",
  authors: [{ name: "Mojtaba Sadatpour", url: "https://instagram.com/sadatpour" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d786b" />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <LanguageProvider>
          <Preloader />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Footer />
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
} 