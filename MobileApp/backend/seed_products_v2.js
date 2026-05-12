require('dotenv').config();
const supabase = require('./src/config/supabase');

const extraProducts = [
  // Quần áo (Category ID: 11, 13, 14)
  {
    shop_id: 1,
    category_id: 11, // Áo khoác
    name: 'Áo Khoác Gió Thể Thao Pro-Tech',
    description: 'Chất liệu vải dù cao cấp chống gió và trượt nước nhẹ. Thiết kế hiện đại, phù hợp cho cả tập luyện và dạo phố.',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    rating: 4.6,
    rating_count: 78,
    variants: [
      { size: 'M', color: 'Xám', price: 650000, stock: 20, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
      { size: 'L', color: 'Xám', price: 650000, stock: 15, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
      { size: 'L', color: 'Đen', price: 650000, stock: 25, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' }
    ]
  },
  {
    shop_id: 2,
    category_id: 13, // Quần thể thao
    name: 'Quần Jogger Tập Gym Co Giãn',
    description: 'Quần jogger chất liệu thun poly co giãn cực tốt, form dáng slimfit tôn dáng người mặc. Có túi khoá kéo an toàn.',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1580087442629-123069c36d52?w=600&q=80',
    rating: 4.5,
    rating_count: 112,
    variants: [
      { size: 'L', color: 'Đen', price: 320000, stock: 40, image: 'https://images.unsplash.com/photo-1580087442629-123069c36d52?w=600&q=80' },
      { size: 'XL', color: 'Đen', price: 320000, stock: 30, image: 'https://images.unsplash.com/photo-1580087442629-123069c36d52?w=600&q=80' },
      { size: 'L', color: 'Xanh Than', price: 320000, stock: 20, image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&q=80' }
    ]
  },
  {
    shop_id: 1,
    category_id: 14, // Bộ đồ tập gym
    name: 'Bộ Đồ Tập Gym Nữ Cao Cấp 2 Món',
    description: 'Gồm áo bra thể thao và quần legging cạp cao. Chất liệu dệt kim không đường may, thấm hút mồ hôi cực tốt.',
    price: 580000,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    rating: 4.9,
    rating_count: 215,
    variants: [
      { size: 'S', color: 'Tím pastel', price: 580000, stock: 12, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80' },
      { size: 'M', color: 'Tím pastel', price: 580000, stock: 18, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80' },
      { size: 'M', color: 'Xanh Mint', price: 580000, stock: 10, image: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600&q=80' }
    ]
  },

  // Phụ kiện (Category ID: 16)
  {
    shop_id: 2,
    category_id: 16, // Túi tập gym
    name: 'Túi Trống Thể Thao Adidas Duffel',
    description: 'Túi trống kích thước vừa phải, có ngăn đựng giày riêng và ngăn đựng đồ ướt. Logo in nổi bật, phong cách thể thao.',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    rating: 4.7,
    rating_count: 94,
    variants: [
      { size: 'Size M', color: 'Đen/Trắng', price: 950000, stock: 15, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80' },
      { size: 'Size L', color: 'Đen/Trắng', price: 1100000, stock: 10, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80' }
    ]
  },
  {
    shop_id: 1,
    category_id: 16, // Túi tập gym
    name: 'Túi Đeo Chéo Thể Thao Nhỏ Gọn',
    description: 'Hoàn hảo để đựng điện thoại, ví và các vật dụng nhỏ khi đi tập hoặc chạy bộ. Dây đeo điều chỉnh linh hoạt.',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1524513009967-8fea6f5d0b13?w=600&q=80',
    rating: 4.2,
    rating_count: 31,
    variants: [
      { size: 'Freesize', color: 'Đen', price: 220000, stock: 50, image: 'https://images.unsplash.com/photo-1524513009967-8fea6f5d0b13?w=600&q=80' },
      { size: 'Freesize', color: 'Rằn Ri', price: 240000, stock: 20, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' }
    ]
  }
];

async function run() {
  try {
    for (const prod of extraProducts) {
      const { variants, ...productData } = prod;
      
      const { data: insertedProduct, error: prodErr } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
        
      if (prodErr) {
        console.error('Error inserting product', prod.name, prodErr);
        continue;
      }
      
      console.log(`Inserted extra product: ${insertedProduct.name}`);

      const variantsToInsert = variants.map(v => ({
        ...v,
        product_id: insertedProduct.id
      }));
      
      const { error: varErr } = await supabase
        .from('product_variants')
        .insert(variantsToInsert);
        
      if (varErr) {
        console.error(`Error inserting variants for ${prod.name}`, varErr);
      } else {
        console.log(`-- Inserted ${variants.length} variants`);
      }
    }
    console.log('Extra Seeding completed!');
  } catch (err) {
    console.error('General Error:', err);
  }
}

run();
