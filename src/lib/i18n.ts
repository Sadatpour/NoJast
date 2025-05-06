'use client';

// Remove server-only imports
// import { cookies } from 'next/headers'

export type Locale = 'fa'

export function getLocale(): Locale {
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
    productDescription: 'توضیحات محصول',
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
