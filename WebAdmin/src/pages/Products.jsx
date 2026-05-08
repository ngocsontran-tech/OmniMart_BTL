import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  MoreVertical,
  Package,
  Store,
  DollarSign,
  Calendar
} from 'lucide-react';
import client from '../api/client';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await client.get('/admin/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?\nHành động này sẽ xóa toàn bộ biến thể liên quan.`)) {
      try {
        await client.delete(`/admin/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
        alert('Đã xóa sản phẩm thành công');
      } catch (err) {
        alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.shops?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản lý sản phẩm</h1>
          <p style={styles.subtitle}>Duyệt và quản lý toàn bộ sản phẩm trên hệ thống.</p>
        </div>
        
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Tìm tên sản phẩm hoặc tên shop..." 
            style={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loadingFull}>Đang tải danh sách sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={styles.emptyFull}>Không tìm thấy sản phẩm nào</div>
        ) : filteredProducts.map((product) => (
          <div key={product.id} style={styles.productCard}>
            <div style={styles.imageWrapper}>
              <img 
                src={product.image || 'https://via.placeholder.com/200'} 
                alt={product.name} 
                style={styles.image}
              />
              <div style={styles.priceTag}>
                {product.price?.toLocaleString()}₫
              </div>
            </div>
            
            <div style={styles.cardContent}>
              <h3 style={styles.productName} title={product.name}>{product.name}</h3>
              
              <div style={styles.infoRow}>
                <Store size={14} color="var(--text-muted)" />
                <span style={styles.shopName}>{product.shops?.name || 'OmniMart'}</span>
              </div>
              
              <div style={styles.infoRow}>
                <Calendar size={14} color="var(--text-muted)" />
                <span style={styles.dateText}>
                  Đăng ngày: {new Date(product.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div style={styles.actions}>
                <button 
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(product.id, product.name)}
                  title="Xóa sản phẩm"
                >
                  <Trash2 size={18} />
                  <span>Gỡ bỏ</span>
                </button>
                
                <button 
                  style={styles.viewBtn}
                  onClick={() => alert('Tính năng xem chi tiết đang phát triển')}
                >
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '30px',
  },
  title: { fontSize: '28px', fontWeight: '700' },
  subtitle: { color: 'var(--text-muted)', marginTop: '4px' },
  searchWrapper: {
    position: 'relative',
    width: '350px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    outline: 'none',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
    paddingBottom: '40px',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrapper: {
    position: 'relative',
    height: '180px',
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  priceTag: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(4px)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  cardContent: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  productName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '44px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  shopName: {
    fontSize: '13px',
    color: 'var(--primary)',
    fontWeight: '500',
  },
  dateText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto',
    paddingTop: '16px',
  },
  deleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    padding: '8px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  viewBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-muted)',
    borderRadius: '10px',
    transition: 'all 0.2s',
  },
  loadingFull: { gridColumn: '1/-1', padding: '100px', textAlign: 'center', color: 'var(--text-muted)' },
  emptyFull: { gridColumn: '1/-1', padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }
};

export default Products;
