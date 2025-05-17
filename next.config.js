const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  images: {
    domains: ['xfckkfrfkwiymksbqnjn.supabase.co'],
  },
  // سایر تنظیمات Next.js را اینجا اضافه کنید
}); 