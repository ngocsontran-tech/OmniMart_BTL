require('dotenv').config();
const supabase = require('./src/config/supabase');

const newProducts = [
  // Giày
  {
    shop_id: 2,
    category_id: 7, // Giày chạy bộ
    name: 'Giày Chạy Bộ Nam Ultraboost Light',
    description: 'Giày chạy bộ cao cấp với đệm Boost siêu nhẹ, mang lại cảm giác thoải mái trên mọi quãng đường. Đế ngoài Continental bền bỉ, chống trượt hoàn hảo.',
    price: 3200000,
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80',
    rating: 4.8,
    rating_count: 125,
    variants: [
      { size: '40', color: 'Đen/Trắng', price: 3200000, stock: 10, image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80' },
      { size: '41', color: 'Đen/Trắng', price: 3200000, stock: 15, image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80' },
      { size: '42', color: 'Xanh Navy', price: 3300000, stock: 5, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80' }
    ]
  },
  {
    shop_id: 1,
    category_id: 6, // Giày Sneaker
    name: 'Giày Sneaker Cổ Điển Classic Comfort',
    description: 'Thiết kế vintage không bao giờ lỗi thời. Phù hợp cho cả đi làm và đi chơi. Chất liệu da PU cao cấp dễ dàng vệ sinh.',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    rating: 4.5,
    rating_count: 89,
    variants: [
      { size: '39', color: 'Đỏ', price: 850000, stock: 20, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
      { size: '40', color: 'Đỏ', price: 850000, stock: 25, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
      { size: '41', color: 'Trắng', price: 850000, stock: 12, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80' }
    ]
  },
  {
    shop_id: 2,
    category_id: 7, // Giày chạy bộ
    name: 'Giày Thể Thao Nữ Swift Run',
    description: 'Giày thể thao ôm sát chân như một đôi tất, hỗ trợ từng nhịp bước nhẹ nhàng. Rất phù hợp cho chạy bộ buổi sáng.',
    price: 1500000,
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80',
    rating: 4.9,
    rating_count: 230,
    variants: [
      { size: '36', color: 'Hồng/Trắng', price: 1500000, stock: 10, image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80' },
      { size: '37', color: 'Hồng/Trắng', price: 1500000, stock: 8, image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80' },
      { size: '38', color: 'Đen tuyền', price: 1500000, stock: 14, image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=600&q=80' }
    ]
  },

  // Quần áo
  {
    shop_id: 3,
    category_id: 10, // Áo thun
    name: 'Áo Thun Thể Thao Thấm Hút Mồ Hôi CR7',
    description: 'Áo thun công nghệ Dri-FIT độc quyền, giúp luôn khô thoáng dù tập luyện cường độ cao. Co giãn 4 chiều.',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80',
    rating: 4.7,
    rating_count: 340,
    variants: [
      { size: 'M', color: 'Trắng', price: 450000, stock: 50, image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80' },
      { size: 'L', color: 'Trắng', price: 450000, stock: 45, image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80' },
      { size: 'M', color: 'Đen', price: 450000, stock: 30, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' },
      { size: 'XL', color: 'Đen', price: 450000, stock: 20, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' }
    ]
  },
  {
    shop_id: 1,
    category_id: 12, // Quần short
    name: 'Quần Short Chạy Bộ Cao Cấp',
    description: 'Trọng lượng cực nhẹ, tích hợp lớp lót trong an toàn. Có túi zip hai bên đựng chìa khoá và điện thoại nhỏ.',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80',
    rating: 4.4,
    rating_count: 56,
    variants: [
      { size: 'S', color: 'Xám', price: 350000, stock: 15, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80' },
      { size: 'M', color: 'Xám', price: 350000, stock: 25, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80' },
      { size: 'L', color: 'Đen', price: 350000, stock: 40, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80' }
    ]
  },

  // Phụ kiện
  {
    shop_id: 2,
    category_id: 15, // Balo
    name: 'Balo Thể Thao Đa Năng Chống Nước',
    description: 'Balo dung tích 30L với ngăn đựng giày riêng biệt. Chất liệu vải dù chống nước hoàn hảo cho những chuyến đi xa hoặc tập gym.',
    price: 790000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    rating: 4.8,
    rating_count: 180,
    variants: [
      { size: 'Freesize', color: 'Đen/Cam', price: 790000, stock: 22, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
      { size: 'Freesize', color: 'Đen nhám', price: 850000, stock: 15, image: 'https://images.unsplash.com/photo-1547949007-9f20e88c0379?w=600&q=80' }
    ]
  },
  {
    shop_id: 1,
    category_id: 17, // Nón
    name: 'Mũ Lưỡi Trai Thể Thao Thoáng Khí',
    description: 'Thiết kế form cứng cáp, chất liệu lưới phía sau giúp thoát mồ hôi hiệu quả. Điều chỉnh kích thước dễ dàng.',
    price: 250000,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
    rating: 4.3,
    rating_count: 45,
    variants: [
      { size: 'Freesize', color: 'Xám đậm', price: 250000, stock: 30, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80' },
      { size: 'Freesize', color: 'Xanh lính', price: 250000, stock: 18, image: 'https://images.unsplash.com/photo-1556306535-0f09a536f0ab?w=600&q=80' }
    ]
  },
  {
    shop_id: 3,
    category_id: 18, // Vớ
    name: 'Set 3 Đôi Tất Thể Thao Cổ Ngắn',
    description: 'Tất dệt kim mềm mại, kháng khuẩn và khử mùi mồ hôi chân. Có đệm lót êm ái ở lòng bàn chân.',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80',
    rating: 4.9,
    rating_count: 512,
    variants: [
      { size: 'Freesize', color: 'Trắng', price: 150000, stock: 100, image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80' },
      { size: 'Freesize', color: 'Đen', price: 150000, stock: 80, image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600&q=80' },
      { size: 'Freesize', color: 'Mix Màu', price: 160000, stock: 40, image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80' }
    ]
  }
];

async function run() {
  try {
    for (const prod of newProducts) {
      const { variants, ...productData } = prod;
      
      // 1. Insert Product
      const { data: insertedProduct, error: prodErr } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
        
      if (prodErr) {
        console.error('Error inserting product', prod.name, prodErr);
        continue;
      }
      
      console.log(`Inserted product: ${insertedProduct.name}`);

      // 2. Insert Variants
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
    console.log('Seeding completed!');
  } catch (err) {
    console.error('General Error:', err);
  }
}

run();
