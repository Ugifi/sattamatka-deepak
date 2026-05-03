import React, { useState } from 'react';

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 🔥 FIX: Password show/hide karne ke liye state add ki hai 🔥
  const [showPassword, setShowPassword] = useState(false);

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.mobile || !formData.password) {
      setError('Mobile aur Password zaruri hai!');
      return;
    }
    if (!isLogin && !formData.name) {
      setError('Naam dalna zaruri hai!');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { mobile: formData.mobile, password: formData.password }
        : { name: formData.name, mobile: formData.mobile, password: formData.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('mk_token', data.token);
        if (onLogin) onLogin(data.user);
      } else {
        setError(data.message || 'Login/Register fail ho gaya!');
      }
    } catch (err) {
      setError('Server se connect nahi ho pa raha. Dobara try karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: '#021a14', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: '#fff', 
      fontFamily: "'Poppins', sans-serif", 
      padding: '20px' 
    }}>
      
      <style>{`
        /* 🔥 SHINE ANIMATION 🔥 */
        @keyframes shineMove {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .auth-btn {
          width: 100%; padding: 14px; border: none; border-radius: 10px 40px 10px 40px;
          color: #001a17; font-weight: 900; font-size: 15px; cursor: pointer; 
          background: linear-gradient(90deg, #14f4ce, #e0800b);
          transition: transform 0.2s ease; letter-spacing: 2px; text-transform: uppercase;
          position: relative; overflow: hidden; box-shadow: none; margin-top: 15px;
          display: flex; justify-content: center; align-items: center; gap: 8px;
        }
        .auth-btn:hover { transform: scale(1.02); }
        .auth-btn::before {
          content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.7), transparent);
          animation: shineMove 2.5s infinite linear;
        }

        /* 🔥 PREMIUM INPUT FIELDS 🔥 */
        .auth-input {
          width: 100%; padding: 14px 15px; border-radius: 10px; 
          background: rgba(0, 255, 213, 0.05); border: 1.5px solid rgba(0, 255, 213, 0.2);
          color: #fff; font-size: 14px; box-sizing: border-box; outline: none; transition: all 0.3s;
          font-family: 'Poppins', sans-serif; font-weight: 600; margin-bottom: 15px;
        }
        .auth-input:focus { border-color: #00ffd5; background: rgba(0, 255, 213, 0.1); }
        .auth-input::placeholder { color: rgba(255, 255, 255, 0.3); font-weight: 400; }
      `}</style>

      {/* BRANDING */}
      <h1 style={{ fontFamily: "'Teko', sans-serif", fontSize: 45, color: '#FFD700', letterSpacing: 3, textShadow: '0 0 15px rgba(255,215,0,0.5)', margin: 0 }}>
        SATKA MATKA
      </h1>
      <p style={{ color: '#00ffd5', fontSize: 13, letterSpacing: 2, marginBottom: 35, textTransform: 'uppercase', fontWeight: 700 }}>
        Play and Win Big
      </p>
      
      {/* AUTH BOX */}
      <div style={{ 
        width: '100%', maxWidth: 380, background: 'rgba(0, 255, 200, 0.05)', padding: '25px', 
        borderRadius: 15, border: '1px solid rgba(0, 255, 213, 0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' 
      }}>
        
        {/* TOGGLE BUTTONS */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 25 }}>
          <button 
            onClick={() => { setIsLogin(true); setError(''); }} 
            style={{ 
              flex: 1, padding: '12px', borderRadius: 8, border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 0.3s', 
              background: isLogin ? 'linear-gradient(90deg, #14f4ce, #e0800b)' : 'rgba(0, 255, 213, 0.1)', 
              color: isLogin ? '#001a17' : '#00ffd5' 
            }}>
            LOGIN
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }} 
            style={{ 
              flex: 1, padding: '12px', borderRadius: 8, border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 0.3s', 
              background: !isLogin ? 'linear-gradient(90deg, #14f4ce, #e0800b)' : 'rgba(0, 255, 213, 0.1)', 
              color: !isLogin ? '#001a17' : '#00ffd5' 
            }}>
            REGISTER
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{ background: 'rgba(255,34,68,0.15)', border: '1px solid rgba(255,34,68,0.4)', borderRadius: 8, padding: '10px', marginBottom: 15, color: '#ff2244', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label style={{ color: '#00ffd5', fontSize: 12, marginBottom: 5, display: 'block', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Full Name</label>
              <input type="text" name="name" className="auth-input" placeholder="Apna naam daalein" value={formData.name} onChange={handleChange} />
            </div>
          )}

          <div>
            <label style={{ color: '#00ffd5', fontSize: 12, marginBottom: 5, display: 'block', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Mobile Number</label>
            <input type="tel" name="mobile" className="auth-input" placeholder="10 digit mobile number" value={formData.mobile} onChange={handleChange} maxLength="10" />
          </div>

          <div>
            <label style={{ color: '#00ffd5', fontSize: 12, marginBottom: 5, display: 'block', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
            
            {/* 🔥 PASSWORD FIELD WITH EYE ICON 🔥 */}
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                className="auth-input" 
                placeholder="Apna password daalein" 
                value={formData.password} 
                onChange={handleChange} 
                style={{ paddingRight: '45px' }} /* Eye icon ke liye jagah banayi */
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '15px', 
                  top: '15px', 
                  cursor: 'pointer',
                  fontSize: '18px',
                  userSelect: 'none'
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? '⏳ PLEASE WAIT...' : (isLogin ? '🔓 SECURE LOGIN' : '📝 CREATE ACCOUNT')}
          </button>
        </form>
        
      </div>
      
      {/* FOOTER */}
      <div style={{ marginTop: 30, fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
        100% SECURE & TRUSTED PLATFORM
      </div>
    </div>
  );
}