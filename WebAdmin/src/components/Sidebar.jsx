import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  ClipboardList, 
  Ticket, 
  LogOut,
  ShoppingBasket,
  Store,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';

  const navItems = [
    { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
    ...(isAdmin ? [
      { name: 'Người dùng', path: '/admin/users', icon: <Users size={20} /> },
      { name: 'Cửa hàng', path: '/admin/shops', icon: <Store size={20} /> },
      { name: 'Danh mục', path: '/admin/categories', icon: <Layers size={20} /> },
    ] : []),
    { name: isSeller ? 'Sản phẩm của tôi' : 'Sản phẩm', path: '/admin/products', icon: <ShoppingBasket size={20} /> },
    { name: isSeller ? 'Đơn hàng của shop' : 'Đơn hàng', path: '/admin/orders', icon: <ClipboardList size={20} /> },
    ...(isAdmin ? [
      { name: 'Mã giảm giá', path: '/admin/vouchers', icon: <Ticket size={20} /> },
    ] : []),
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>{isAdmin ? 'AD' : 'SL'}</div>
        <span style={styles.logoText}>{isAdmin ? 'OmniMart Admin' : 'Seller Center'}</span>
      </div>

      <div style={styles.userSection}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name || 'User'}</div>
          <div style={styles.userRole}>
            {isAdmin ? 'Quản trị viên' : (isSeller ? 'Người bán hàng' : 'Khách hàng')}
          </div>
          {isSeller && user?.shop && (
            <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px' }}>
              Shop: {user.shop.name}
            </div>
          )}
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <button style={styles.logoutBtn} onClick={logout}>
        <LogOut size={20} />
        <span style={{ marginLeft: '12px' }}>Đăng xuất</span>
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    backgroundColor: '#0f172a',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100,
  },
  logo: {
    padding: '30px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: 'var(--primary)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  userSection: {
    padding: '0 24px 30px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    marginBottom: '20px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'var(--primary)',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
  },
  userRole: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  nav: {
    flex: 1,
    padding: '0 12px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '4px',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
  },
  icon: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  logoutBtn: {
    margin: '20px 12px 30px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#fca5a5',
    backgroundColor: 'transparent',
    transition: 'all 0.2s',
    width: 'calc(100% - 24px)',
    textAlign: 'left',
  }
};

export default Sidebar;
