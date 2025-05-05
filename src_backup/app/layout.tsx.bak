import type { Metadata } from "next";
import { Vazirmatn, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Footer } from "@/components/layout/Footer";
import { cookies } from "next/headers";

// Font setup
const vazirmatn = Vazirmatn({ 
  subsets: ["arabic"], 
  variable: "--font-vazirmatn"
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
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
  // Get locale from cookies on the server side
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale');
  const locale = localeCookie ? localeCookie.value : 'fa';
  
  const dir = locale === "fa" ? "rtl" : "ltr";
  const fontClass = locale === "fa" ? vazirmatn.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${fontClass} font-sans min-h-screen bg-background text-black dark:text-white antialiased`}>
        <LanguageProvider defaultLocale={locale}>
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