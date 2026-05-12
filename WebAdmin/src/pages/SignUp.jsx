import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Store, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Note: the current AuthContext in WebAdmin might only have a login function.
  // We may need to use a custom API call here if register isn't in AuthContext.
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (isSeller && !shopName.trim()) {
      setError('Vui lòng nhập tên cửa hàng');
      setLoading(false);
      return;
    }

    try {
      // Assuming you have an API client set up for this
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          is_seller: isSeller,
          shop_name: isSeller ? shopName.trim() : null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="animate-fade-in">
        <div style={styles.logoBox}>
          <img src="/Logo_OmniMart.png" alt="OmniMart Logo" style={styles.logoImage} />
          <p style={styles.logoSubtitle}>Register to start selling or shopping</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <User size={20} style={styles.icon} />
              <input 
                type="text" 
                placeholder="Enter your name" 
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <Mail size={20} style={styles.icon} />
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <Lock size={20} style={styles.icon} />
              <input 
                type="password" 
                placeholder="Enter your password" 
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div 
            style={{...styles.sellerToggle, borderColor: isSeller ? 'var(--primary)' : 'var(--border)'}} 
            onClick={() => setIsSeller(!isSeller)}
          >
            <div style={{...styles.checkbox, backgroundColor: isSeller ? 'var(--primary)' : 'transparent', borderColor: isSeller ? 'var(--primary)' : '#ccc'}}>
              {isSeller && <Check size={14} color="#fff" />}
            </div>
            <div>
              <div style={styles.sellerTitle}>Register as a seller</div>
              <div style={styles.sellerDesc}>Automatically create your own store when registering.</div>
            </div>
          </div>

          {isSeller && (
            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <Store size={20} style={styles.icon} />
                <input 
                  type="text" 
                  placeholder="Enter your store name" 
                  style={styles.input}
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required={isSeller}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1
            }} 
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" size={24} color="#fff" /> : 'Sign up'}
          </button>
        </form>

        <div style={styles.loginContainer}>
          <span style={{ color: '#666' }}>Already have an account? </span>
          <Link to="/login" style={styles.loginLink}>Log in</Link>
        </div>
      </div>

      <style>
        {`
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          * { box-sizing: border-box; }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '30px 20px',
    backgroundColor: '#fff',
  },
  logoBox: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logoImage: {
    width: '180px',
    height: 'auto',
    marginBottom: '10px',
  },
  logoSubtitle: {
    color: 'gray',
    fontSize: '15px',
    marginBottom: '20px',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
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
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '55px',
    borderColor: '#E36631',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderRadius: '15px',
    backgroundColor: '#fff',
    boxShadow: '0 3px 4px rgba(227, 102, 49, 0.2)',
  },
  icon: {
    marginLeft: '15px',
    color: 'gray',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: '0 15px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#000',
    fontSize: '15px',
    outline: 'none',
  },
  sellerToggle: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    border: '2px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    gap: '15px',
    transition: 'all 0.2s',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerTitle: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#333',
  },
  sellerDesc: {
    color: '#666',
    fontSize: '13px',
    marginTop: '2px',
  },
  submitBtn: {
    width: '100%',
    height: '60px',
    backgroundColor: '#E36631',
    marginTop: '10px',
    borderRadius: '25px',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(227, 102, 49, 0.3)',
    transition: 'opacity 0.2s',
  },
  loginContainer: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '14px',
  },
  loginLink: {
    color: '#E36631',
    fontWeight: '600',
    textDecoration: 'none',
    marginLeft: '5px',
  }
};

export default SignUp;
