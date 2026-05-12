import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Vouchers from './pages/Vouchers';
import Shops from './pages/Shops';
import Categories from './pages/Categories';
import CustomerLayout from './components/CustomerLayout';
import StoreHome from './pages/StoreHome';
import SignUp from './pages/SignUp';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import OrderHistory from './pages/OrderHistory';
import './styles/index.css';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'customer') return <Navigate to="/" />;

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
};

import { CartProvider } from './context/CartContext';

const App = () => {
  return (
    <CartProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<CustomerLayout><StoreHome /></CustomerLayout>} />
            <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
            <Route path="/product/:id" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
            <Route path="/orders" element={<CustomerLayout><OrderHistory /></CustomerLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            } />

            <Route path="/admin/users" element={
              <ProtectedLayout>
                <Users />
              </ProtectedLayout>
            } />
            
            <Route path="/admin/products" element={
              <ProtectedLayout>
                <Products />
              </ProtectedLayout>
            } />

            <Route path="/admin/orders" element={
              <ProtectedLayout>
                <Orders />
              </ProtectedLayout>
            } />

            <Route path="/admin/vouchers" element={
              <ProtectedLayout>
                <Vouchers />
              </ProtectedLayout>
            } />

            <Route path="/admin/shops" element={
              <ProtectedLayout>
                <Shops />
              </ProtectedLayout>
            } />

            <Route path="/admin/categories" element={
              <ProtectedLayout>
                <Categories />
              </ProtectedLayout>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </CartProvider>
  );
};

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    marginLeft: 'var(--sidebar-width)',
    backgroundColor: 'var(--bg)',
    minHeight: '100vh',
  },
  container: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  }
};

export default App;
