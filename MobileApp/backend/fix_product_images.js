require('dotenv').config();
const supabase = require('./src/config/supabase');

const replacementRules = [
  { keywords: ['Giày Bóng Đá', 'Predator', 'Mercurial'], url: 'https://images.unsplash.com/photo-1510566339491-164c037da255?w=600&q=80' },
  { keywords: ['Giày Tập Gym', 'Metcon'], url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80' },
  { keywords: ['Giày Sneaker', 'Giày đi bộ', 'Giày chạy bộ', 'Giày chạy thể thao', 'Giày đi chạy', 'Giày nam'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
  { keywords: ['Áo Polo'], url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80' },
  { keywords: ['Áo Thun', 'Áo phông'], url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80' },
  { keywords: ['Áo Khoác'], url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
  { keywords: ['Balo'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
  { keywords: ['Mũ', 'Nón'], url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80' },
  { keywords: ['Tất', 'Vớ'], url: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80' },
  { keywords: ['Quần'], url: 'https://images.unsplash.com/photo-1580087442629-123069c36d52?w=600&q=80' },
  { keywords: ['Túi'], url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80' },
  { keywords: ['Bộ đồ'], url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' },
  { keywords: ['Cristiano'], name: 'Áo Thi Đấu Cristiano Ronaldo', url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80' }
];

async function run() {
  try {
    const { data: products, error } = await supabase.from('products').select('id, name');
    if (error) throw error;

    for (const prod of products) {
      let updateData = {};
      
      for (const rule of replacementRules) {
        if (rule.keywords.some(kw => prod.name.toLowerCase().includes(kw.toLowerCase()))) {
          updateData.image = rule.url;
          if (rule.name) updateData.name = rule.name;
          break;
        }
      }

      if (Object.keys(updateData).length > 0) {
        console.log(`Updating product ${prod.id}: ${prod.name} -> ${updateData.name || prod.name}`);
        const { error: upErr } = await supabase.from('products').update(updateData).eq('id', prod.id);
        if (upErr) console.error(`Failed to update ${prod.id}`, upErr);

        // Also update variants if they use the same image (fallback)
        await supabase.from('product_variants').update({ image: updateData.image }).eq('product_id', prod.id);
      }
    }
    console.log('Product image fix completed!');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
