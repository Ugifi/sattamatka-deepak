import React, { useState, useEffect } from 'react';

const API_URL = 'https://ziddi-1-we11.onrender.com';

// ── FORGOT PASSWORD MODAL ─────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [step, setStep]         = useState(1); // 1=form, 2=success
  const [mobile, setMobile]     = useState('');
  const [name, setName]         = useState('');
  const [newPass, setNewPass]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');

  const handleReset = async () => {
    setErr('');
    if (!mobile || mobile.length !== 10) { setErr('Valid 10-digit mobile daalo'); return; }
    if (!name.trim())                    { setErr('Registered naam daalo'); return; }
    if (!newPass || newPass.length < 6)  { setErr('Naya password minimum 6 characters'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, name: name.trim(), new_password: newPass })
      });
      const data = await res.json();
      if (!data.success) { setErr(data.message || 'Kuch galat hua'); setLoading(false); return; }
      setStep(2);
    } catch (e) {
      setErr('Network error. Dobara try karo.');
    }
    setLoading(false);
  };

  return (
    <div style={M.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={M.box}>

        {/* Header */}
        <div style={M.header}>
          <div style={M.headerTitle}>🔑 Password Reset</div>
          <button style={M.closeBtn} onClick={onClose}>✕</button>
        </div>

        {step === 1 ? (
          <>
            <div style={M.subText}>
              Apna registered mobile number aur naam daalo. Match hone par naya password set ho jayega.
            </div>

            {/* Mobile */}
            <div style={M.fg}>
              <label style={M.lbl}>Mobile Number</label>
              <div style={M.inputWrap}>
                <span style={M.icon}>📱</span>
                <span style={M.prefix}>+91</span>
                <input
                  style={M.input}
                  type="tel"
                  placeholder="10-digit mobile"
                  maxLength={10}
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            {/* Name */}
            <div style={M.fg}>
              <label style={M.lbl}>Registered Naam</label>
              <div style={M.inputWrap}>
                <span style={M.icon}>👤</span>
                <input
                  style={M.input}
                  type="text"
                  placeholder="Wahi naam jo register karte time diya tha"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            {/* New Password */}
            <div style={M.fg}>
              <label style={M.lbl}>Naya Password</label>
              <div style={{ ...M.inputWrap, position: 'relative' }}>
                <span style={M.icon}>🔒</span>
                <input
                  style={{ ...M.input, paddingRight: 44 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                />
                <span style={M.eye} onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {err && <div style={M.errBox}>⚠️ {err}</div>}

            <button style={{ ...M.btn, opacity: loading ? 0.75 : 1 }} onClick={handleReset} disabled={loading}>
              {loading ? '⏳ Checking...' : '🔑 Reset Password'}
            </button>
          </>
        ) : (
          // Step 2: Success
          <div style={M.successWrap}>
            <div style={M.successIcon}>✅</div>
            <div style={M.successTitle}>Password Reset Ho Gaya!</div>
            <div style={M.successSub}>Ab naye password se login karo.</div>
            <button style={M.btn} onClick={onClose}>🚀 Login Karo</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Modal styles — Dark Theme
const M = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(2,20,15,0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 16,
  },
  box: {
    background: '#0a2e26', borderRadius: 20, padding: '24px 22px',
    width: '100%', maxWidth: 380,
    boxShadow: '0 0 30px rgba(0,255,213,0.1)',
    border: '1.5px solid rgba(0,255,213,0.2)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: 800, color: '#00ffd5' },
  closeBtn: {
    background: 'rgba(0,255,213,0.08)', border: '1px solid rgba(0,255,213,0.2)', borderRadius: 8,
    width: 32, height: 32, cursor: 'pointer',
    fontSize: 14, fontWeight: 700, color: '#00ffd5',
  },
  subText: {
    fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 18,
    lineHeight: 1.6, fontWeight: 600,
  },
  fg:  { marginBottom: 14 },
  lbl: { fontSize: 11, color: '#00ffd5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 7 },
  inputWrap: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(0,255,213,0.06)', border: '2px solid rgba(0,255,213,0.25)',
    borderRadius: 12, overflow: 'hidden',
  },
  icon:   { paddingLeft: 12, fontSize: 16, color: 'rgba(0,255,213,0.5)' },
  prefix: { padding: '0 6px 0 8px', color: '#00ffd5', fontWeight: 800, fontSize: 14 },
  input:  { flex: 1, background: 'transparent', border: 'none', padding: '12px 12px', color: '#fff', fontSize: 14, fontWeight: 600, outline: 'none' },
  eye:    { position: 'absolute', right: 12, cursor: 'pointer', fontSize: 17 },
  errBox: {
    background: 'rgba(255,23,68,0.1)', borderLeft: '4px solid #ff1744',
    borderRadius: 8, padding: '9px 12px',
    color: '#ff1744', fontSize: 12, fontWeight: 700, marginBottom: 14,
  },
  btn: {
    width: '100%', background: 'linear-gradient(90deg, #14f4ce, #e0800b)',
    color: '#001a17', border: 'none', borderRadius: 12,
    padding: '14px', fontSize: 14, fontWeight: 800,
    cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
    boxShadow: '0 6px 20px rgba(0,255,213,0.25)', marginTop: 4,
  },
  successWrap:  { textAlign: 'center', padding: '10px 0 4px' },
  successIcon:  { fontSize: 52, marginBottom: 14 },
  successTitle: { fontSize: 18, fontWeight: 900, color: '#00e676', marginBottom: 8 },
  successSub:   { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 22 },
};

// ── MAIN AUTH SCREEN ──────────────────────────────────────────────────────────
export default function AuthScreen({ onLogin }) {
  const [tab, setTab]               = useState('login');
  const [name, setName]             = useState('');
  const [mobile, setMobile]         = useState('');
  const [password, setPassword]     = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [err, setErr]               = useState('');
  const [loading, setLoading]       = useState(false);
  const [siteName, setSiteName]     = useState('SAKTA MATKA');
  const [showForgot, setShowForgot] = useState(false); // ← Forgot modal

  useEffect(() => {
    fetch(`${API_URL}/api/payment-info`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.site_name) setSiteName(d.data.site_name); })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) { setReferralCode(refCode.toUpperCase()); setTab('register'); }
  }, []);

  const go = async () => {
    setErr('');
    setLoading(true);
    try {
      let endpoint = '';
      let payload  = {};

      if (tab === 'login') {
        if (!mobile || !password) { setErr('Mobile aur password daalo'); setLoading(false); return; }
        endpoint = '/api/auth/login';
        payload  = { mobile, password };
      } else {
        if (!name || !mobile || !password) { setErr('Sab fields zaroori hain'); setLoading(false); return; }
        if (mobile.length !== 10)          { setErr('Valid 10-digit mobile daalo'); setLoading(false); return; }
        if (password.length < 6)           { setErr('Password minimum 6 characters'); setLoading(false); return; }
        endpoint = '/api/auth/register';
        payload  = { name, mobile, password };
        if (referralCode.trim()) payload.referral_code = referralCode.trim().toUpperCase();
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const res = await response.json();
      if (!res.success) { setErr(res.message || 'Failed'); setLoading(false); return; }
      localStorage.setItem('mk_token', res.token);
      onLogin(res.user);
    } catch (e) {
      setErr(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const switchTab = (t) => {
    setTab(t); setErr(''); setName(''); setMobile(''); setPassword('');
    if (t === 'login') setReferralCode('');
  };

  return (
    <div style={S.page}>
      {/* Forgot Password Modal */}
      {showForgot && (
        <ForgotPasswordModal onClose={() => setShowForgot(false)} />
      )}

      <div style={S.bgCircle1} />
      <div style={S.bgCircle2} />
      <div style={S.bgCircle3} />

      <div style={S.logoWrap}>
        <div style={S.logoCircle}>
          <img src="/th.jpg" alt="Logo" style={S.logoImg} />
        </div>
        <div style={S.logoText}>{siteName}</div>
        <div style={S.logoSub}>India's #1 Premium Matka Platform</div>
      </div>

      <div style={S.card}>
        <div style={S.tabs}>
          <div onClick={() => switchTab('login')} style={{ ...S.tab, ...(tab === 'login' ? S.tabActive : {}) }}>
            🔐 LOGIN
          </div>
          <div onClick={() => switchTab('register')} style={{ ...S.tab, ...(tab === 'register' ? S.tabActive : {}) }}>
            📝 REGISTER
          </div>
        </div>

        {tab === 'register' && (
          <div style={S.fg}>
            <label style={S.lbl}>Full Name</label>
            <div style={S.inputWrap}>
              <span style={S.icon}>👤</span>
              <input style={S.input} type="text" placeholder="Aapka pura naam" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
        )}

        <div style={S.fg}>
          <label style={S.lbl}>Mobile Number</label>
          <div style={S.inputWrap}>
            <span style={S.icon}>📱</span>
            <span style={S.prefix}>+91</span>
            <input style={{ ...S.input, paddingLeft: 4 }} type="tel" placeholder="10-digit mobile" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>

        <div style={S.fg}>
          <label style={S.lbl}>Password</label>
          <div style={S.inputWrap}>
            <span style={S.icon}>🔒</span>
            <input style={{ ...S.input, paddingRight: 44 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} />
            <span style={S.eye} onClick={() => setShowPass(p => !p)}>{showPass ? '🙈' : '👁️'}</span>
          </div>
        </div>

        {tab === 'register' && (
          <div style={S.fg}>
            <label style={S.lbl}>Referral Code <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(Optional)</span></label>
            <div style={S.inputWrap}>
              <span style={S.icon}>🎁</span>
              <input
                style={{ ...S.input, textTransform: 'uppercase' }}
                type="text"
                placeholder="Friend ka code daalo (optional)"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>
            {referralCode && (
              <div style={{ fontSize: 11, color: '#00ffd5', marginTop: 5, marginLeft: 4, fontWeight: 600 }}>
                🎉 Dono ko ₹50 bonus milega pehle deposit par!
              </div>
            )}
          </div>
        )}

        {err && <div style={S.errBox}>⚠️ {err}</div>}

        <button style={{ ...S.btn, opacity: loading ? 0.75 : 1 }} onClick={go} disabled={loading}>
          {loading ? '⏳ PROCESSING...' : tab === 'login' ? '🚀 SECURE LOGIN' : '✨ CREATE ACCOUNT'}
        </button>

        {/* ✅ FORGOT PASSWORD — ab kaam karta hai */}
        {tab === 'login' && (
          <div style={S.forgot} onClick={() => setShowForgot(true)}>
            🔑 Forgot Password?
          </div>
        )}

        {tab === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            🎁 Dosto ko refer karo, dono ko ₹50 bonus pao!
          </div>
        )}
      </div>

      <p style={S.footer}>18+ Only · Play Responsibly · © 2026 {siteName}</p>
    </div>
  );
}

// ── Dark Theme Tokens ──
const C = {
  navBg:    'linear-gradient(135deg, #021a14 0%, #063d35 60%, #0a4a3e 100%)',
  primary:  '#00ffd5',
  accent:   '#FFD700',
  textMain: '#ffffff',
  textSub:  '#00ffd5',
  textMuted:'rgba(255,255,255,0.45)',
  inputBg:  'rgba(0,255,213,0.06)',
  inputBdr: 'rgba(0,255,213,0.25)',
  danger:   '#ff1744',
  dangerBg: 'rgba(255,23,68,0.1)',
};

const S = {
  page: {
    minHeight: '100vh',
    background: C.navBg,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 16px 40px',
    fontFamily: '"Segoe UI", sans-serif',
    position: 'relative', overflow: 'hidden',
  },
  bgCircle1: { position: 'absolute', top: '-5%', left: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,255,213,0.04)', filter: 'blur(60px)', zIndex: 0 },
  bgCircle2: { position: 'absolute', bottom: '-10%', right: '-10%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,215,0,0.06)', filter: 'blur(70px)', zIndex: 0 },
  bgCircle3: { position: 'absolute', top: '40%', right: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,255,213,0.03)', filter: 'blur(50px)', zIndex: 0 },
  logoWrap: { position: 'relative', zIndex: 1, textAlign: 'center', padding: '50px 0 30px' },
  logoCircle: {
    width: 100, height: 100,
    background: 'rgba(0,255,213,0.1)', backdropFilter: 'blur(10px)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', boxShadow: '0 0 30px rgba(0,255,213,0.15)',
    border: '2px solid rgba(0,255,213,0.3)', overflow: 'hidden',
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  logoText: { fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2, textShadow: '0 2px 10px rgba(0,255,213,0.2)' },
  logoSub: { fontSize: 12, color: '#FFD700', marginTop: 6, fontWeight: 700, letterSpacing: 1 },
  card: {
    position: 'relative', zIndex: 1,
    background: '#0a2e26', borderRadius: 22, padding: '28px 24px',
    width: '100%', maxWidth: 400,
    boxShadow: '0 0 40px rgba(0,255,213,0.08)',
    border: '1.5px solid rgba(0,255,213,0.2)',
  },
  tabs: { display: 'flex', background: 'rgba(0,255,213,0.06)', borderRadius: 14, padding: 4, marginBottom: 24, border: '1px solid rgba(0,255,213,0.1)' },
  tab: { flex: 1, textAlign: 'center', padding: '12px 0', fontSize: 13, fontWeight: 800, cursor: 'pointer', borderRadius: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, transition: 'all 0.2s' },
  tabActive: { background: 'linear-gradient(90deg, #14f4ce, #e0800b)', color: '#001a17', boxShadow: '0 4px 14px rgba(0,255,213,0.25)' },
  fg: { marginBottom: 18 },
  lbl: { fontSize: 11, color: '#00ffd5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 7, marginLeft: 2 },
  inputWrap: { display: 'flex', alignItems: 'center', background: 'rgba(0,255,213,0.06)', border: '2px solid rgba(0,255,213,0.25)', borderRadius: 12, overflow: 'hidden', position: 'relative' },
  icon: { paddingLeft: 14, fontSize: 17, color: 'rgba(0,255,213,0.5)' },
  prefix: { padding: '0 6px 0 10px', color: '#00ffd5', fontWeight: 800, fontSize: 15 },
  input: { flex: 1, background: 'transparent', border: 'none', padding: '13px 14px', color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none' },
  eye: { position: 'absolute', right: 14, cursor: 'pointer', fontSize: 18 },
  errBox: { background: 'rgba(255,23,68,0.1)', borderLeft: '4px solid #ff1744', borderRadius: 8, padding: '10px 14px', color: '#ff1744', fontSize: 13, fontWeight: 700, marginBottom: 16 },
  btn: { width: '100%', background: 'linear-gradient(90deg, #14f4ce, #e0800b)', color: '#001a17', border: 'none', borderRadius: 12, padding: '15px', fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase', boxShadow: '0 6px 20px rgba(0,255,213,0.25)', marginTop: 8 },
  forgot: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#00ffd5', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' },
  footer: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 28, zIndex: 1, fontWeight: 600 },
};
