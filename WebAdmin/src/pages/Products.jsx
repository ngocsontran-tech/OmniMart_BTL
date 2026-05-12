import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  MoreVertical,
  Package,
  Store,
  DollarSign,
  Calendar,
  Edit
} from 'lucide-react';
import client from '../api/client';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
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

  const [confirmingId, setConfirmingId] = useState(null);

  const handleDelete = async (id) => {
    console.log('Admin: Delete step triggered for ID:', id);
    
    if (confirmingId !== id) {
      // Step 1: Set confirming state
      setConfirmingId(id);
      // Auto-reset confirming state after 3 seconds
      setTimeout(() => setConfirmingId(null), 3000);
      return;
    }

    // Step 2: Execute actual delete
    try {
      setDeletingId(id);
      console.log('Admin: Sending DELETE request to backend...');
      const response = await client.delete(`/admin/products/${id}`);
      console.log('Admin: Delete successful:', response.data);
      
      setProducts(prev => prev.filter(p => p.id !== id));
      // Reset states
      setConfirmingId(null);
    } catch (err) {
      console.error('Admin: Delete failed:', err);
      const errMsg = err.response?.data?.message || err.message;
      alert(`Lỗi: ${errMsg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category_id: 1
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      const { data } = await client.post('/admin/products', formData);
      setProducts(prev => [data, ...prev]);
      setShowModal(false);
      setFormData({ name: '', price: '', description: '', image: '', category_id: 1 });
      alert('Thêm sản phẩm thành công!');
    } catch (err) {
      console.error('Lỗi thêm sản phẩm:', err);
      alert('Không thể thêm sản phẩm');
    } finally {
      setAdding(false);
    }
  };

  // --- EDIT & VARIANTS LOGIC ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editTab, setEditTab] = useState('info'); // 'info' | 'variants'
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [newVariant, setNewVariant] = useState({ size: '', color: '', price: '', stock: '', image: '' });
  const [addingVariant, setAddingVariant] = useState(false);

  const openEditModal = (product) => {
    setEditingProduct({ ...product });
    setEditTab('info');
    setEditModalOpen(true);
    fetchVariants(product.id);
  };

  const fetchVariants = async (productId) => {
    setLoadingVariants(true);
    try {
      const { data } = await client.get(`/admin/products/${productId}/variants`);
      setVariants(data || []);
    } catch (err) {
      console.error('Lỗi tải biến thể:', err);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleUpdateProductInfo = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      const { data } = await client.put(`/admin/products/${editingProduct.id}`, editingProduct);
      setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
      alert('Cập nhật thành công!');
    } catch (err) {
      alert('Lỗi cập nhật sản phẩm');
    } finally {
      setAdding(false);
    }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    try {
      setAddingVariant(true);
      const { data } = await client.post(`/admin/products/${editingProduct.id}/variants`, newVariant);
      setVariants(prev => [...prev, data]);
      setNewVariant({ size: '', color: '', price: '', stock: '', image: '' });
    } catch (err) {
      alert('Lỗi thêm biến thể');
    } finally {
      setAddingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Bạn có chắc muốn xóa biến thể này?')) return;
    try {
      await client.delete(`/admin/variants/${variantId}`);
      setVariants(prev => prev.filter(v => v.id !== variantId));
    } catch (err) {
      alert('Lỗi xóa biến thể');
    }
  };
  // -----------------------------

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
        
        <div style={styles.headerActions}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Tìm tên sản phẩm..." 
              style={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button style={styles.addBtn} onClick={() => setShowModal(true)}>
            + Thêm sản phẩm
          </button>
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
                  style={{
                    ...styles.deleteBtn,
                    backgroundColor: confirmingId === product.id ? '#ef4444' : (deletingId === product.id ? '#fee2e2' : '#fee2e2'),
                    color: confirmingId === product.id ? '#fff' : '#ef4444',
                    opacity: deletingId === product.id ? 0.7 : 1,
                    cursor: deletingId === product.id ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  title="Xóa sản phẩm"
                >
                  <Trash2 size={18} />
                  <span>
                    {deletingId === product.id ? 'Đang xóa...' : (confirmingId === product.id ? 'Xác nhận xóa?' : 'Gỡ bỏ')}
                  </span>
                </button>
                
                <button 
                  style={styles.viewBtn}
                  onClick={() => openEditModal(product)}
                  title="Chỉnh sửa & Biến thể"
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Thêm sản phẩm mới</h2>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleAddProduct} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tên sản phẩm</label>
                <input 
                  type="text" 
                  required 
                  style={styles.input} 
                  placeholder="Ví dụ: Giày Nike Air Max..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Giá bán (₫)</label>
                  <input 
                    type="number" 
                    required 
                    style={styles.input} 
                    placeholder="1000000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Danh mục</label>
                  <select 
                    style={styles.input}
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                  >
                    <option value={1}>Thời trang</option>
                    <option value={2}>Điện tử</option>
                    <option value={3}>Gia dụng</option>
                    <option value={4}>Sách</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Link ảnh sản phẩm</label>
                <input 
                  type="url" 
                  style={styles.input} 
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Mô tả sản phẩm</label>
                <textarea 
                  style={{...styles.input, height: '100px', resize: 'none'}} 
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button type="submit" style={styles.submitBtn} disabled={adding}>
                {adding ? 'Đang xử lý...' : 'Đăng sản phẩm'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT & VARIANTS MODAL */}
      {editModalOpen && editingProduct && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, width: '700px' }}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Quản lý: {editingProduct.name}</h2>
              <button style={styles.closeBtn} onClick={() => setEditModalOpen(false)}>&times;</button>
            </div>

            {/* TABS */}
            <div style={styles.tabContainer}>
              <button 
                style={{ ...styles.tabBtn, borderBottom: editTab === 'info' ? '2px solid var(--primary)' : 'none', color: editTab === 'info' ? 'var(--primary)' : 'var(--text-muted)' }}
                onClick={() => setEditTab('info')}
              >
                Thông tin cơ bản
              </button>
              <button 
                style={{ ...styles.tabBtn, borderBottom: editTab === 'variants' ? '2px solid var(--primary)' : 'none', color: editTab === 'variants' ? 'var(--primary)' : 'var(--text-muted)' }}
                onClick={() => setEditTab('variants')}
              >
                Biến thể & Tồn kho
              </button>
            </div>

            {/* TAB: INFO */}
            {editTab === 'info' && (
              <form onSubmit={handleUpdateProductInfo} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tên sản phẩm</label>
                  <input 
                    type="text" 
                    required 
                    style={styles.input} 
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Giá bán (₫)</label>
                    <input 
                      type="number" 
                      required 
                      style={styles.input} 
                      value={editingProduct.price || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Danh mục</label>
                    <select 
                      style={styles.input}
                      value={editingProduct.category_id || 1}
                      onChange={(e) => setEditingProduct({...editingProduct, category_id: parseInt(e.target.value)})}
                    >
                      <option value={1}>Thời trang</option>
                      <option value={2}>Điện tử</option>
                      <option value={3}>Gia dụng</option>
                      <option value={4}>Sách</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Link ảnh sản phẩm</label>
                  <input 
                    type="url" 
                    style={styles.input} 
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Mô tả sản phẩm</label>
                  <textarea 
                    style={{...styles.input, height: '80px', resize: 'none'}} 
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>

                <button type="submit" style={styles.submitBtn} disabled={adding}>
                  {adding ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            )}

            {/* TAB: VARIANTS */}
            {editTab === 'variants' && (
              <div>
                {/* List variants */}
                <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                  {loadingVariants ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải biến thể...</p>
                  ) : variants.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có biến thể nào.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>Size</th>
                          <th style={{ padding: '8px' }}>Màu sắc</th>
                          <th style={{ padding: '8px' }}>Giá</th>
                          <th style={{ padding: '8px' }}>Tồn kho</th>
                          <th style={{ padding: '8px' }}>Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map(v => (
                          <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px' }}>{v.size || '-'}</td>
                            <td style={{ padding: '8px' }}>{v.color || '-'}</td>
                            <td style={{ padding: '8px' }}>{v.price ? `${v.price.toLocaleString()}₫` : '-'}</td>
                            <td style={{ padding: '8px' }}>{v.stock || 0}</td>
                            <td style={{ padding: '8px' }}>
                              <button onClick={() => handleDeleteVariant(v.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Add new variant form */}
                <h3 style={{ fontSize: '16px', marginBottom: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>Thêm biến thể mới</h3>
                <form onSubmit={handleAddVariant} style={styles.formRow}>
                  <input type="text" placeholder="Size (vd: XL)" style={styles.input} value={newVariant.size} onChange={e => setNewVariant({...newVariant, size: e.target.value})} />
                  <input type="text" placeholder="Màu sắc (vd: Đỏ)" style={styles.input} value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} />
                  <input type="number" placeholder="Giá (nếu khác)" style={styles.input} value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: e.target.value})} />
                  <input type="number" required placeholder="Số lượng tồn kho" style={styles.input} value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: e.target.value})} />
                  <button type="submit" style={{ ...styles.submitBtn, marginTop: 0 }} disabled={addingVariant}>
                    {addingVariant ? '...' : 'Thêm'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  headerActions: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
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
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
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
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
  },
  loadingFull: { gridColumn: '1/-1', padding: '100px', textAlign: 'center', color: 'var(--text-muted)' },
  emptyFull: { gridColumn: '1/-1', padding: '100px', textAlign: 'center', color: 'var(--text-muted)' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '500px',
    borderRadius: '24px',
    padding: '30px',
    boxShadow: 'var(--shadow-lg)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  input: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    outline: 'none',
    fontSize: '14px',
  },
  submitBtn: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: '700',
    marginTop: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border)',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 0',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};

export default Products;
