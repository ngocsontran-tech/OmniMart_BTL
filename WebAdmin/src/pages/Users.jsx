import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Shield, 
  MoreVertical,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import client from '../api/client';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await client.get(`/admin/users?search=${search}`);
      setUsers(data.data || []);
    } catch (err) {
      console.error('Lỗi tải người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const toggleUserActive = async (id) => {
    try {
      await client.put(`/admin/users/${id}/toggle-active`);
      fetchUsers();
    } catch (err) {
      alert('Không thể thực hiện thao tác');
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản lý người dùng</h1>
          <p style={styles.subtitle}>Danh sách toàn bộ thành viên trong hệ thống.</p>
        </div>
        
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email..." 
            style={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Người dùng</th>
              <th style={styles.th}>Vai trò</th>
              <th style={styles.th}>Ngày gia nhập</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={styles.loadingTd}>Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" style={styles.emptyTd}>Không tìm thấy người dùng</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.userCell}>
                    <div style={styles.avatar}>{user.name?.charAt(0)}</div>
                    <div>
                      <div style={styles.userName}>{user.name}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: user.role === 'admin' ? '#fef3c7' : user.role === 'seller' ? '#e0f2fe' : '#f1f5f9',
                    color: user.role === 'admin' ? '#92400e' : user.role === 'seller' ? '#0369a1' : '#475569',
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.dateCell}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span style={{marginLeft: '6px'}}>{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusDot,
                    backgroundColor: user.is_active ? '#10b981' : '#ef4444'
                  }}></span>
                  <span style={{marginLeft: '8px'}}>{user.is_active ? 'Hoạt động' : 'Đã khóa'}</span>
                </td>
                <td style={styles.td}>
                  <button 
                    style={styles.actionBtn}
                    onClick={() => toggleUserActive(user.id)}
                    title={user.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                  >
                    {user.is_active ? <UserX size={18} color="#ef4444" /> : <UserCheck size={18} color="#10b981" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    width: '320px',
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
    '&:focus': { borderColor: 'var(--primary)' }
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  theadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid var(--border)',
  },
  th: {
    padding: '16px 24px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 24px',
    fontSize: '14px',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    color: 'var(--text)',
  },
  userName: { fontWeight: '600', color: 'var(--text)' },
  userEmail: { fontSize: '12px', color: 'var(--text-muted)' },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateCell: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text)',
  },
  statusDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  actionBtn: {
    background: 'none',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    '&:hover': { backgroundColor: '#f1f5f9' }
  },
  loadingTd: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },
  emptyTd: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }
};

export default Users;
