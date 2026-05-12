require('dotenv').config();
const supabase = require('./src/config/supabase');

const finalProducts = [
  {
    shop_id: 2, category_id: 8, name: 'Giày Bóng Đá Nike Mercurial Zoom',
    description: 'Dòng giày siêu tốc độ dành cho các tiền đạo. Công nghệ Zoom Air mang lại độ bật nảy cực tốt trên sân cỏ.',
    price: 2450000, image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=600&q=80',
    rating: 4.8, rating_count: 92,
    variants: [{ size: '42', color: 'Hồng/Vàng', price: 2450000, stock: 10, image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=600&q=80' }]
  },
  {
    shop_id: 1, category_id: 10, name: 'Áo Thun Thể Thao Training Tee',
    description: 'Chất liệu thun lạnh, thoáng khí, phù hợp cho mọi hoạt động thể thao trong nhà và ngoài trời.',
    price: 280000, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
    rating: 4.4, rating_count: 45,
    variants: [{ size: 'M', color: 'Xanh Dương', price: 280000, stock: 40, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80' }]
  },
  {
    shop_id: 3, category_id: 18, name: 'Tất Thể Thao Nike Cushion (3 Cặp)',
    description: 'Đệm dày ở gót và mũi chân giúp giảm chấn thương khi vận động mạnh. Set 3 cặp tiện lợi.',
    price: 195000, image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600&q=80',
    rating: 4.9, rating_count: 120,
    variants: [{ size: 'Freesize', color: 'Trắng', price: 195000, stock: 100, image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600&q=80' }]
  },
  {
    shop_id: 1, category_id: 11, name: 'Áo Khoác Nỉ Thể Thao Hoodie',
    description: 'Chất nỉ chân cua cao cấp, giữ ấm tốt, phong cách năng động trẻ trung.',
    price: 490000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80',
    rating: 4.6, rating_count: 34,
    variants: [{ size: 'XL', color: 'Đen nhám', price: 490000, stock: 15, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' }]
  },
  {
    shop_id: 2, category_id: 9, name: 'Giày Tập Gym Nữ Nike Free Metcon',
    description: 'Sự kết hợp hoàn hảo giữa độ linh hoạt của Nike Free và độ ổn định của Metcon.',
    price: 2950000, image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80',
    rating: 4.7, rating_count: 58,
    variants: [{ size: '37', color: 'Xám Trắng', price: 2950000, stock: 12, image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80' }]
  }
];

async function run() {
  try {
    for (const prod of finalProducts) {
      const { variants, ...productData } = prod;
      const { data: insertedProduct, error: prodErr } = await supabase.from('products').insert(productData).select().single();
      if (prodErr) { console.error('Error:', prod.name, prodErr); continue; }
      const variantsToInsert = variants.map(v => ({ ...v, product_id: insertedProduct.id }));
      await supabase.from('product_variants').insert(variantsToInsert);
      console.log(`Inserted: ${insertedProduct.name}`);
    }
    console.log('Final Seeding completed!');
  } catch (err) { console.error(err); }
}
run();
