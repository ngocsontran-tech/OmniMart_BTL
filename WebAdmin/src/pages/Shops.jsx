import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  User, 
  Mail, 
  Calendar,
  DollarSign
} from 'lucide-react';
import client from '../api/client';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchShops = async () => {
    try {
      setLoading(true);
      const { data } = await client.get('/admin/shops');
      setShops(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách shop:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleToggleActive = async (id) => {
    try {
      const { data } = await client.put(`/admin/shops/${id}/toggle-active`);
      setShops(shops.map(s => s.id === id ? { ...s, users: { ...s.users, is_active: data.is_active } } : s));
    } catch (err) {
      alert('Không thể cập nhật trạng thái shop');
    }
  };

  const filteredShops = shops.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.users?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản lý Cửa hàng</h1>
          <p style={styles.subtitle}>Giám sát và quản lý các đối tác bán hàng trên hệ thống.</p>
        </div>
        
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Tìm theo tên shop hoặc chủ shop..." 
            style={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loadingTd}>Đang tải danh sách shop...</div>
        ) : filteredShops.length === 0 ? (
          <div style={styles.emptyTd}>Không tìm thấy shop nào</div>
        ) : filteredShops.map((shop) => (
          <div key={shop.id} style={{
            ...styles.card,
            opacity: shop.users?.is_active ? 1 : 0.7
          }}>
            <div style={styles.cardHeader}>
              <div style={styles.shopLogo}>
                <Store size={24} color="var(--primary)" />
              </div>
              <div style={{flex: 1}}>
                <h3 style={styles.shopName}>{shop.name}</h3>
                <div style={styles.shopId}>ID: #{shop.id}</div>
              </div>
              <button 
                onClick={() => handleToggleActive(shop.id)}
                style={{
                  ...styles.statusBtn,
                  backgroundColor: shop.users?.is_active ? '#ecfdf5' : '#fef2f2',
                  color: shop.users?.is_active ? '#10b981' : '#ef4444',
                }}
              >
                {shop.users?.is_active ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                <span>{shop.users?.is_active ? 'Đang hoạt động' : 'Đang khóa'}</span>
              </button>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.infoItem}>
                <User size={16} />
                <span>Chủ shop: <strong>{shop.users?.name}</strong></span>
              </div>
              <div style={styles.infoItem}>
                <Mail size={16} />
                <span>Email: {shop.users?.email}</span>
              </div>
              <div style={styles.infoItem}>
                <Calendar size={16} />
                <span>Ngày tham gia: {new Date(shop.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
              
              <div style={styles.divider}></div>
              
              <div style={styles.balanceRow}>
                <div style={styles.balanceLabel}>Doanh thu khả dụng</div>
                <div style={styles.balanceValue}>
                  <DollarSign size={20} />
                  <span>{shop.balance?.toLocaleString()}₫</span>
                </div>
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
  searchWrapper: { position: 'relative', width: '380px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
  searchInput: { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    padding: '24px',
    transition: 'all 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  shopLogo: {
    width: '48px',
    height: '48px',
    backgroundColor: '#f0f9ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopName: { fontSize: '18px', fontWeight: '700', color: 'var(--text)' },
  shopId: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  statusBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '12px' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' },
  divider: { height: '1px', backgroundColor: '#f1f5f9', margin: '8px 0' },
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  balanceLabel: { fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' },
  balanceValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--primary)',
  },
  loadingTd: { gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },
  emptyTd: { gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }
};

export default Shops;
