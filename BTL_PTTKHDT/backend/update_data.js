require('dotenv').config();
const supabase = require('./src/config/supabase');

async function run() {
  try {
    // 1. Update product 27 name
    const { error: err1 } = await supabase
      .from('products')
      .update({ name: 'Bộ đồ thể thao' })
      .eq('id', 27);
    if (err1) throw err1;
    console.log('Updated product 27 name');

    // 2. Update variant images for product 27
    // Color: Black
    await supabase.from('product_variants').update({ image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' }).eq('product_id', 27).eq('color', 'Black');
    // Color: Red
    await supabase.from('product_variants').update({ image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' }).eq('product_id', 27).eq('color', 'Red');
    // Color: Blue
    await supabase.from('product_variants').update({ image: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=600&q=80' }).eq('product_id', 27).eq('color', 'Blue');
    console.log('Updated variant images for product 27');

    // 3. Insert variants for product 30
    const { error: err3 } = await supabase
      .from('product_variants')
      .insert([
        { product_id: 30, size: '40', color: 'Trắng', price: 480000, stock: 15, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80' },
        { product_id: 30, size: '41', color: 'Trắng', price: 480000, stock: 12, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80' },
        { product_id: 30, size: '42', color: 'Đen', price: 480000, stock: 20, image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80' },
        { product_id: 30, size: '43', color: 'Đen', price: 480000, stock: 8, image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80' },
      ]);
    if (err3) throw err3;
    console.log('Inserted variants for product 30');

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
