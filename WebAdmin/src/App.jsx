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
import './styles/index.css';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

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

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />

          <Route path="/users" element={
            <ProtectedLayout>
              <Users />
            </ProtectedLayout>
          } />
          
          <Route path="/products" element={
            <ProtectedLayout>
              <Products />
            </ProtectedLayout>
          } />

          <Route path="/orders" element={
            <ProtectedLayout>
              <Orders />
            </ProtectedLayout>
          } />

          <Route path="/vouchers" element={
            <ProtectedLayout>
              <Vouchers />
            </ProtectedLayout>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
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
