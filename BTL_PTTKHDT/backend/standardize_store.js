require('dotenv').config();
const supabase = require('./src/config/supabase');

const products = [
  // GIÀY (Category ID: 8, 9)
  {
    shop_id: 1, category_id: 8, name: 'Nike Mercurial Superfly 9',
    description: 'Giày bóng đá cao cấp cho tốc độ vượt trội. Thiết kế ôm chân, hỗ trợ bứt tốc.',
    price: 3200000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    variants: [{ size: '40', color: 'Đỏ Trắng', price: 3200000, stock: 10, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' }]
  },
  {
    shop_id: 2, category_id: 8, name: 'Adidas Predator Precision',
    description: 'Dòng giày kiểm soát bóng huyền thoại. Bề mặt nhám tăng độ xoáy cho cú sút.',
    price: 2850000, image: 'https://images.unsplash.com/photo-1510566339491-164c037da255?w=600&q=80',
    variants: [{ size: '41', color: 'Xanh Neon', price: 2850000, stock: 15, image: 'https://images.unsplash.com/photo-1510566339491-164c037da255?w=600&q=80' }]
  },
  {
    shop_id: 1, category_id: 9, name: 'Nike Metcon 8 Training',
    description: 'Vua của các loại giày tập gym. Đế phẳng hỗ trợ nâng tạ, thân giày thoáng khí.',
    price: 3450000, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
    variants: [{ size: '42', color: 'Xám Đen', price: 3450000, stock: 20, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80' }]
  },
  {
    shop_id: 3, category_id: 9, name: 'Nike Air Zoom Pegasus 39',
    description: 'Giày chạy bộ quốc dân. Đệm Zoom Air êm ái, phù hợp chạy hằng ngày.',
    price: 2150000, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
    variants: [{ size: '40', color: 'Xanh Lá', price: 2150000, stock: 30, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80' }]
  },
  {
    shop_id: 1, category_id: 8, name: 'Giày Đá Bóng Puma Future',
    description: 'Linh hoạt và sáng tạo. Phù hợp cho những cầu thủ có lối chơi kỹ thuật.',
    price: 1950000, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
    variants: [{ size: '41', color: 'Trắng Cam', price: 1950000, stock: 12, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80' }]
  },

  // QUẦN ÁO (Category ID: 10, 11, 13, 14)
  {
    shop_id: 1, category_id: 10, name: 'Áo Thun Thể Thao Nike Dri-FIT',
    description: 'Công nghệ Dri-FIT thấm hút mồ hôi vượt trội, giúp bạn luôn khô thoáng.',
    price: 450000, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
    variants: [{ size: 'L', color: 'Trắng', price: 450000, stock: 50, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80' }]
  },
  {
    shop_id: 2, category_id: 11, name: 'Áo Khoác Gió Thể Thao Tech Fleece',
    description: 'Chất liệu nỉ tech fleece giữ ấm cực tốt mà không gây nặng nề.',
    price: 1250000, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    variants: [{ size: 'XL', color: 'Xám', price: 1250000, stock: 20, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' }]
  },
  {
    shop_id: 1, category_id: 14, name: 'Bộ Đồ Tập Gym Nữ Activewear',
    description: 'Thiết kế thời trang, chất liệu co giãn 4 chiều hỗ trợ mọi bài tập.',
    price: 580000, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
    variants: [{ size: 'M', color: 'Vàng Chanh', price: 580000, stock: 15, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80' }]
  },
  {
    shop_id: 2, category_id: 13, name: 'Quần Jogger Nike Sportswear',
    description: 'Dáng slim-fit hiện đại, túi khóa kéo an toàn. Phù hợp cả đi chơi và tập luyện.',
    price: 850000, image: 'https://images.unsplash.com/photo-1580087442629-123069c36d52?w=600&q=80',
    variants: [{ size: 'L', color: 'Đen', price: 850000, stock: 25, image: 'https://images.unsplash.com/photo-1580087442629-123069c36d52?w=600&q=80' }]
  },
  {
    shop_id: 1, category_id: 10, name: 'Áo Thi Đấu Cristiano Ronaldo',
    description: 'Áo đấu chính thức với số 7 huyền thoại. Chất liệu cao cấp chuẩn thi đấu.',
    price: 2000000, image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
    variants: [{ size: 'L', color: 'Xanh Trắng', price: 2000000, stock: 10, image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80' }]
  },

  // PHỤ KIỆN (Category ID: 15, 16, 17, 18)
  {
    shop_id: 1, category_id: 15, name: 'Balo Du Lịch Đa Năng 40L',
    description: 'Chống nước, nhiều ngăn chứa phụ kiện. Phù hợp cho những chuyến đi dài.',
    price: 750000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    variants: [{ size: '40L', color: 'Đen nhám', price: 750000, stock: 12, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' }]
  },
  {
    shop_id: 2, category_id: 17, name: 'Mũ Lưỡi Trai Adidas Originals',
    description: 'Thiết kế cổ điển với logo cỏ 3 lá đặc trưng. Chất liệu cotton thoáng mát.',
    price: 450000, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
    variants: [{ size: 'Freesize', color: 'Xanh Navy', price: 450000, stock: 40, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80' }]
  },
  {
    shop_id: 1, category_id: 18, name: 'Tất Thể Thao Nike Cushion',
    description: 'Đệm dày ở các điểm chịu lực, hỗ trợ tối đa cho đôi chân khi vận động.',
    price: 150000, image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80',
    variants: [{ size: 'M', color: 'Trắng', price: 150000, stock: 100, image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80' }]
  },
  {
    shop_id: 3, category_id: 16, name: 'Túi Trống Adidas Duffel Bag',
    description: 'Túi đựng đồ tập gym chuyên dụng. Có ngăn riêng biệt để đựng giày.',
    price: 950000, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    variants: [{ size: 'M', color: 'Đen Trắng', price: 950000, stock: 15, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80' }]
  }
];

async function run() {
  try {
    // 1. CLEAN UP: Delete all existing variants and products
    console.log('Cleaning up old data...');
    await supabase.from('product_variants').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', 0);
    console.log('Cleanup done.');

    // 2. SEED: Insert high-quality standardized data
    for (const prod of products) {
      const { variants, ...productData } = prod;
      const { data: insertedProduct, error: prodErr } = await supabase.from('products').insert(productData).select().single();
      
      if (prodErr) {
        console.error('Error inserting product', prod.name, prodErr);
        continue;
      }
      
      console.log(`Inserted: ${insertedProduct.name}`);
      const variantsToInsert = variants.map(v => ({ ...v, product_id: insertedProduct.id }));
      await supabase.from('product_variants').insert(variantsToInsert);
    }
    
    console.log('STANDARD SEEDING COMPLETED!');
  } catch (err) {
    console.error('General Error:', err);
  }
}

run();
