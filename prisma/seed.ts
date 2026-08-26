import { PrismaClient, UserRole, ProductGender, ProductStatus, SizeType, InventoryTransactionType, CouponDiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing catalog data in reverse dependency order
  await prisma.inventory_transactions.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product_images.deleteMany();
  await prisma.product_variants.deleteMany();
  await prisma.products.deleteMany();
  await prisma.brands.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.sizes.deleteMany();
  await prisma.colors.deleteMany();
  await prisma.coupons.deleteMany();
  await prisma.store_settings.deleteMany();

  // 1. Create Colors
  console.log('🎨 Seeding colors...');
  const colorsData = [
    { name: 'Black', slug: 'black', hex_code: '#000000' },
    { name: 'White', slug: 'white', hex_code: '#FFFFFF' },
    { name: 'Navy Blue', slug: 'navy-blue', hex_code: '#000080' },
    { name: 'Emerald Green', slug: 'emerald-green', hex_code: '#50C878' },
    { name: 'Burgundy', slug: 'burgundy', hex_code: '#800020' },
    { name: 'Beige', slug: 'beige', hex_code: '#F5F5DC' },
    { name: 'Ethiopian Gold', slug: 'ethiopian-gold', hex_code: '#D4AF37' },
  ];

  const colors: Record<string, any> = {};
  for (const c of colorsData) {
    const created = await prisma.colors.create({ data: c });
    colors[c.slug] = created;
  }

  // 2. Create Sizes (Clothing & Shoe)
  console.log('📏 Seeding sizes...');
  const clothingSizesData = [
    { name: 'XS', type: SizeType.CLOTHING, sort_order: 1 },
    { name: 'S', type: SizeType.CLOTHING, sort_order: 2 },
    { name: 'M', type: SizeType.CLOTHING, sort_order: 3 },
    { name: 'L', type: SizeType.CLOTHING, sort_order: 4 },
    { name: 'XL', type: SizeType.CLOTHING, sort_order: 5 },
    { name: 'XXL', type: SizeType.CLOTHING, sort_order: 6 },
  ];

  const shoeSizesData = [
    { name: '39', type: SizeType.SHOE, sort_order: 1 },
    { name: '40', type: SizeType.SHOE, sort_order: 2 },
    { name: '41', type: SizeType.SHOE, sort_order: 3 },
    { name: '42', type: SizeType.SHOE, sort_order: 4 },
    { name: '43', type: SizeType.SHOE, sort_order: 5 },
    { name: '44', type: SizeType.SHOE, sort_order: 6 },
  ];

  const sizes: Record<string, any> = {};
  for (const s of clothingSizesData) {
    const created = await prisma.sizes.create({ data: s });
    sizes[s.name] = created;
  }
  for (const s of shoeSizesData) {
    const created = await prisma.sizes.create({ data: s });
    sizes[s.name] = created;
  }

  // 3. Create Brands
  console.log('🏷️ Seeding brands...');
  const brandsData = [
    { name: 'Habesha Threads', slug: 'habesha-threads', description: 'Traditional & modern Ethiopian woven attire' },
    { name: 'Abyssinia Kicks', slug: 'abyssinia-kicks', description: 'Premium handcrafted footwear' },
    { name: 'Addis Couture', slug: 'addis-couture', description: 'Contemporary luxury African fashion' },
    { name: 'Sheba Active', slug: 'sheba-active', description: 'High-performance sportswear & athleisure' },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandsData) {
    const created = await prisma.brands.create({ data: b });
    brands[b.slug] = created;
  }

  // 4. Create Hierarchical Categories
  console.log('📁 Seeding categories...');
  const menCategory = await prisma.categories.create({
    data: {
      name: 'Men',
      slug: 'men',
      description: 'Men\'s fashion collection',
      sort_order: 1,
    },
  });

  const womenCategory = await prisma.categories.create({
    data: {
      name: 'Women',
      slug: 'women',
      description: 'Women\'s fashion collection',
      sort_order: 2,
    },
  });

  const shoesCategory = await prisma.categories.create({
    data: {
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear for all occasions',
      sort_order: 3,
    },
  });

  // Subcategories
  const menClothing = await prisma.categories.create({
    data: {
      name: 'Men\'s Clothing',
      slug: 'mens-clothing',
      parent_id: menCategory.id,
      description: 'Shirts, jackets, suits, and trousers',
      sort_order: 1,
    },
  });

  const womenClothing = await prisma.categories.create({
    data: {
      name: 'Women\'s Dresses & Tops',
      slug: 'womens-dresses-tops',
      parent_id: womenCategory.id,
      description: 'Traditional Habesha kemis, casual dresses & tops',
      sort_order: 1,
    },
  });

  const menShoes = await prisma.categories.create({
    data: {
      name: 'Men\'s Sneakers & Boots',
      slug: 'mens-shoes',
      parent_id: shoesCategory.id,
      description: 'Leather boots, casual sneakers, and loafers',
      sort_order: 1,
    },
  });

  // 5. Create Products & Variants
  console.log('👗 Seeding products, variants, and inventory...');

  // Product 1: Handwoven Habesha Dress
  const dressProduct = await prisma.products.create({
    data: {
      category_id: womenClothing.id,
      brand_id: brands['habesha-threads'].id,
      name: 'Royal Habesha Kemis',
      slug: 'royal-habesha-kemis',
      description: 'Authentic handwoven Ethiopian dress woven from pure organic cotton with intricate gold embroidery. Perfect for holidays, weddings, and formal occasions.',
      short_description: 'Pure cotton handwoven Ethiopian dress with gold border embroidery.',
      material: '100% Ethiopian Cotton',
      gender: ProductGender.FEMALE,
      status: ProductStatus.ACTIVE,
      featured: true,
    },
  });

  // Images for Dress
  await prisma.product_images.createMany({
    data: [
      {
        product_id: dressProduct.id,
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Royal Habesha Kemis front view',
        is_primary: true,
        sort_order: 1,
      },
      {
        product_id: dressProduct.id,
        url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Royal Habesha Kemis detail view',
        is_primary: false,
        sort_order: 2,
      },
    ],
  });

  // Variants for Dress (S, M, L in White/Gold)
  for (const sizeName of ['S', 'M', 'L']) {
    const variant = await prisma.product_variants.create({
      data: {
        product_id: dressProduct.id,
        sku: `HK-GOLD-${sizeName}`,
        color_id: colors['ethiopian-gold'].id,
        size_id: sizes[sizeName].id,
        price: 4500.00,
        compare_at_price: 5200.00,
        is_active: true,
      },
    });

    const initialStock = 12;
    await prisma.inventory.create({
      data: {
        variant_id: variant.id,
        quantity: initialStock,
        reserved_quantity: 0,
        low_stock_threshold: 3,
      },
    });

    await prisma.inventory_transactions.create({
      data: {
        variant_id: variant.id,
        type: InventoryTransactionType.INITIAL_STOCK,
        quantity: initialStock,
        previous_quantity: 0,
        new_quantity: initialStock,
        note: 'Initial catalog seeding',
      },
    });
  }

  // Product 2: Abyssinia Handcrafted Leather Boots
  const bootsProduct = await prisma.products.create({
    data: {
      category_id: menShoes.id,
      brand_id: brands['abyssinia-kicks'].id,
      name: 'Highland Leather Heritage Boots',
      slug: 'highland-leather-heritage-boots',
      description: 'Handcrafted premium leather boots made from locally sourced Ethiopian full-grain leather. Built for durability, warmth, and timeless style.',
      short_description: 'Full-grain handcrafted Ethiopian leather boots.',
      material: 'Genuine Ethiopian Leather',
      gender: ProductGender.MALE,
      status: ProductStatus.ACTIVE,
      featured: true,
    },
  });

  // Images for Boots
  await prisma.product_images.createMany({
    data: [
      {
        product_id: bootsProduct.id,
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Highland Leather Heritage Boots',
        is_primary: true,
        sort_order: 1,
      },
    ],
  });

  // Variants for Boots (Sizes 40, 41, 42, 43 in Black)
  for (const shoeSize of ['40', '41', '42', '43']) {
    const variant = await prisma.product_variants.create({
      data: {
        product_id: bootsProduct.id,
        sku: `BOOT-BLK-${shoeSize}`,
        color_id: colors['black'].id,
        size_id: sizes[shoeSize].id,
        price: 3800.00,
        compare_at_price: 4200.00,
        is_active: true,
      },
    });

    const initialStock = 8;
    await prisma.inventory.create({
      data: {
        variant_id: variant.id,
        quantity: initialStock,
        reserved_quantity: 0,
        low_stock_threshold: 2,
      },
    });

    await prisma.inventory_transactions.create({
      data: {
        variant_id: variant.id,
        type: InventoryTransactionType.INITIAL_STOCK,
        quantity: initialStock,
        previous_quantity: 0,
        new_quantity: initialStock,
        note: 'Initial boots catalog seeding',
      },
    });
  }

  // Product 3: Addis Tailored Linen Blazer
  const blazerProduct = await prisma.products.create({
    data: {
      category_id: menClothing.id,
      brand_id: brands['addis-couture'].id,
      name: 'Modern Addis Linen Blazer',
      slug: 'modern-addis-linen-blazer',
      description: 'Sharp, lightweight linen blazer designed for modern professional and casual smart wear in Addis Ababa weather.',
      short_description: 'Lightweight linen modern tailored blazer.',
      material: '100% Linen Blend',
      gender: ProductGender.MALE,
      status: ProductStatus.ACTIVE,
      featured: true,
    },
  });

  await prisma.product_images.createMany({
    data: [
      {
        product_id: blazerProduct.id,
        url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        alt_text: 'Modern Addis Linen Blazer Navy',
        is_primary: true,
        sort_order: 1,
      },
    ],
  });

  for (const sizeName of ['M', 'L', 'XL']) {
    const variant = await prisma.product_variants.create({
      data: {
        product_id: blazerProduct.id,
        sku: `BLZR-NVY-${sizeName}`,
        color_id: colors['navy-blue'].id,
        size_id: sizes[sizeName].id,
        price: 4200.00,
        compare_at_price: 4800.00,
        is_active: true,
      },
    });

    const initialStock = 10;
    await prisma.inventory.create({
      data: {
        variant_id: variant.id,
        quantity: initialStock,
        reserved_quantity: 0,
        low_stock_threshold: 2,
      },
    });
  }

  // 6. Create Coupons
  console.log('🎟️ Seeding discount coupons...');
  await prisma.coupons.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% discount on your first order',
        discount_type: CouponDiscountType.PERCENTAGE,
        discount_value: 10.00,
        minimum_order_amount: 1000.00,
        usage_limit: 100,
        is_active: true,
      },
      {
        code: 'ADDIS500',
        description: '500 ETB flat discount for orders above 3000 ETB',
        discount_type: CouponDiscountType.FIXED_AMOUNT,
        discount_value: 500.00,
        minimum_order_amount: 3000.00,
        usage_limit: 50,
        is_active: true,
      },
    ],
  });

  // 7. Create Store Settings
  console.log('⚙️ Seeding store settings...');
  await prisma.store_settings.createMany({
    data: [
      {
        key: 'store_info',
        value: {
          name: 'EthioFashion Store',
          tagline: 'Premium Ethiopian Apparel & Footwear',
          city: 'Addis Ababa',
          country: 'Ethiopia',
          support_phone: '+251911000000',
          support_email: 'support@ethiofashion.com',
        },
      },
      {
        key: 'delivery_config',
        value: {
          standard_fee: 50,
          free_shipping_threshold: 5000,
          estimated_delivery_days: '1-3 Days (Addis Ababa)',
        },
      },
    ],
  });

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
