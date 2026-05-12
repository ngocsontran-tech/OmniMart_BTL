import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'seller') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="animate-fade-in">
        <div style={styles.logoBox}>
          <img src="/Logo_OmniMart.png" alt="OmniMart Logo" style={styles.logoImage} />
          <p style={styles.logoSubtitle}>Please login to continue</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <Mail size={24} style={styles.icon} />
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
              <Lock size={24} style={styles.icon} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <div style={styles.forgotPasswordContainer}>
            <button type="button" style={styles.forgotPassword}>Quên mật khẩu?</button>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1
            }} 
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" size={24} color="#fff" /> : 'Login'}
          </button>
        </form>

        <div style={styles.signupContainer}>
          <span style={{ color: '#666' }}>Don't have an account? </span>
          <button type="button" style={styles.signupBtn} onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
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
          * {
            box-sizing: border-box;
          }
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
    maxWidth: '400px',
    padding: '20px',
    backgroundColor: '#fff',
  },
  logoBox: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logoImage: {
    width: '180px',
    height: 'auto',
    marginBottom: '40px',
    marginTop: '30px',
  },
  logoSubtitle: {
    color: 'gray',
    fontSize: '16px',
    marginTop: '4px',
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
    height: '50px',
    borderColor: '#E36631',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderRadius: '15px',
    backgroundColor: '#fff',
    boxShadow: '0 3px 4px rgba(227, 102, 49, 0.4)',
  },
  icon: {
    marginLeft: '12px',
    color: 'gray',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: '0 10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#000',
    fontSize: '15px',
    outline: 'none',
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 12px',
    color: 'gray',
    display: 'flex',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '-5px',
  },
  forgotPassword: {
    background: 'none',
    border: 'none',
    color: '#E36631',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
  },
  submitBtn: {
    width: '100%',
    height: '60px',
    backgroundColor: '#E36631',
    marginTop: '10px',
    borderRadius: '25px',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3px 4px rgba(68, 68, 68, 0.4)',
    transition: 'opacity 0.2s',
  },
  signupContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    fontSize: '14px',
  },
  signupBtn: {
    background: 'none',
    border: 'none',
    color: '#E36631',
    fontWeight: 'normal',
    cursor: 'pointer',
    padding: 0,
    marginLeft: '4px',
    fontSize: '14px',
  }
};

export default Login;

