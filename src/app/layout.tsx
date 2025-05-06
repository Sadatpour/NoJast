import type { Metadata } from "next";
import { Exo_2, Vazirmatn } from "next/font/google";
import "./globals.css";
import "./fonts.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Footer } from "@/components/layout/Footer";
import { cookies } from "next/headers";
import { Preloader } from "@/components/Preloader";
import '../styles/wave.css';

// Font setup
const vazirmatn = Vazirmatn({ 
  subsets: ["arabic"], 
  variable: "--font-vazirmatn"
});

const exo2 = Exo_2({ 
  subsets: ["latin"], 
  variable: "--font-exo2"
});

export const metadata: Metadata = {
  title: "Nojast | نوجَست - کشف محصولات جدید ایرانی",
  description: "پلتفرمی برای کشف، رای دادن و بحث در مورد جدیدترین محصولات و استارتاپ‌های ایرانی.",
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
      <body className="font-kalameh min-h-screen bg-background text-black dark:text-white antialiased">
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