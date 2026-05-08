import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      
      <div style={styles.card} className="animate-fade-in">
        <div style={styles.logoBox}>
          <div style={styles.logoIcon}><ShieldCheck color="#fff" size={32} /></div>
          <h1 style={styles.logoText}>OmniMart Admin</h1>
          <p style={styles.logoSubtitle}>Hệ thống quản trị thương mại điện tử</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email quản trị</label>
            <div style={styles.inputWrapper}>
              <Mail size={20} style={styles.icon} />
              <input 
                type="email" 
                placeholder="admin@omnismart.com" 
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <div style={styles.inputWrapper}>
              <Lock size={20} style={styles.icon} />
              <input 
                type="password" 
                placeholder="••••••••" 
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              backgroundColor: loading ? 'var(--primary-dark)' : 'var(--primary)',
              opacity: loading ? 0.8 : 1
            }} 
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" size={20} /> : 'Đăng nhập hệ thống'}
          </button>
        </form>

        <p style={styles.footer}>Bản quyền © 2026 OmniMart Team</p>
      </div>

      <style>
        {`
          .spinner {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    overflow: 'hidden',
    position: 'relative',
  },
  blob1: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '400px',
    height: '400px',
    backgroundColor: 'var(--primary)',
    borderRadius: '50%',
    filter: 'blur(100px)',
    opacity: 0.15,
  },
  blob2: {
    position: 'absolute',
    bottom: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    backgroundColor: 'var(--secondary)',
    borderRadius: '50%',
    filter: 'blur(100px)',
    opacity: 0.15,
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    padding: '48px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
    color: '#fff',
  },
  logoBox: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logoIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: 'var(--primary)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 10px 15px -3px rgba(227, 102, 49, 0.3)',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  logoSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    marginTop: '4px',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '24px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: '4px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '16px',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 52px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  submitBtn: {
    marginTop: '10px',
    padding: '16px',
    borderRadius: '16px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.3)',
  }
};

export default Login;
