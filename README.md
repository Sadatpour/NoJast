# نوجست (NoJast)

پلتفرمی برای کشف، رای دادن و بحث در مورد جدیدترین محصولات و استارتاپ‌های ایرانی.

## ویژگی‌ها

- 🔍 جستجوی پیشرفته محصولات
- 👥 سیستم کاربری و احراز هویت
- 📱 رابط کاربری واکنش‌گرا
- 🌙 پشتیبانی از تم تاریک/روشن
- 🔒 امنیت بالا با Supabase
- 📊 داشبورد مدیریتی
- 🔔 سیستم اعلان‌ها

## پیش‌نیازها

- Node.js 18.x یا بالاتر
- npm یا yarn
- حساب Supabase

## نصب و راه‌اندازی

1. کلون کردن مخزن:
```bash
git clone https://github.com/yourusername/nojast.git
cd nojast
```

2. نصب وابستگی‌ها:
```bash
npm install
# یا
yarn install
```

3. تنظیم متغیرهای محیطی:
```bash
cp .env.example .env.local
```
سپس فایل `.env.local` را با مقادیر مناسب ویرایش کنید.

4. اجرای پروژه در محیط توسعه:
```bash
npm run dev
# یا
yarn dev
```

## ساخت و استقرار

برای ساخت نسخه تولید:
```bash
npm run build
# یا
yarn build
```

برای اجرای نسخه تولید:
```bash
npm run start
# یا
yarn start
```

## تست‌ها

### تست‌های واحد
```bash
npm run test
# یا
yarn test
```

### تست‌های یکپارچه‌سازی
```bash
npm run test:integration
# یا
yarn test:integration
```

### تست‌های end-to-end
```bash
npm run test:e2e
# یا
yarn test:e2e
```

## ساختار پروژه

```
src/
├── app/                 # صفحات و مسیرهای Next.js
├── components/          # کامپوننت‌های React
├── lib/                 # توابع کمکی و تنظیمات
├── middleware/          # میدلورهای Next.js
├── store/              # مدیریت state با Zustand
├── styles/             # استایل‌های گلوبال
└── types/              # تعاریف TypeScript
```

## تکنولوژی‌ها

- [Next.js](https://nextjs.org/) - فریم‌ورک React
- [TypeScript](https://www.typescriptlang.org/) - زبان برنامه‌نویسی
- [Tailwind CSS](https://tailwindcss.com/) - فریم‌ورک CSS
- [Supabase](https://supabase.com/) - بک‌اند و احراز هویت
- [Zustand](https://github.com/pmndrs/zustand) - مدیریت state
- [Playwright](https://playwright.dev/) - تست end-to-end
- [Jest](https://jestjs.io/) - تست‌های واحد و یکپارچه‌سازی

## مشارکت

1. Fork پروژه
2. ایجاد شاخه جدید (`git checkout -b feature/amazing-feature`)
3. Commit تغییرات (`git commit -m 'Add some amazing feature'`)
4. Push به شاخه (`git push origin feature/amazing-feature`)
5. ایجاد Pull Request

## مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر به فایل [LICENSE](LICENSE) مراجعه کنید.

## تماس

ساخته شده با ❤️ توسط مجتبا سادات‌پور

- وب‌سایت: [sadatpour.com](https://sadatpour.com)
- ایمیل: [sadatpour.web@gmail.com](mailto:sadatpour.web@gmail.com)
- اینستاگرام: [instagram.com/sadatpour](https://instagram.com/sadatpour)
- گیت‌هاب: [github.com/Sadatpour](https://github.com/Sadatpour)
- تلگرام: [t.me/Sadatpour](https://t.me/Sadatpour) 