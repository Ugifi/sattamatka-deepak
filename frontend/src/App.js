import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import ChartPage from './pages/ChartPage';
import AuthScreen from './components/AuthScreen';
import Toast from './components/Toast';
import { DepositModal } from './pages/OtherPages';
import { WithdrawModal } from './components/Modals';

import HomeScreen from './pages/HomeScreen';
import GameTypePage from './pages/GameTypePage';
import BetForm from './pages/BetForm';
import { BidsPage, TxnsPage, WalletPage, SupportPage, HowToPlayPage, FAQPage, TermsPage, PrivacyPage, ReferralPage, GameRatesPage } from './pages/OtherPages';
import AdminPanel, { AdminLogin } from './pages/AdminPanel';

import { INIT_BIDS, INIT_TXNS } from './data/gameData';

const API = 'https://yonomatka.com';


function apiCall(path, method = 'GET', body = null) {
  const token = localStorage.getItem('mk_token');
  return fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  }).then(r => r.json());
}

// ── SVG ICONS ─────────────────────────────────────────────────────────────────
const IconTransaction = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8"/>
    <line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="7" y1="16" x2="13" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconBids = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="9" y1="17" x2="12" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconHome = ({ size = 26, color = '#00ffd5' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 17L4.5 7L9 12L12 4L15 12L19.5 7L22 17H2Z" fill={color} opacity="0.2"/>
    <path d="M2 17L4.5 7L9 12L12 4L15 12L19.5 7L22 17" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <rect x="2" y="17" width="20" height="3" rx="1.5" fill={color}/>
    <circle cx="4.5" cy="6.5" r="1.5" fill={color}/>
    <circle cx="12" cy="3.5" r="1.5" fill={color}/>
    <circle cx="19.5" cy="6.5" r="1.5" fill={color}/>
  </svg>
);

const IconWallet = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke={color} strokeWidth="1.8"/>
    <path d="M16 3L20 7H4L8 3H16Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <circle cx="17" cy="14" r="2" stroke={color} strokeWidth="1.6"/>
  </svg>
);

const IconSupport = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8" cy="10" r="1" fill={color}/>
    <circle cx="12" cy="10" r="1" fill={color}/>
    <circle cx="16" cy="10" r="1" fill={color}/>
  </svg>
);


