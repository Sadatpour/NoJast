'use client';

// Remove server-only imports
// import { cookies } from 'next/headers'

export type Locale = 'fa' | 'en'

export function getLocale(): Locale {
  // Client-side implementation
  if (typeof document !== 'undefined') {
    // Browser environment
    const localeCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1];
    
    if (localeCookie) {
      return localeCookie as Locale;
    }
  }
  
  // Default to Persian
  return 'fa'
}

export const translations = {
  fa: {
    // Navigation
    home: 'صفحه اصلی',
    dashboard: 'داشبورد',
    login: 'ورود',
    signup: 'ثبت نام',
    submit: 'ثبت محصول',
    search: 'جستجو...',
    // Categories
    all: 'همه',
    ai: 'هوش مصنوعی',
    tools: 'ابزارها',
    games: 'بازی‌ها',
    design: 'طراحی',
    development: 'توسعه',
    // Sorting
    newest: 'جدیدترین',
    popular: 'محبوب‌ترین',
    // Product
    upvote: 'رأی',
    upvoted: 'رأی داده شده',
    comments: 'نظرات',
    visit: 'مشاهده',
    // Auth
    emailLabel: 'ایمیل',
    passwordLabel: 'رمز عبور',
    fullNameLabel: 'نام و نام خانوادگی',
    usernameLabel: 'نام کاربری',
    continueWithGoogle: 'ادامه با گوگل',
    forgotPassword: 'فراموشی رمز عبور',
    dontHaveAccount: 'حساب کاربری ندارید؟',
    alreadyHaveAccount: 'حساب کاربری دارید؟',
    // User
    profile: 'پروفایل',
    settings: 'تنظیمات',
    logout: 'خروج',
    // Forms
    submitProduct: 'ثبت محصول جدید',
    productTitle: 'عنوان محصول',
    productTitleEn: 'عنوان محصول (انگلیسی)',
    productDescription: 'توضیحات محصول',
    productDescriptionEn: 'توضیحات محصول (انگلیسی)',
    productUrl: 'آدرس محصول',
    productCategory: 'دسته‌بندی',
    productTags: 'برچسب‌ها',
    productThumbnail: 'تصویر محصول',
    // Comments
    addComment: 'افزودن نظر',
    yourComment: 'نظر شما...',
    // Footer
    footerTagline: 'نو (new) + جَست (search)',
    footerLove: 'با ❤️ در ایران توسط مجتبی سادات پور',
  },
  en: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    login: 'Login',
    signup: 'Sign Up',
    submit: 'Submit Product',
    search: 'Search...',
    // Categories
    all: 'All',
    ai: 'AI',
    tools: 'Tools',
    games: 'Games',
    design: 'Design',
    development: 'Development',
    // Sorting
    newest: 'Newest',
    popular: 'Popular',
    // Product
    upvote: 'Upvote',
    upvoted: 'Upvoted',
    comments: 'Comments',
    visit: 'Visit',
    // Auth
    emailLabel: 'Email',
    passwordLabel: 'Password',
    fullNameLabel: 'Full Name',
    usernameLabel: 'Username',
    continueWithGoogle: 'Continue with Google',
    forgotPassword: 'Forgot Password',
    dontHaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    // User
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    // Forms
    submitProduct: 'Submit New Product',
    productTitle: 'Product Title',
    productTitleEn: 'Product Title (English)',
    productDescription: 'Product Description',
    productDescriptionEn: 'Product Description (English)',
    productUrl: 'Product URL',
    productCategory: 'Category',
    productTags: 'Tags',
    productThumbnail: 'Thumbnail',
    // Comments
    addComment: 'Add Comment',
    yourComment: 'Your comment...',
    // Footer
    footerTagline: 'New + Search',
    footerLove: 'Made with ❤️ in Iran by Mojtaba Sadatpour',
  }
}

export const banners = {
  home: [
    { 
      imageUrl: '/banners/banner1.jpg',
      linkUrl: 'https://example.com/sponsor1',
      altText: 'Sponsor Banner 1'
    },
    {
      imageUrl: '/banners/banner2.jpg',
      linkUrl: 'https://example.com/sponsor2',
      altText: 'Sponsor Banner 2'
    }
  ],
  product: [
    {
      imageUrl: '/banners/banner3.jpg',
      linkUrl: 'https://example.com/sponsor3',
      altText: 'Sponsor Banner 3'
    }
  ]
} 