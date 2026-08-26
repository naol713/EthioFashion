export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'EthioFashion',
  description: 'Premium Ethiopian Fashion & Apparel E-Commerce Store',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  currency: {
    code: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'ETB',
    symbol: 'ETB',
    defaultDeliveryFee: Number(process.env.NEXT_PUBLIC_DEFAULT_DELIVERY_FEE) || 50,
  },
  mainNav: [
    { title: 'New Arrivals', href: '/products?sort=newest' },
    { title: 'Men', href: '/products?gender=MALE' },
    { title: 'Women', href: '/products?gender=FEMALE' },
    { title: 'Unisex', href: '/products?gender=UNISEX' },
    { title: 'Categories', href: '/categories' },
    { title: 'Brands', href: '/brands' },
  ],
  footerNav: {
    shop: [
      { title: 'Men\'s Clothing', href: '/products?gender=MALE' },
      { title: 'Women\'s Clothing', href: '/products?gender=FEMALE' },
      { title: 'Shoes & Accessories', href: '/categories' },
      { title: 'Featured Items', href: '/products?featured=true' },
    ],
    support: [
      { title: 'Help Center', href: '/faq' },
      { title: 'Delivery Info', href: '/shipping' },
      { title: 'Returns & Exchanges', href: '/returns' },
      { title: 'Contact Us', href: '/contact' },
    ],
    company: [
      { title: 'About Us', href: '/about' },
      { title: 'Terms of Service', href: '/terms' },
      { title: 'Privacy Policy', href: '/privacy' },
    ],
  },
  paymentMethods: [
    { id: 'TELEBIRR', name: 'Telebirr' },
    { id: 'CHAPA', name: 'Chapa (Cards & Mobile)' },
    { id: 'CBE_BANK', name: 'Commercial Bank of Ethiopia' },
    { id: 'ABAY_BANK', name: 'Abay Bank' },
  ],
};

export type SiteConfig = typeof siteConfig;
