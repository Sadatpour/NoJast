/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://nojast.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/admin/*', '/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/*', '/api/*'],
      },
    ],
  },
} 