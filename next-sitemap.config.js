/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://zingmeal.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin', '/api/*', '/404', '/500'],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://zingmeal.com'}/sitemap-0.xml`,
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api' ,"/favorites", "/about", "/settings"],
      },
    ],
  },
};