// ── DARK DRAWER ───────────────────────────────────────────────────────────────
function BlueDrawer({ user, onClose, onNav, onLogout, wallet }) {
  const [waNumber, setWaNumber] = React.useState('919999999999');
  const [tgId, setTgId]         = React.useState('matkaking_support');

 React.useEffect(() => {
  apiCall('/api/payment-info').then(res => {
    if (res?.success && res?.data) {
      const d = res.data;
      const wa = d.whatsapp_support || d.phone || '';
      const tg = d.telegram || '';
      if (wa) {
        const num = wa.replace(/\D/g, '');
        setWaNumber(num.startsWith('91') ? num : `91${num}`);
      }
      if (tg) { setTgId(tg); return; }
    }
    return apiCall('/api/admin/settings');
  }).then(res => {
    if (res?.success && res?.settings) {
      const s = res.settings;
      if (s.whatsapp_support || s.phone) {
        const num = (s.whatsapp_support || s.phone).replace(/\D/g, '');
        setWaNumber(num.startsWith('91') ? num : `91${num}`);
      }
      if (s.telegram) setTgId(s.telegram);
    }
  }).catch(() => {});
}, []);

  const menuItems = [
    { section: 'ACCOUNT' },
    { ic: '👛', label: 'My Wallet',           id: 'wallet' },
    { ic: '📋', label: 'Transaction History', id: 'txns' },
    { ic: '✏️', label: 'Edit Profile',        id: 'profile' },
    { ic: '🎁', label: 'Refer & Earn',        id: 'referral' },
    { section: 'GAMES' },
    { ic: '🎮', label: 'All Games',           id: 'home' },
    { ic: '🏆', label: 'Win History',         id: 'bids' },
    { section: 'HELP & SUPPORT' },
   { ic: '💬', label: 'WhatsApp Support',    id: 'wa',  action: () => window.open(`https://wa.me/${waNumber}`,'_blank') },
{ ic: '✈️', label: 'Telegram Support',   id: 'tg',  action: () => window.open(`https://t.me/${tgId}`,'_blank') },
    { ic: '📖', label: 'How to Play',         id: 'htp' },
    { ic: '🎰', label: 'Game Rates',          id: 'gamerates' },
    { ic: '❓', label: 'FAQ',                 id: 'faq' },
    { ic: '📜', label: 'Terms & Conditions',  id: 'terms' },
    { ic: '🔒', label: 'Privacy Policy',      id: 'privacy' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:500, backdropFilter:'blur(3px)' }} />
      <div style={{ position:'fixed', top:0, left:0, width:280, height:'100%', background:'#011a13', zIndex:501, overflowY:'auto', animation:'slideDrawerIn 0.25s ease', boxShadow:'4px 0 24px rgba(0,255,213,0.08)', paddingBottom:40, borderRight:'1px solid rgba(0,255,213,0.1)' }}>
        <style>{`
          @keyframes slideDrawerIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          .drawer-menu-item:hover { background: rgba(0,255,213,0.06) !important; transform: translateX(4px); }
        `}</style>

        <div style={{ background:'linear-gradient(135deg, #021a14, #063d35)', padding:'20px 16px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid rgba(0,255,213,0.1)' }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <img src="/yono.png" alt="avatar" style={{ width:50, height:50, borderRadius:'50%', border:'2px solid rgba(255,215,0,0.5)', flexShrink:0, objectFit:'cover' }} />
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:2 }}>{user?.name || 'Player'}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{user?.mobile || ''}</div>
              <div style={{ fontSize:11, color:'#00ffd5', marginTop:2 }}>
                💰 Rs.{Number(wallet || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}
              </div>
            </div>
          </div>
          <div onClick={onClose} style={{ color:'#00ffd5', fontSize:22, cursor:'pointer', padding:'2px 4px', lineHeight:1 }}>✕</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'14px 12px', borderBottom:'1px solid rgba(0,255,213,0.08)', background:'#0a2e26' }}>
          {[{ ic:'💰', label:'Add Fund', id:'add' }, { ic:'💸', label:'Withdraw', id:'with' }, { ic:'🎯', label:'My Bids', id:'bids' }].map(btn => (
            <div key={btn.id} onClick={() => { onNav(btn.id); onClose(); }}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer', padding:'8px 4px', borderRadius:10, transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,213,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width:40, height:40, background:'rgba(0,255,213,0.08)', border:'1.5px solid rgba(0,255,213,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{btn.ic}</div>
              <div style={{ fontSize:11, color:'#00ffd5', fontWeight:700, textAlign:'center' }}>{btn.label}</div>
            </div>
          ))}
        </div>

        {menuItems.map((item, i) => {
          if (item.section) return (
            <div key={i} style={{ fontSize:10, color:'#00ffd5', letterSpacing:2, textTransform:'uppercase', padding:'14px 16px 4px', fontWeight:700 }}>{item.section}</div>
          );
          return (
            <div key={i} className="drawer-menu-item"
              onClick={() => { if (item.action) item.action(); else onNav(item.id); onClose(); }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', cursor:'pointer', borderBottom:'1px solid rgba(0,255,213,0.06)', transition:'all 0.15s' }}>
              <div style={{ width:36, height:36, background:'rgba(0,255,213,0.08)', border:'1px solid rgba(0,255,213,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.ic}</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>{item.label}</div>
              <div style={{ marginLeft:'auto', color:'#00ffd5', fontSize:18 }}>›</div>
            </div>
          );
        })}

        <div onClick={onLogout}
          style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', cursor:'pointer', marginTop:8, borderTop:'1px solid rgba(0,255,213,0.08)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,23,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width:36, height:36, background:'rgba(255,23,68,0.08)', border:'1px solid rgba(255,23,68,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🚪</div>
          <div style={{ fontSize:15, fontWeight:700, color:'#ff1744' }}>Logout</div>
        </div>
      </div>
    </>
  );
}

// ── PROFILE SCREEN ────────────────────────────────────────────────────────────
function ProfileScreen({ user, showToast }) {
  const [waNumber, setWaNumber] = React.useState('919999999999');
  const [tgId, setTgId]         = React.useState('matkaking_support');

 React.useEffect(() => {
  apiCall('/api/payment-info').then(res => {
    if (res?.success && res?.data) {
      const d = res.data;
      const wa = d.whatsapp_support || d.phone || '';
      const tg = d.telegram || '';
      if (wa) {
        const num = wa.replace(/\D/g, '');
        setWaNumber(num.startsWith('91') ? num : `91${num}`);
      }
      if (tg) { setTgId(tg); return; }
    }
    return apiCall('/api/admin/settings');
  }).then(res => {
    if (res?.success && res?.settings) {
      const s = res.settings;
      if (s.whatsapp_support || s.phone) {
        const num = (s.whatsapp_support || s.phone).replace(/\D/g, '');
        setWaNumber(num.startsWith('91') ? num : `91${num}`);
      }
      if (s.telegram) setTgId(s.telegram);
    }
  }).catch(() => {});
}, []);

  const [name, setName]         = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!name) return showToast('Naam khali nahi chhod sakte!', 'err');
    setUpdating(true);
    try {
      const token = localStorage.getItem('mk_token');
      if (password) {
        if (password.length < 6) throw new Error('Password min 6 characters ka ho');
        const resPass = await apiCall('/api/auth/update-password', 'POST', { newPassword: password });
        if (!resPass.success) throw new Error(resPass.message || 'Password update fail');
      }
      const response = await fetch(`${API}/api/auth/update-profile`, {
        method:'POST',
        headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ name })
      });
      const resProfile = await response.json();
      if (resProfile.success) { showToast('Profile Updated! 🚀', 'ok'); setPassword(''); }
      else throw new Error(resProfile.message || 'Profile update fail');
    } catch (err) { showToast(err.message || 'Server error!', 'err'); }
    finally { setUpdating(false); }
  };

  const inp = { width:'100%', padding:'12px 14px', borderRadius:10, border:'2px solid rgba(0,255,213,0.25)', background:'rgba(0,255,213,0.06)', color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'inherit', marginBottom:14 };
  const lbl = { fontSize:11, color:'#00ffd5', fontWeight:700, textTransform:'uppercase', letterSpacing:2, display:'block', marginBottom:6 };

  return (
    <div style={{ background:'#021a14', minHeight:'100vh', paddingBottom:80 }}>
      <div style={{ background:'linear-gradient(135deg, #021a14, #063d35)', padding:'24px 20px', textAlign:'center', borderBottom:'1px solid rgba(0,255,213,0.1)' }}>
        <img src="/yono.png" alt="avatar" style={{ width:50, height:50, borderRadius:'40%', border:'2px solid rgba(255,215,0,0.5)', flexShrink:0, objectFit:'cover' }} />
        <div style={{ color:'#fff', fontWeight:800, fontSize:18 }}>{user?.name || 'User'}</div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:2 }}>📱 {user?.mobile || '—'}</div>
      </div>

      <div style={{ background:'#0a2e26', margin:'12px', borderRadius:14, padding:'16px', border:'1.5px solid rgba(0,255,213,0.15)', boxShadow:'0 4px 16px rgba(0,255,213,0.06)' }}>
        <label style={lbl}>Mobile Number</label>
        <input value={user?.mobile || ''} disabled style={{ ...inp, background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.35)', cursor:'not-allowed', border:'2px solid rgba(255,255,255,0.08)' }} />
        <label style={lbl}>Full Name</label>
        <input value={name} onChange={e => setName(e.target.value)} style={inp} />
        <label style={lbl}>New Password (Optional)</label>
        <input type="password" placeholder="Naya password (min 6 char)" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp, marginBottom:0 }} />
        <button onClick={handleUpdate} disabled={updating}
          style={{ width:'100%', marginTop:14, background:'linear-gradient(90deg, #14f4ce, #e0800b)', color:'#001a17', border:'none', borderRadius:12, padding:14, fontSize:15, fontWeight:800, cursor:updating?'not-allowed':'pointer', opacity:updating?0.6:1, letterSpacing:2, textTransform:'uppercase', boxShadow:'0 4px 14px rgba(0,255,213,0.25)' }}>
          {updating ? '⏳ Saving...' : '💾 UPDATE PROFILE'}
        </button>
      </div>

      <div style={{ background:'#0a2e26', margin:'0 12px', borderRadius:14, overflow:'hidden', border:'1.5px solid rgba(0,255,213,0.15)', boxShadow:'0 4px 16px rgba(0,255,213,0.06)' }}>
        <div style={{ padding:'12px 16px', background:'rgba(0,255,213,0.06)', borderBottom:'1px solid rgba(0,255,213,0.1)', fontSize:12, fontWeight:800, color:'#00ffd5', textTransform:'uppercase', letterSpacing:1 }}>🎧 Help & Support</div>
        <div onClick={() => window.open(`https://wa.me/${waNumber}`,'_blank')} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:'1px solid rgba(0,255,213,0.06)', cursor:'pointer' }}>
          <div style={{ width:40, height:40, background:'rgba(0,230,118,0.08)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>💬</div>
          <div style={{ flex:1 }}><div style={{ fontWeight:700, color:'#fff' }}>WhatsApp Support</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>+91 9999999999</div></div>
          <div style={{ color:'#00ffd5', fontSize:20 }}>›</div>
        </div>
        <div onClick={() => window.open(`https://t.me/${tgId}`,'_blank')} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', cursor:'pointer' }}>
          <div style={{ width:40, height:40, background:'rgba(0,255,213,0.08)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>✈️</div>
          <div style={{ flex:1 }}><div style={{ fontWeight:700, color:'#fff' }}>Telegram Support</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Quick reply in 5 mins</div></div>
          <div style={{ color:'#00ffd5', fontSize:20 }}>›</div>
        </div>
      </div>
    </div>
  );
}

// ── CATEGORY GAMES SCREEN ─────────────────────────────────────────────────────
function CategoryGamesScreen({ category, apiCategory, onPlay }) {
  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const fetchCat = apiCategory || category;
        const res = await fetch(`${API}/api/games?category=${fetchCat}`, { headers:{ 'Authorization':`Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setGames(Array.isArray(data.games) ? data.games : []);
      } catch { } finally { setLoading(false); }
    };
    fetchGames();
  }, [category, apiCategory]);

  const formatResult = g => {
    if (g.open_result || g.close_result)
      return `${g.open_result || '***'}-${g.jodi_result || '--'}-${g.close_result || '***'}`;
    return '***_**_***';
  };

  const isRunning = g => g.status === 'open';

  return (
    <div style={{ background:'#021a14', minHeight:'100vh', paddingBottom:80, fontFamily:"'Nunito','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .cg-card { background: #0a2e26; border-radius: 16px; margin: 0 12px 12px; overflow: visible; box-shadow: 0 4px 16px rgba(0,255,213,0.06); transition: transform 0.2s, box-shadow 0.2s; border: 1px solid rgba(0,255,213,0.15); padding: 14px 16px; }
        .cg-card:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(0,255,213,0.12); }
        .cg-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:4px; }
        .cg-card-name { font-family:'Nunito',sans-serif; font-size:18px; font-weight:900; color:#fff; letter-spacing:0.5px; text-transform:uppercase; line-height:1.2; }
        .cg-result { font-size:14px; font-weight:700; color:#00ffd5; letter-spacing:2px; margin-bottom:6px; }
        .cg-status-running { display:inline-flex; align-items:center; gap:5px; font-size:13px; font-weight:700; color:#00e676; margin-bottom:8px; }
        .cg-status-closed  { display:inline-flex; align-items:center; gap:5px; font-size:13px; font-weight:700; color:#ff1744; margin-bottom:8px; }
        .cg-pulse-dot { width:8px; height:8px; border-radius:50%; background:#00e676; animation:cgPulse 1.4s ease-in-out infinite; flex-shrink:0; }
        @keyframes cgPulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.65);} }
        .cg-bottom-row { display:flex; align-items:center; justify-content:space-between; margin-top:2px; }
        .cg-time-wrap { display:flex; align-items:center; gap:16px; }
        .cg-time-lbl { font-size:12px; color:rgba(255,255,255,0.4); font-weight:600; margin-bottom:1px; }
        .cg-time-val { font-size:14px; font-weight:700; color:#00ffd5; }
        .cg-divider-v { width:1px; height:32px; background:rgba(0,255,213,0.15); flex-shrink:0; }
        .cg-play-circle { width:48px; height:48px; border-radius:50%; border:none; background:linear-gradient(90deg, #14f4ce, #e0800b); color:#001a17; font-size:17px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow:0 4px 14px rgba(0,255,213,0.30); transition:transform 0.2s, box-shadow 0.2s; margin-top:-28px; }
        .cg-play-circle:hover { transform:scale(1.1); box-shadow:0 6px 20px rgba(0,255,213,0.40); }
        .cg-play-circle:active { transform:scale(0.95); }
        .cg-section-label { padding:4px 12px 8px; font-size:13px; font-weight:800; color:#00ffd5; letter-spacing:2px; text-transform:uppercase; display:flex; align-items:center; gap:6px; }
        .cg-section-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(0,255,213,0.3),transparent); }
        .cg-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:14px; }
        .cg-loader-ring { width:44px; height:44px; border:4px solid rgba(0,255,213,0.15); border-top-color:#00ffd5; border-radius:50%; animation:cgSpin 0.8s linear infinite; }
        @keyframes cgSpin { to { transform:rotate(360deg); } }
      `}</style>

      <div style={{ background:'linear-gradient(135deg, #021a14, #063d35)', padding:'16px', textAlign:'center', borderBottom:'1px solid rgba(0,255,213,0.1)', boxShadow:'0 2px 12px rgba(0,255,213,0.08)' }}>
        <div style={{ fontSize:32, marginBottom:4 }}>
          {category === 'starline' ? '⭐' : category === 'jackpot' ? '🎰' : '🎯'}
        </div>
        <div style={{ color:'#fff', fontSize:20, fontWeight:900, letterSpacing:2, textTransform:'uppercase' }}>
          {category === 'starline' ? 'Matka Starline' : category === 'jackpot' ? 'KING JACKPOT' : 'DISAWAR'} GAMES
        </div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, marginTop:2 }}>
          {games.filter(g => g.status === 'open').length} Games Open
        </div>
      </div>

      <div className="cg-section-label" style={{ marginTop:12 }}>🎮 Live Markets</div>

      {loading ? (
        <div className="cg-loader">
          <div className="cg-loader-ring" />
          <span style={{ color:'#00ffd5', fontWeight:700, fontSize:14 }}>Loading Games...</span>
        </div>
      ) : games.length === 0 ? (
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.4)', padding:60 }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🚫</div>Koi game available nahi hai.
        </div>
      ) : (
        games.map(g => {
          const open = isRunning(g);
          return (
            <div key={g.id} className="cg-card">
              <div className="cg-card-top">
                <div className="cg-card-name">{g.name}</div>
                <svg width="38" height="38" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink:0 }}>
                  <rect x="4" y="7" width="34" height="31" rx="4" stroke="#00ffd5" strokeWidth="2.2" fill="rgba(0,255,213,0.06)"/>
                  <path d="M4 15H38" stroke="#00ffd5" strokeWidth="2.2"/>
                  <path d="M14 4V10M28 4V10" stroke="#00ffd5" strokeWidth="2.5" strokeLinecap="round"/>
                  <rect x="10" y="20" width="5" height="4" rx="1" fill="#00ffd5"/>
                  <rect x="19" y="20" width="5" height="4" rx="1" fill="#00ffd5"/>
                  <rect x="28" y="20" width="4" height="4" rx="1" fill="#00ffd5"/>
                  <rect x="10" y="28" width="5" height="4" rx="1" fill="#00ffd5"/>
                  <rect x="19" y="28" width="5" height="4" rx="1" fill="#00ffd5"/>
                </svg>
              </div>

              <div className="cg-result">{formatResult(g)}</div>

              {open ? (
                <div className="cg-status-running"><span className="cg-pulse-dot"/>Betting is Running for today</div>
              ) : (
                <div className="cg-status-closed"><span style={{ width:8, height:8, borderRadius:'50%', background:'#ff1744', display:'inline-block', flexShrink:0 }}/>Market Closed</div>
              )}

              <div className="cg-bottom-row">
                <div className="cg-time-wrap">
                  <div>
                    <div className="cg-time-lbl">Time Open :</div>
                    <div className="cg-time-val">{g.open_time || '--:--'}</div>
                  </div>
                  <div className="cg-divider-v"/>
                  <div>
                    <div className="cg-time-lbl">Time Close :</div>
                    <div className="cg-time-val">{g.close_time || '--:--'}</div>
                  </div>
                </div>
                <button className="cg-play-circle"
                  onClick={() => open && onPlay(g)} disabled={!open}
                  style={!open ? { background:'#3a3a3a', color:'#666', cursor:'not-allowed', boxShadow:'none', marginTop:'-28px' } : {}}>
                  {open ? <span style={{ marginLeft:3 }}>▶</span> : <span>▷</span>}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.search.includes('admin=1');

  const [language, setLanguage] = useState('en');
  

  const [user, setUser]                   = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [videoEnded, setVideoEnded]   = useState(false);
  const [tab, setTab]                     = useState('home');
  const [wallet, setWallet]               = useState(0);
  const [bids, setBids]                   = useState(INIT_BIDS);
  const [txns, setTxns]                   = useState(INIT_TXNS);
  const [modal, setModal]                 = useState(null);
  const [drawer, setDrawer]               = useState(false);
  const [toast, setToast]                 = useState(null);
  const [selectedGame, setSelectedGame]   = useState(null);
  const [selectedType, setSelectedType]   = useState(null);
  const [returnToDisawar, setReturnToDisawar] = useState(false);
  const [showDisawarOnHome, setShowDisawarOnHome] = useState(false);
  const [page, setPage]                   = useState('home');
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => !!localStorage.getItem('mk_token') && localStorage.getItem('mk_admin_logged') === '1');
  const [siteName, setSiteName]           = useState('SATTA KING');
  const [showNotices, setShowNotices]     = useState(false);
  const [noticesData, setNoticesData]     = useState([]);

  const walletRef        = useRef(0);
  const bidSubmittingRef = useRef(false);
  const prevPageRef      = useRef('home');

  useEffect(() => {
    return () => { prevPageRef.current = page; };
  }, [page]);

  const showToast = (msg, type = 'ok') => setToast({ msg, type });

  useEffect(() => {
    const token = localStorage.getItem('mk_token');
    if (!token) { setAuthLoading(false); return; }
    apiCall('/api/auth/profile')
      .then(res => {
        if (res?.success && res?.user) {
          setUser(prev => ({ ...prev, ...res.user }));
        } else {
          localStorage.removeItem('mk_token');
        }
      })
      .catch(() => localStorage.removeItem('mk_token'))
      .finally(() => setAuthLoading(false));
  }, []);

  const fetchWallet = useCallback(() => {
    if (!localStorage.getItem('mk_token')) return;
    return apiCall('/api/wallet/balance').then(d => {
      if (d?.success) {
        const total = Number(d.wallet_balance || 0) + Number(d.winning_balance || 0);
        walletRef.current = total; setWallet(total);
        return { total };
      }
      return null;
    }).catch(() => null);
  }, []);

  useEffect(() => { if (user) fetchWallet(); }, [user, fetchWallet]);

  useEffect(() => {
   apiCall('/api/payment-info')
  .then(res => {
    if (res?.success && res?.data) {
      const d = res.data;
      if (d.site_name) setSiteName(d.site_name);
      if (d.whatsapp_support || d.phone) {
        const num = (d.whatsapp_support || d.phone).replace(/\D/g, '');
        window._mkWaNumber = num.startsWith('91') ? num : `91${num}`;
      }
      if (d.telegram) window._mkTgId = d.telegram;
      if (d.site_name) return null;
    }
    return apiCall('/api/admin/settings');
  })
  .then(res => {
    if (!res) return;
    if (res?.success && res?.settings) {
      const s = res.settings;
      if (s.site_name) setSiteName(s.site_name);
      if (s.whatsapp_support || s.phone) {
        const num = (s.whatsapp_support || s.phone).replace(/\D/g, '');
        window._mkWaNumber = num.startsWith('91') ? num : `91${num}`;
      }
      if (s.telegram) window._mkTgId = s.telegram;
    }
  })
  .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchWallet, 30000);
    return () => clearInterval(interval);
  }, [user, fetchWallet]);

  const handleLogin = u => {
    setUser(u);
    setWallet(0);
    walletRef.current = 0;
    setTimeout(() => {
      apiCall('/api/auth/profile')
        .then(res => { if (res?.success && res?.user) setUser(prev => ({ ...prev, ...res.user })); })
        .catch(() => {});
    }, 500);
  };
  const handleAdd  = amt => { fetchWallet(); showToast(`Rs.${amt.toLocaleString()} added!`); };
  const handleWith = amt => { fetchWallet(); showToast(`Withdrawal Rs.${amt.toLocaleString()} sent`); };

  const handleBidSubmit = async (data) => {
    if (bidSubmittingRef.current) { showToast('Bid processing ho rahi hai... ruko!', 'err'); return; }
    bidSubmittingRef.current = true;
    const amount = data.totalAmt || data.amount || 0;
    try {
      const fresh = await fetchWallet();
      const currentBalance = fresh ? fresh.total : walletRef.current;
      if (amount > currentBalance) {
        showToast(`Insufficient balance! Available: Rs.${currentBalance.toLocaleString()}`, 'err');
        bidSubmittingRef.current = false;
        return;
      }

      if (data.__bulk) {
        const result = await apiCall('/api/games/bid/bulk', 'POST', {
          game_id:   selectedGame.id,
          game_type: selectedType.id,
          session:   data.session,
          bids:      data.numbers
        });
       if (result.success) {
  showToast(`${result.bids_placed} bids placed! Rs.${result.total_amount} deducted.`);
  await fetchWallet();
  const cat = selectedGame?.game_category;
  const isDisawarHome = returnToDisawar && cat === 'disawar';
  setReturnToDisawar(false);
  setShowDisawarOnHome(isDisawarHome);
  const backPage = cat==='starline'?'home':cat==='jackpot'?'jackpot': isDisawarHome ? 'home' : cat==='disawar'?'disawar':'home';
  setPage(backPage); setSelectedGame(null); setSelectedType(null);
        } else {
          showToast(result.message || 'Bulk bid failed!', 'err');
          await fetchWallet();
        }
        bidSubmittingRef.current = false;
        return;
      }

      const res = await apiCall('/api/games/bid', 'POST', {
        game_id:   selectedGame.id,
        game_type: selectedType.id,
        number:    data.number,
        amount:    data.amount,
        session:   data.session || 'open'
      });
      if (!res.success) {
        showToast(res.message || 'Bid failed!', 'err');
        await fetchWallet();
        bidSubmittingRef.current = false;
        return;
      }
      await fetchWallet();
showToast(`Bid Rs.${amount.toLocaleString()} placed!`);
const cat = selectedGame?.game_category;
const isDisawarHome = returnToDisawar && cat === 'disawar';
setReturnToDisawar(false);
setShowDisawarOnHome(isDisawarHome);
const backPage = cat==='starline'?'home':cat==='jackpot'?'jackpot': isDisawarHome ? 'home' : cat==='disawar'?'disawar':'home';
setPage(backPage); setSelectedGame(null); setSelectedType(null);

    } catch {
      await fetchWallet();
      showToast('Network error! Dobara try karo.', 'err');
    } finally {
      bidSubmittingRef.current = false;
    }
  };

  const navigate = id => {
    setPage(id);
    const validTabs = ['home','bids','disawar','jackpot','wallet','profile','game','txns','support','referral'];
    if (validTabs.includes(id)) setTab(id);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleNav = id => {
    fetchWallet();
    if (id === 'add') setModal('add');
    else if (id === 'with') setModal('with');
    else { setPage(id); setSelectedGame(null); setSelectedType(null); setTab(id); }
  };
    const handleViewChart = g => {
    setSelectedGame(g);
    setPage('chart');
    setTab('game');
    window.scrollTo(0, 0);
  };

  const goBack = () => {
  if (page === 'bet-form') {
    if (returnToDisawar) {
      setReturnToDisawar(false);
      setShowDisawarOnHome(true);
      setPage('home');
      setTab('home');
      setSelectedType(null);
      setSelectedGame(null);
    } else {
      setPage('game-types'); setSelectedType(null);
    }
  }
  else if (page === 'game-types') {
    const from = prevPageRef.current;
    if (['home','starline','jackpot','disawar'].includes(from)) {
      setPage(from);
    } else {
      setPage('home'); setTab('game');
    }
    setSelectedGame(null);
  }
  else if (page === 'chart') {
    const from = prevPageRef.current;
    if (['home','starline','jackpot','disawar'].includes(from)) {
      setPage(from);
    } else {
      setPage('home'); setTab('game');
    }
    setSelectedGame(null);
  }
  else {
    setPage('home'); setTab('game');
  }
};

  if (isAdmin) {
    if (!adminLoggedIn) return <AdminLogin onLogin={() => { localStorage.setItem('mk_admin_logged', '1'); setAdminLoggedIn(true); }} />;
    return <AdminPanel onLogout={() => setAdminLoggedIn(false)} />;
  }


if (!videoEnded) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#021a14', overflow:'hidden' }}>
      <video
        src="/video.mp4"
        autoPlay
        muted
        playsInline
        onEnded={() => setVideoEnded(true)}
        ref={el => {
          if (el) {
            el.muted = false;
            el.play().catch(() => { el.muted = true; el.play(); });
          }
        }}
        style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          height:'100%', width:'auto', maxWidth:'none'
        }}
      />
    </div>
  );
}

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isTxnTab  = page === 'txns';
  const isSubPage = ['game-types','bet-form','starline','disawar','jackpot','chart'].includes(page);
  const navTitle  = page==='game-types' ? selectedGame?.name : page==='bet-form' ? selectedType?.label : page==='starline' ? 'Matka Starline' : page==='jackpot' ? 'KING JACKPOT' : page==='disawar' ? 'DISAWAR' : page==='chart' ? '📊 Chart' : null;

  return (
    <>
      <style>{`
        .topnav { background: linear-gradient(135deg, #021a14, #063d35) !important; border-bottom: 1px solid rgba(0,255,213,0.1) !important; box-shadow: 0 2px 12px rgba(0,255,213,0.08) !important; }
        .brand { color: #f4f13e !important; text-shadow: 0 1px 6px rgba(0,255,213,0.15) !important; font-family: 'Baloo 2','Nunito',sans-serif !important; letter-spacing: 2px !important; }
        .back-btn { color: #fff !important; }
        .hamburger span { background: #00ffd5 !important; }
        .tn-wallet { background: rgba(0,255,213,0.1) !important; border: 1.5px solid rgba(0,255,213,0.25) !important; border-radius: 20px !important; }
        .tn-wallet span { color: #00ffd5 !important; }
        .tn-bell { background: rgba(0,255,213,0.1) !important; border: 1.5px solid rgba(0,255,213,0.2) !important; }
        .bell-dot { background: #ff1744 !important; }
        .botnav { background: #0a2e26 !important; border-top: 1px solid rgba(0,255,213,0.1) !important; box-shadow: 0 -4px 16px rgba(0,255,213,0.06) !important; }
        .bn-item svg { color: rgba(0,255,213,0.4); }
        .bn-item span:last-child { color: rgba(255,255,255,0.4) !important; font-size: 10px !important; font-weight: 600 !important; font-family: sans-serif !important; letter-spacing: 0 !important; }
        .bn-item.active svg { color: #00ffd5 !important; }
        .bn-item.active span:last-child { color: #00ffd5 !important; font-weight: 700 !important; }
        .bn-item:hover { background: rgba(0,255,213,0.06) !important; }
        .bn-item:hover svg { color: #00ffd5 !important; }
        .home-circle { background: linear-gradient(90deg, #14f4ce, #e0800b) !important; box-shadow: 0 4px 16px rgba(0,255,213,0.35) !important; border: 3px solid #0a2e26 !important; }
        .notif-modal-header { background: linear-gradient(135deg, #021a14, #063d35) !important; }
        input::placeholder { color: rgba(255,255,255,0.3) !important; }
        option { background: #0a2e26; color: #fff; }
      `}</style>

      {/* TOP NAV */}
      <div className="topnav">
        <div className="tn-left">
          {isSubPage
            ? <div className="back-btn" onClick={goBack} style={{ color:'#ffffff', fontSize:26, cursor:'pointer', padding:'4px 8px 4px 0' }}>‹</div>
            : <div className="hamburger" onClick={() => setDrawer(true)}><span/><span/><span/></div>
          }
          {isSubPage 
  ? <span className="brand">{navTitle || 'BACK'}</span>
  : <img 
      src="/yono.png" 
      alt={siteName}
      style={{ height: 46, width: 'auto', objectFit: 'contain' }}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
}
        </div>
        <div className="tn-right">
          {!isTxnTab && (
            <div className="tn-wallet" onClick={() => { fetchWallet(); setPage('wallet'); setTab('wallet'); }}>
              <span>🪙</span>
              <span>Rs.{wallet.toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}</span>
            </div>
          )}
          <div className="tn-bell" style={{ cursor:'pointer' }} onClick={() => {
            apiCall('/api/notices').then(res => {
              if (res?.success) setNoticesData(res.notices || []);
              setShowNotices(true);
            }).catch(() => setShowNotices(true));
          }}>
            🔔<div className="bell-dot"/>
          </div>
        </div>
      </div>

      {/* PAGES */}
  {page === 'home' && <HomeScreen wallet={wallet} onAdd={() => setModal('add')} onWith={() => setModal('with')} openDisawar={showDisawarOnHome} onDisawarOpened={() => setShowDisawarOnHome(false)} onPlay={(g, gt) => { 
    setSelectedGame(g); 
    if (gt) {
      setSelectedType(gt);
      setReturnToDisawar(true);
      setPage('bet-form');
    } else {
      setReturnToDisawar(false);
      setPage('game-types');
    }
    setTab('game');
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }} navigate={navigate} apiCall={apiCall} onViewChart={handleViewChart} />}
      {page === 'profile'    && <ProfileScreen user={user} showToast={showToast} />}
      {page === 'game-types' && <GameTypePage game={selectedGame} onSelect={gt => { setSelectedType(gt); setPage('bet-form'); }} />}
      
      {page === 'bet-form'   && <BetForm game={selectedGame} gameType={selectedType} wallet={wallet} onSubmit={handleBidSubmit} />}
            {page === 'chart'     && <ChartPage game={selectedGame} apiCall={apiCall} />}
{page === 'starline' && <CategoryGamesScreen category="starline" onPlay={g => { setSelectedGame(g); setPage('game-types'); setTab('game'); window.scrollTo(0,0); }} />}   
     {page === 'jackpot'    && <CategoryGamesScreen category="jackpot" apiCategory="disawar" onPlay={g => { setSelectedGame(g); setPage('game-types'); }} />}
      {page === 'disawar'    && <CategoryGamesScreen category="disawar" onPlay={g => { setSelectedGame(g); setPage('game-types'); }} />}
      {page === 'bids'       && <BidsPage apiCall={apiCall}/>}
      {page === 'txns'       && <TxnsPage apiCall={apiCall} navigate={navigate}/>}
      {page === 'wallet' && <WalletPage wallet={wallet} onAdd={null} onWith={() => setModal('with')} user={user} navigate={navigate} apiCall={apiCall}/>}
      {page === 'support'    && <SupportPage apiCall={apiCall} user={user} />}
      {page === 'htp'        && <HowToPlayPage onBack={() => setPage('home')} />}
      {page === 'faq'        && <FAQPage onBack={() => setPage('home')} />}
      {page === 'terms'      && <TermsPage onBack={() => setPage('home')} />}
      {page === 'privacy'    && <PrivacyPage onBack={() => setPage('home')} />}
      {page === 'gamerates'  && <GameRatesPage onBack={() => setPage('home')} />}
      {page === 'referral'   && <ReferralPage apiCall={apiCall} user={user} onBack={() => setPage('wallet')} />}

      {/* FLOATING SUPPORT BUTTONS */}
      {!isSubPage && (
        <div style={{ position: 'fixed', right: 14, bottom: 90, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <style>{`
            @keyframes floatBtn { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
            @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(0,230,118,0.5);} 70%{box-shadow:0 0 0 10px rgba(0,230,118,0);} 100%{box-shadow:0 0 0 0 rgba(0,230,118,0);} }
            @keyframes pulseRingTG { 0%{box-shadow:0 0 0 0 rgba(0,136,204,0.5);} 70%{box-shadow:0 0 0 10px rgba(0,136,204,0);} 100%{box-shadow:0 0 0 0 rgba(0,136,204,0);} }
            .float-wa { animation: floatBtn 3s ease-in-out infinite, pulseRing 2s ease-in-out infinite; }
            .float-tg { animation: floatBtn 3s ease-in-out infinite 0.5s, pulseRingTG 2s ease-in-out infinite 0.5s; }
            .float-wa:hover,.float-tg:hover { transform: scale(1.15) !important; animation: none !important; }
          `}</style>

          {/* WhatsApp */}
          <div className="float-wa"
            onClick={() => {
              const num = (window._mkWaNumber || '919999999999');
              window.open(`https://wa.me/${num}`, '_blank');
            }}
            style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #25D366, #128C7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.522 5.847L.057 23.882l6.19-1.624A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.368l-.359-.213-3.724.977.995-3.63-.234-.374A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
            </svg>
          </div>

          {/* Telegram */}
          <div className="float-tg"
            onClick={() => {
              const tg = (window._mkTgId || 'matkaking_support');
              window.open(`https://t.me/${tg}`, '_blank');
            }}
            style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #2AABEE, #1A7CBD)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.04 13.988l-2.963-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.111.571z"/>
            </svg>
          </div>
        </div>
      )}

  

      {/* BOTTOM NAV */}
      {!isSubPage && (
        <div className="botnav">
          <div className={`bn-item${tab==='txns'?' active':''}`} onClick={() => navigate('txns')}>
            <IconTransaction color={tab==='txns' ? '#00ffd5' : 'rgba(0,255,213,0.4)'} />
            <span>Transaction</span>
          </div>
          <div className={`bn-item${tab==='bids'?' active':''}`} onClick={() => navigate('bids')}>
            <IconBids color={tab==='bids' ? '#00ffd5' : 'rgba(0,255,213,0.4)'} />
            <span>My Bids</span>
          </div>
          <div className="bn-center" onClick={() => { setPage('home'); setTab('home'); setSelectedGame(null); setSelectedType(null); }}>
            <div className="home-circle"><IconHome size={26} color="#001a17" /></div>
            <span style={{ color:tab==='home'?'#00ffd5':'rgba(255,255,255,0.4)', fontSize:10, fontWeight:tab==='home'?700:600, marginTop:2 }}>Home</span>
          </div>
          <div className={`bn-item${tab==='wallet'?' active':''}`} onClick={() => navigate('wallet')}>
            <IconWallet color={tab==='wallet' ? '#00ffd5' : 'rgba(0,255,213,0.4)'} />
            <span>Funds</span>
          </div>
          <div className={`bn-item${tab==='support'?' active':''}`} onClick={() => { setPage('support'); setTab('support'); }}>
            <IconSupport color={tab==='support' ? '#00ffd5' : 'rgba(0,255,213,0.4)'} />
            <span>Support</span>
          </div>
        </div>
      )}

      {/* DRAWER */}
      {drawer && (
        <BlueDrawer user={user} wallet={wallet} onClose={() => setDrawer(false)} onNav={handleNav}
          onLogout={() => { localStorage.removeItem('mk_token'); setUser(null); setWallet(0); walletRef.current=0; setDrawer(false); }}
        />
      )}

      {modal === 'add' && <DepositModal apiCall={apiCall} onClose={() => { setModal(null); fetchWallet(); }} onSuccess={() => { fetchWallet(); }} />}
      {modal === 'with' && <WithdrawModal wallet={wallet} onClose={() => setModal(null)} onSuccess={handleWith}/>}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* NOTIFICATIONS */}
      {showNotices && (
        <div style={{ position:'fixed', inset:0, background:'rgba(2,20,15,0.8)', backdropFilter:'blur(4px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setShowNotices(false)}>
          <div style={{ background:'#0a2e26', width:'90%', maxWidth:350, borderRadius:16, overflow:'hidden', boxShadow:'0 0 30px rgba(0,255,213,0.1)', border:'1px solid rgba(0,255,213,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div className="notif-modal-header" style={{ color:'#fff', padding:'14px 16px', fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:16 }}>🔔 Notifications</span>
              <span onClick={() => setShowNotices(false)} style={{ cursor:'pointer', fontSize:20, color:'#00ffd5' }}>✕</span>
            </div>
            <div style={{ padding:16, maxHeight:'60vh', overflowY:'auto' }}>
              {noticesData.length === 0 ? (
                <div style={{ color:'rgba(255,255,255,0.4)', textAlign:'center', padding:'30px 20px', fontSize:14 }}>Abhi koi naya notification nahi hai.</div>
              ) : (
                noticesData.map((n, i) => (
                  <div key={n.id || i} style={{ background:'rgba(0,255,213,0.06)', padding:12, borderRadius:8, marginBottom:10, color:'#fff', fontSize:13, borderLeft:'4px solid #00ffd5', lineHeight:1.5 }}>
                    {n.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
