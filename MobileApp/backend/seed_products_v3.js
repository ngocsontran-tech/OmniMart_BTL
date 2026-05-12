require('dotenv').config();
const supabase = require('./src/config/supabase');

const seedData = [
  // Giày (Category ID: 8, 9)
  {
    shop_id: 2,
    category_id: 8, // Giày bóng đá
    name: 'Giày Bóng Đá Predator Accuracy.3',
    description: 'Kiểm soát bóng tối ưu với bề mặt 3D đặc biệt. Phù hợp cho sân cỏ nhân tạo. Thiết kế cổ thun ôm sát linh hoạt.',
    price: 1850000,
    image: 'https://images.unsplash.com/photo-1510566339491-164c037da255?w=600&q=80',
    rating: 4.7,
    rating_count: 156,
    variants: [
      { size: '40', color: 'Xanh Neon', price: 1850000, stock: 10, image: 'https://images.unsplash.com/photo-1510566339491-164c037da255?w=600&q=80' },
      { size: '41', color: 'Xanh Neon', price: 1850000, stock: 12, image: 'https://images.unsplash.com/photo-1510566339491-164c037da255?w=600&q=80' }
    ]
  },
  {
    shop_id: 3,
    category_id: 9, // Giày tập gym
    name: 'Giày Tập Gym Nam Metcon 8',
    description: 'Dòng giày tập chuyên dụng cho các bài tập cường độ cao và nâng tạ. Gót giày phẳng và rộng giúp ổn định tối đa.',
    price: 3450000,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
    rating: 4.9,
    rating_count: 84,
    variants: [
      { size: '41', color: 'Xám/Cam', price: 3450000, stock: 8, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80' },
      { size: '42', color: 'Xám/Cam', price: 3450000, stock: 15, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80' }
    ]
  },
  
  // Quần áo (Category ID: 10, 11)
  {
    shop_id: 1,
    category_id: 10, // Áo thun
    name: 'Áo Polo Thể Thao Nam Elegance',
    description: 'Chất liệu thun lạnh cao cấp, có cổ lịch sự nhưng vẫn đảm bảo độ thông thoáng cho các hoạt động ngoài trời.',
    price: 390000,
    image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80',
    rating: 4.5,
    rating_count: 67,
    variants: [
      { size: 'L', color: 'Trắng', price: 390000, stock: 25, image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80' },
      { size: 'XL', color: 'Trắng', price: 390000, stock: 20, image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80' },
      { size: 'L', color: 'Xanh Navy', price: 390000, stock: 30, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' }
    ]
  },
  
  // Phụ kiện (Category ID: 15, 17)
  {
    shop_id: 1,
    category_id: 15, // Balo
    name: 'Balo Leo Núi & Cắm Trại 50L',
    description: 'Dung tích lớn, nhiều ngăn tiện lợi và đai trợ lực thông minh. Phù hợp cho những chuyến đi dài ngày.',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    rating: 4.8,
    rating_count: 42,
    variants: [
      { size: '50L', color: 'Xanh Rêu', price: 1250000, stock: 5, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' }
    ]
  },
  {
    shop_id: 2,
    category_id: 17, // Nón
    name: 'Mũ Beanie Giữ Nhiệt Adidas',
    description: 'Chất liệu len mềm mại, giữ ấm tuyệt vời cho mùa đông. Thiết kế tối giản với logo Adidas thêu tinh tế.',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d38537c?w=600&q=80',
    rating: 4.6,
    rating_count: 29,
    variants: [
      { size: 'Freesize', color: 'Đen', price: 350000, stock: 40, image: 'https://images.unsplash.com/photo-1576871337622-98d48d38537c?w=600&q=80' },
      { size: 'Freesize', color: 'Xám', price: 350000, stock: 35, image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&q=80' }
    ]
  }
];

async function run() {
  try {
    for (const prod of seedData) {
      const { variants, ...productData } = prod;
      const { data: insertedProduct, error: prodErr } = await supabase.from('products').insert(productData).select().single();
      if (prodErr) { console.error('Error:', prod.name, prodErr); continue; }
      console.log(`Inserted: ${insertedProduct.name}`);
      const variantsToInsert = variants.map(v => ({ ...v, product_id: insertedProduct.id }));
      await supabase.from('product_variants').insert(variantsToInsert);
    }
    console.log('Seeding v3 completed!');
  } catch (err) { console.error(err); }
}
run();
