import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

import AuthScreen from './components/AuthScreen';
import Drawer from './components/Drawer';
import Toast from './components/Toast';
import { AddModal, WithdrawModal } from './components/Modals';

import HomeScreen from './pages/HomeScreen';
import GameTypePage from './pages/GameTypePage';
import BetForm from './pages/BetForm';
import { BidsPage, TxnsPage, WalletPage, SupportPage, HowToPlayPage, FAQPage, TermsPage, PrivacyPage } from './pages/OtherPages';
import AdminPanel, { AdminLogin } from './pages/AdminPanel';

import { INIT_BIDS, INIT_TXNS } from './data/gameData';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

// 🔥 FIX: ProfileScreen mein navigate aur onLogout pass kiya 🔥
function ProfileScreen({ user, showToast, navigate, onLogout }) {
  const [name, setName] = useState(user?.name || 'Vikas Verma');
  const [password, setPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // 🎲 Random Avatar Logic Start
  const randomAvatars = [
    "https://cdn-icons-png.flaticon.com/512/4140/4140048.png", // Boy 1
    "https://cdn-icons-png.flaticon.com/512/4140/4140047.png", // Girl 1
    "https://cdn-icons-png.flaticon.com/512/4139/4139981.png", // Boy 2
    "https://cdn-icons-png.flaticon.com/512/4139/4139993.png", // Girl 2
    "https://cdn-icons-png.flaticon.com/512/4140/4140037.png", // Man
    "https://cdn-icons-png.flaticon.com/512/149/149071.png"    // Default classic
  ];
  const defaultRandomAvatar = useRef(randomAvatars[Math.floor(Math.random() * randomAvatars.length)]);
  // 🎲 Random Avatar Logic End

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      showToast('Photo selected! Click Update to Save.', 'ok');
    }
  };

  const handleUpdate = async () => {
    if (!name) return showToast('Naam khali nahi chhod sakte!', 'err');
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('mk_token');

      // 1. Password Update Logic
      if (password) {
        if (password.length < 6) throw new Error('Password min 6 characters ka ho');
        const resPass = await apiCall('/api/auth/update-password', 'POST', { newPassword: password });
        if (!resPass.success) throw new Error(resPass.message || 'Password update fail');
      }

      // 2. Profile Name & Image Update
      const formData = new FormData();
      formData.append('name', name);
      if (selectedFile) {
        formData.append('avatar', selectedFile); 
      }

      const response = await fetch(`${API}/api/auth/update-profile`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      const resProfile = await response.json();
      
      if (resProfile.success) {
        showToast('Profile Updated Successfully! 🚀', 'ok');
        setPassword('');
        setSelectedFile(null);
      } else {
        throw new Error(resProfile.message || 'Profile update fail');
      }

    } catch (err) {
      console.error(err);
      showToast(err.message || 'Server connection error!', 'err');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="screen" style={{ padding: '20px 15px', paddingBottom: 80, background: '#021a14', minHeight: '100vh', color: '#fff' }}>
      
      {/* Profile Form Block */}
      <div style={{ background:'rgba(0, 255, 200, 0.05)', padding:'20px', borderRadius:12, border:'1px solid rgba(0, 255, 213, 0.3)', marginBottom:20, boxShadow: '0 4px 15px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
        <h3 style={{ color:'#FFD700', marginTop:0, textAlign:'center', fontFamily:'Poppins, sans-serif', fontSize: 22, textShadow: '0 0 10px rgba(255,215,0,0.6)' }}>👤 MY PROFILE</h3>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 25 }}>
          <div style={{ position: 'relative', width: 95, height: 95 }}>
            {/* 🔥 Updated the image src logic here 🔥 */}
            <img 
              src={avatarPreview || (user?.profile_pic ? `${API}${user.profile_pic}` : defaultRandomAvatar.current)} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #00ffd5', padding: 3, background: 'rgba(0, 255, 200, 0.05)', boxShadow: '0 0 10px #00ffd5' }} 
            />
            <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#00ffd5', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #063d35' }}>
              📷
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        <div style={{ marginBottom:15 }}>
          <label style={{ color:'#00ffd5', fontSize:12, marginBottom:5, display:'block', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Mobile Number Verified ✅</label>
          <input 
            value={user?.mobile || '9999999999'} 
            disabled
            style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid #00ffd5', background:'rgba(0, 255, 213, 0.05)', color:'#FFD700', boxSizing:'border-box', textAlign: 'center', fontWeight: 'bold' }} 
          />
        </div>

        <div style={{ marginBottom:15 }}>
          <label style={{ color:'#00ffd5', fontSize:12, marginBottom:5, display:'block', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Full Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid #00ffd5', background:'rgba(0, 255, 213, 0.05)', color:'#fff', boxSizing:'border-box', textAlign: 'center', fontWeight: 'bold' }} 
          />
        </div>

        <div style={{ marginBottom:25 }}>
          <label style={{ color:'#00ffd5', fontSize:12, marginBottom:5, display:'block', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>New Password</label>
          <input 
            type="password" 
            placeholder="Naya password likhein (optional)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ width:'100%', padding:'12px', borderRadius:10, border:'1px solid #00ffd5', background:'rgba(0, 255, 213, 0.05)', color:'#fff', boxSizing:'border-box', textAlign: 'center', fontWeight: 'bold' }} 
          />
        </div>

        <button 
          onClick={handleUpdate} 
          disabled={updating}
          style={{ width:'100%', padding:'14px', background:'linear-gradient(90deg, #14f4ce, #e0800b)', border:'none', borderRadius:'10px 40px 10px 40px', color:'#001a17', fontWeight:900, fontSize:15, cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1, position: 'relative', overflow: 'hidden', boxShadow: 'none', letterSpacing: 1 }}>
          {updating ? 'SAVING DATA...' : 'UPDATE PROFILE'}
        </button>
      </div>

      {/* Help & Support Block */}
      <div style={{ background:'rgba(0, 255, 200, 0.05)', padding:'20px', borderRadius:12, border:'1px solid rgba(0, 255, 213, 0.3)', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', marginBottom: 20 }}>
        <h3 style={{ color:'#FFD700', marginTop:0, textAlign:'center', fontFamily:'Poppins, sans-serif', marginBottom: 20,fontSize: 22, textShadow: '0 0 10px rgba(255,215,0,0.6)' }}>🎧 HELP & SUPPORT</h3>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => window.open('https://wa.me/919999999999', '_blank')} style={{ flex:1, padding:'14px 10px', background:'rgba(37,211,102,0.1)', border:'1px solid #25D366', borderRadius:8, color:'#25D366', fontWeight:'bold' }}>💬 WhatsApp</button>
          <button onClick={() => window.open('https://t.me/matkaking_support', '_blank')} style={{ flex:1, padding:'14px 10px', background:'rgba(0,136,204,0.1)', border:'1px solid #0088cc', borderRadius:8, color:'#0088cc', fontWeight:'bold' }}>✈️ Telegram</button>
        </div>
      </div>

      {/* 🔥 NEW MORE SECTION SHIFTED HERE 🔥 */}
      <div style={{ padding: '5px' }}>
        <div style={{ color: '#e0800b', fontSize: 13, fontWeight: 900, letterSpacing: 1, marginBottom: 10, fontFamily: "'Poppins', sans-serif" }}>
          MORE
        </div>

        {[
          { ic: '📖', l: 'How to Play', fn: () => navigate && navigate('htp') },
          { ic: '❓', l: 'FAQ', fn: () => navigate && navigate('faq') },
          { ic: '📜', l: 'Terms & Conditions', fn: () => navigate && navigate('terms') },
          { ic: '🔒', l: 'Privacy Policy', fn: () => navigate && navigate('privacy') },
        ].map((item, i) => (
          <div key={i} onClick={item.fn} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderBottom: '1px solid rgba(0,255,213,0.1)', cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,255,213,0.05)',
                border: '1px solid rgba(0,255,213,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}>
                {item.ic}
              </div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{item.l}</div>
            </div>
            <div style={{ color: '#e0800b', fontSize: 20, fontWeight: 900 }}>›</div>
          </div>
        ))}

        {/* LOGOUT BUTTON */}
        <button onClick={onLogout} style={{
          width: '100%', padding: '14px', marginTop: 25, borderRadius: 10,
          background: 'rgba(255, 34, 68, 0.05)', border: '1px solid #ff2244',
          color: '#ff2244', fontWeight: 900, fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: 1, fontFamily: "'Poppins', sans-serif",
          transition: 'transform 0.2s'
        }}>
           LOGOUT
        </button>
      </div>

    </div>
  );
}

// ── STARLINE / DISAWAR GAME LIST PAGE ──
function CategoryGamesScreen({ category, onPlay }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltipInfo, setTooltipInfo] = useState(null);

  const getGameIcon = (name) => {
    if (!name) return '🎯';
    const n = name.toUpperCase();
    if (n.includes('MORNING'))  return '🌅';
    if (n.includes('DISAWAR'))  return '🎰';
    return '🎯';
  };

  const formatResult = (g) => {
    if (g.open_result || g.close_result) {
      return `${g.open_result || '***'} - ${g.jodi_result || '--'} - ${g.close_result || '***'}`;
    }
    return '*** -- ***';
  };

  const renderWaveText = (text) => {
    if (!text) return null;
    let charIndex = 0;
    return text.split(' ').map((word, wIdx, arr) => (
      <React.Fragment key={wIdx}>
        {word.split('').map((char) => {
          const currentDelay = `${charIndex * 0.1}s`;
          charIndex++;
          return (
            <span key={charIndex} style={{ display: 'inline-block', animation: 'wave 1.5s infinite', animationDelay: currentDelay }}>
              {char}
            </span>
          );
        })}
        {wIdx < arr.length - 1 && <>&nbsp;&nbsp;</>}
      </React.Fragment>
    ));
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const res = await fetch(`${API}/api/games?category=${category}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setGames(Array.isArray(data.games) ? data.games : []);
      } catch (err) {
        console.error('CategoryGames fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [category]);

  return (
    <div className="screen" style={{ paddingBottom: 80, background: '#021a14', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ background:'rgba(2, 31, 27, 0.95)', padding:'20px 14px', borderBottom:'1.5px solid rgba(0, 255, 213, 0.3)', marginBottom:20, textAlign:'center' }}>
        <div style={{ color:'#FFD700', fontSize:22, fontWeight:900, fontFamily:'Poppins, sans-serif', letterSpacing:2, textTransform: 'uppercase', textShadow: '0 0 10px rgba(255,215,0,0.6)' }}>
          {renderWaveText(`${category === 'starline' ? 'STARLINE' : 'DISAWAR'} GAMES`)}
        </div>
      </div>

      <div style={{ padding:'0 15px' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'#00ffd5', padding:60, fontWeight:700 }}>⏳ Loading Games...</div>
        ) : (
          games.map(g => (
            <div key={g.id} style={{
              position: 'relative', borderRadius: '15px', marginBottom: '25px', overflow: 'visible',
              background: '#012a23', padding: '15px', border: '2.5px solid #00ffd5',
              boxShadow: '0 0 15px rgba(0, 255, 213, 0.2)', textAlign: 'center'
            }}>
              
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '15px' }}>
                <div style={{ 
                  fontSize: 12, color: '#00ffd5', fontWeight: 800,
                  background: 'rgba(0,255,213,0.1)', padding: '4px 12px',
                  borderRadius: '6px', border: '1.5px solid #00ffd5', fontFamily: 'Orbitron, sans-serif'
                }}>
                  {g.open_time || '00:00:00'}
                </div>

                <div 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setTooltipInfo(g.id)}
                  onMouseLeave={() => setTooltipInfo(null)}
                  onClick={() => setTooltipInfo(tooltipInfo === g.id ? null : g.id)}
                >
                  <div style={{ 
                    color: '#00ffd5', border: '1.5px solid #00ffd5', borderRadius: '50%', 
                    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: 12, fontWeight: 900, cursor: 'pointer'
                  }}>i</div>

                  {tooltipInfo === g.id && (
                    <div style={{ 
                      position: 'absolute', right: 0, top: 30,
                      background: '#012a23', border: '1.5px solid #00ffd5',
                      borderRadius: 10, padding: '10px 12px', 
                      color: '#fff', fontSize: 11, fontWeight: 700, zIndex: 100, 
                      whiteSpace: 'nowrap', boxShadow: '0 8px 16px rgba(0,0,0,0.8)'
                    }}>
                      <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#00cc44' }}>🟢</span> Open: <span style={{ color: '#00ffd5' }}>{g.open_time || '--:--'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#ff2244' }}>🔴</span> Close: <span style={{ color: '#00ffd5' }}>{g.close_time || '--:--'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 900, color: '#FFD700', textTransform: 'uppercase', letterSpacing: 3, textShadow: '0 2px 5px rgba(0,0,0,0.5)', display: 'inline-block' }}>
                  <span style={{ animation: 'none', display: 'inline-block' }}>{getGameIcon(g.name)}&nbsp;</span>
                  {renderWaveText(g.name)}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, color: '#00ffd5', margin: '10px 0', letterSpacing: '4px', fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 15px #00ffd5' }}>
                {formatResult(g)}
              </div>

              <div style={{ fontSize: 12, color: g.status === 'open' ? '#00cc44' : '#ff2244', fontWeight: 800, marginBottom: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textTransform: 'uppercase' }}>
                <span style={{ width: 8, height: 8, background: g.status === 'open' ? '#00cc44' : '#ff2244', borderRadius: '50%', display: 'inline-block', boxShadow: g.status === 'open' ? '0 0 8px #00cc44' : '0 0 8px #ff2244' }}></span>
                {g.status || 'CLOSE'}
              </div>

              <button
                onClick={() => g.status === 'open' && onPlay(g)}
                disabled={g.status !== 'open'}
                style={{
                  width: '100%', padding: '10px', border: 'none', borderRadius: '10px 40px 10px 40px',
                  fontSize: '13px', fontWeight: '900', cursor: g.status === 'open' ? 'pointer' : 'not-allowed',
                  position: 'relative', overflow: 'hidden', background: g.status === 'open' ? 'linear-gradient(90deg, #14f4ce, #e0800b)' : '#69e2a6',
                  color: g.status === 'open' ? '#001a17' : '#3a5a4a',
                  boxShadow: 'none',
                  textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                {g.status === 'open' && (
                  <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.7), transparent)', animation: 'shineMove 2.5s infinite linear' }} />
                )}
                {g.status === 'open' && <span style={{ display: 'inline-block', animation: 'spinIcon 2s linear infinite', fontSize: 12 }}>◀</span>}
                {g.status === 'open' ? 'PLAY NOW' : 'MARKET CLOSED'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.search.includes('admin=1');

  const [user, setUser]                   = useState(null);
  const [authLoading, setAuthLoading]     = useState(true);
  const [tab, setTab]                     = useState('home');
  const [wallet, setWallet]               = useState(0);
  const [bids, setBids]                   = useState(INIT_BIDS);
  const [txns, setTxns]                   = useState(INIT_TXNS);
  const [modal, setModal]                 = useState(null);
  const [drawer, setDrawer]               = useState(false);
  const [toast, setToast]                 = useState(null);
  const [selectedGame, setSelectedGame]   = useState(null);
  const [selectedType, setSelectedType]   = useState(null);
  const [page, setPage]                   = useState('home');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [showNotices, setShowNotices]     = useState(false);
  const [noticesData, setNoticesData]     = useState([]);

  const walletRef        = useRef(0);
  const bidSubmittingRef = useRef(false);

  const showToast = (msg, type = 'ok') => setToast({ msg, type });

  useEffect(() => {
    const token = localStorage.getItem('mk_token');
    if (!token) { setAuthLoading(false); return; }
    apiCall('/api/auth/profile')
      .then(res => {
        if (res && res.success && res.user) setUser(res.user);
        else localStorage.removeItem('mk_token');
      })
      .catch(() => localStorage.removeItem('mk_token'))
      .finally(() => setAuthLoading(false));
  }, []);

  const fetchWallet = useCallback(() => {
    if (!localStorage.getItem('mk_token')) return;
    return apiCall('/api/wallet/balance')
      .then(d => {
        if (d && d.success) {
          const walletBal  = Number(d.wallet_balance  || 0);
          const winningBal = Number(d.winning_balance || 0);
          const total = walletBal + winningBal;
          walletRef.current = total;
          setWallet(total);
          return { walletBal, winningBal, total };
        }
        return null;
      })
      .catch(() => null);
  }, []);

  useEffect(() => { if (user) fetchWallet(); }, [user, fetchWallet]);
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchWallet, 30000);
    return () => clearInterval(interval);
  }, [user, fetchWallet]);

  const handleLogin = (u) => { setUser(u); setWallet(0); walletRef.current = 0; };

  const handleAdd = amt => {
    fetchWallet();
    setTxns(t => [{
      id: Date.now(), type: 'credit', name: 'Add Funds',
      date: new Date().toLocaleString('en-IN'),
      ref: '#MK' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      amt, statusTxt: 'PENDING'
    }, ...t]);
    showToast(`Rs.${amt.toLocaleString()} added!`);
  };

  const handleWith = amt => {
    fetchWallet();
    setTxns(t => [{
      id: Date.now(), type: 'debit', name: 'Withdrawal',
      date: new Date().toLocaleString('en-IN'),
      ref: '#WD' + Date.now().toString().slice(-10),
      amt, statusTxt: 'PENDING'
    }, ...t]);
    showToast(`Withdrawal Rs.${amt.toLocaleString()} sent`);
  };

  const handleBidSubmit = async (data) => {
    if (bidSubmittingRef.current) {
      showToast('Bid processing ho rahi hai... ruko!', 'err');
      return;
    }
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

      if (data.numbers) {
        const results = await Promise.all(
          data.numbers.map(bet =>
            apiCall('/api/games/bid', 'POST', {
              game_id:   selectedGame.id,
              game_type: selectedType.id,
              number:    bet.num,
              amount:    bet.amt,
              session:   data.session || 'open'
            })
          )
        );
        const failed = results.find(r => !r.success);
        if (failed) {
          showToast(failed.message || 'Bid failed!', 'err');
          await fetchWallet();
          bidSubmittingRef.current = false;
          return;
        }
      } else {
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
      }

      await fetchWallet();
      showToast(`Bid Rs.${amount.toLocaleString()} placed!`);

      const cat = selectedGame?.game_category;
      const backPage = cat === 'starline' ? 'starline' : cat === 'disawar' ? 'disawar' : 'home';
      setPage(backPage);
      setSelectedGame(null);
      setSelectedType(null);

    } catch (err) {
      await fetchWallet();
      showToast('Network error! Dobara try karo.', 'err');
    } finally {
      bidSubmittingRef.current = false;
    }
  };

  const navigate = (id) => {
    setPage(id);
    const validTabs = ['home', 'bids', 'disawar', 'wallet', 'profile', 'game'];
    if (validTabs.includes(id)) setTab(id);
  };

  const handleNav = (id) => {
    fetchWallet();
    if (id === 'add') setModal('add');
    else if (id === 'with') setModal('with');
    else { setPage(id); setSelectedGame(null); setSelectedType(null); setTab(id); }
  };

  const goBack = () => {
    const cat = selectedGame?.game_category;
    if (page === 'bet-form') {
      setPage('game-types');
      setSelectedType(null);
    } else if (page === 'game-types') {
      if (cat === 'starline') { setPage('starline'); setSelectedGame(null); }
      else if (cat === 'disawar') { setPage('disawar'); setSelectedGame(null); }
      else { setPage('home'); setSelectedGame(null); setTab('game'); }
    } else {
      setPage('home'); setTab('game');
    }
  };

  if (isAdmin) {
    if (!adminLoggedIn) return <AdminLogin onLogin={() => setAdminLoggedIn(true)} />;
    return <AdminPanel onLogout={() => setAdminLoggedIn(false)} />;
  }

  if (authLoading) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center',
        background:'#021f1b', color:'#00ffd5', fontSize:18, fontWeight:700,
        fontFamily:'Poppins, sans-serif' }}>
        Loading MatkaKing...
      </div>
    );
  }

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isTxnTab  = page === 'txns';
  const isSubPage = ['game-types', 'bet-form', 'starline', 'disawar'].includes(page);

  const navTitle =
    page === 'game-types' ? selectedGame?.name :
    page === 'bet-form'   ? selectedType?.label :
    page === 'starline'   ? 'STARLINE' :
    page === 'disawar'    ? 'DISAWAR' :
    null;

  return (
    <div style={{ background: '#021a14', minHeight: '100vh', color: '#fff', fontFamily: "'Poppins', sans-serif" }}>
      
      <style>{`
        @keyframes borderMove { 0% { background-position: 0% } 100% { background-position: 300% } }
        @keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shineMove { 0% { left: -100%; } 100% { left: 100%; } }
        @keyframes spinIcon { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
      `}</style>

      {/* TOP NAV */}
      <div className="topnav" style={{ background: 'rgba(2, 31, 27, 0.95)', borderBottom: '1.5px solid rgba(0, 255, 213, 0.3)', padding: '0 14px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', boxShadow: '0 2px 20px rgba(0,255,213,0.2)' }}>
        <div className="tn-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isSubPage && (
            <div className="back-btn" onClick={goBack} style={{ color: '#00ffd5', fontSize: '20px', cursor: 'pointer', padding: '4px 6px 4px 0', lineHeight: 1, transition: 'transform 0.2s' }}>&#x2039;</div>
          )}
          <span className="brand" style={{ fontFamily: "'Teko', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FFD700', letterSpacing: '3px', textShadow: '0 0 16px rgba(255,215,0,0.5), 0 0 32px rgba(255,165,0,0.2)', textTransform: 'uppercase' }}>
            {isSubPage ? (navTitle || 'KHAJANA') : <>SATKA MATKA <em></em></>}
          </span>
        </div>
        <div className="tn-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isTxnTab && <div className="tn-filter show" style={{ background: 'rgba(0, 255, 200, 0.05)', border: '1.5px solid rgba(0, 255, 213, 0.3)', borderRadius: '6px', padding: '5px 10px', color: '#00ffd5', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' }}>Filter</div>}
          {!isTxnTab && (
            <div className="tn-wallet" onClick={() => { fetchWallet(); setPage('wallet'); setTab('wallet'); }} style={{ background: 'rgba(0, 255, 200, 0.05)', border: '1.5px solid rgba(0, 255, 213, 0.3)', borderRadius: '20px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ color: '#00ffd5', fontSize: '14px', fontWeight: 700, fontFamily: "'Teko', sans-serif", letterSpacing: '1px' }}>&#x1F4BC;</span>
              <span style={{ color: '#00ffd5', fontSize: '14px', fontWeight: 700, fontFamily: "'Teko', sans-serif", letterSpacing: '1px' }}>Rs.{wallet.toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}</span>
            </div>
          )}
          <div className="tn-bell" style={{ cursor:'pointer', width: '32px', height: '32px', background: 'rgba(0, 255, 200, 0.05)', border: '1.5px solid rgba(0, 255, 213, 0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', position: 'relative', transition: 'all 0.2s', color: '#00ffd5' }} onClick={() => {
            apiCall('/api/notices').then(res => {
              if (res && res.success) setNoticesData(res.notices || []);
              setShowNotices(true);
            }).catch(() => setShowNotices(true));
          }}>
            &#x1F514;<div className="bell-dot" style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#ff2244', borderRadius: '50%' }}/>
          </div>
        </div>
      </div>

      {/* PAGES */}
      {page === 'home' && (
        <HomeScreen
          wallet={wallet}
          onAdd={() => setModal('add')}
          onWith={() => setModal('with')}
          onPlay={g => { setSelectedGame(g); setPage('game-types'); setTab('game'); }}
          navigate={navigate}
        />
      )}
      
      {/* PROFILE & SUPPORT SCREEN */}
      {page === 'profile' && (
        <ProfileScreen 
          user={user} 
          showToast={showToast} 
          navigate={navigate}
          onLogout={() => {
            localStorage.removeItem('mk_token');
            setUser(null); setWallet(0); walletRef.current = 0;
          }}
        />
      )}

      {page === 'game-types' && (
        <GameTypePage
          game={selectedGame}
          onSelect={gt => { setSelectedType(gt); setPage('bet-form'); }}
        />
      )}

      {page === 'bet-form' && (
        <BetForm
          game={selectedGame}
          gameType={selectedType}
          wallet={wallet}
          onSubmit={handleBidSubmit}
        />
      )}

      {/* STARLINE */}
      {page === 'starline' && (
        <CategoryGamesScreen
          category="starline"
          onPlay={g => { setSelectedGame(g); setPage('game-types'); }}
        />
      )}

      {/* DISAWAR */}
      {page === 'disawar' && (
        <CategoryGamesScreen
          category="disawar"
          onPlay={g => { setSelectedGame(g); setPage('game-types'); }}
        />
      )}

      {page === 'bids'    && <BidsPage apiCall={apiCall}/>}
      {page === 'txns'    && <TxnsPage apiCall={apiCall} navigate={navigate}/>}
      {page === 'wallet'  && <WalletPage wallet={wallet} onAdd={() => setModal('add')} onWith={() => setModal('with')} user={user} navigate={navigate} apiCall={apiCall}/>}
      {page === 'support' && <SupportPage apiCall={apiCall} user={user} />}
      {page === 'htp'     && <HowToPlayPage onBack={() => setPage('home')} />}
      {page === 'faq'     && <FAQPage onBack={() => setPage('home')} />}
      {page === 'terms'   && <TermsPage onBack={() => setPage('home')} />}
      {page === 'privacy' && <PrivacyPage onBack={() => setPage('home')} />}

      {/* BOTTOM NAV */}
      {!isSubPage && (
        <div className="botnav" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: 'rgba(2, 31, 27, 0.98)', borderTop: '1.5px solid rgba(0, 255, 213, 0.3)', display: 'flex', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,255,213,0.15)' }}>
          <div className="bn-item" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px 6px', cursor: 'pointer', gap: '2px', transition: 'all 0.2s' }} onClick={() => navigate('bids')}>
            <span className="ni" style={{ fontSize: '19px', color: tab === 'bids' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', textShadow: tab === 'bids' ? '0 0 10px #00ffd5' : 'none' }}>&#x1F528;</span>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', fontFamily: "'Poppins', sans-serif", color: tab === 'bids' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', textShadow: tab === 'bids' ? '0 0 10px #00ffd5' : 'none' }}>My Bids</span>
          </div>
          <div className="bn-item" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px 6px', cursor: 'pointer', gap: '2px', transition: 'all 0.2s' }} onClick={() => navigate('disawar')}>
            <span className="ni" style={{ fontSize: '19px', color: tab === 'disawar' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', textShadow: tab === 'disawar' ? '0 0 10px #00ffd5' : 'none' }}>&#x1F3B0;</span>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', fontFamily: "'Poppins', sans-serif", color: tab === 'disawar' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', textShadow: tab === 'disawar' ? '0 0 10px #00ffd5' : 'none' }}>Disawar</span>
          </div>
          
          {/* BEECH WALA BUTTON - GAME LIST KHOLEGA (🎮) */}
          <div className="bn-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '2px 4px 6px' }} onClick={() => { setPage('home'); setTab('game'); setSelectedGame(null); setSelectedType(null); }}>
            <div className="home-circle" style={{ width: '50px', height: '50px', borderRadius: '50%', marginTop: '-16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, #14f4ce, #e0800b)', boxShadow: '0 0 10px #00ffd5, 0 0 25px #00aaff', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <span className="ni" style={{ fontSize: '24px', color: '#001a17' }}>🎮</span>
            </div>
            <span style={{ fontSize: '11px', color: tab === 'game' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', marginTop: '2px', fontFamily: "'Poppins', sans-serif", letterSpacing: '1px', fontWeight: 'bold' }}>Game</span>
          </div>

          <div className="bn-item" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px 6px', cursor: 'pointer', gap: '2px', transition: 'all 0.2s' }} onClick={() => navigate('wallet')}>
            <span className="ni" style={{ fontSize: '19px', color: tab === 'wallet' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', textShadow: tab === 'wallet' ? '0 0 10px #00ffd5' : 'none' }}>&#x1F3E6;</span>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', fontFamily: "'Poppins', sans-serif", color: tab === 'wallet' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', textShadow: tab === 'wallet' ? '0 0 10px #00ffd5' : 'none' }}>Wallet</span>
          </div>

          {/* RIGHT BUTTON - PROFILE AUR SUPPORT KHOLEGA (🏠) */}
          <div className="bn-item" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px 6px', cursor: 'pointer', gap: '2px', transition: 'all 0.2s' }} onClick={() => { setPage('profile'); setTab('profile'); }}>
            <span className="ni" style={{ fontSize: '19px', color: tab === 'profile' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', textShadow: tab === 'profile' ? '0 0 10px #00ffd5' : 'none' }}>&#x1F3E0;</span>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', fontFamily: "'Poppins', sans-serif", color: tab === 'profile' ? '#00ffd5' : 'rgba(0, 255, 213, 0.55)', textShadow: tab === 'profile' ? '0 0 10px #00ffd5' : 'none' }}>Home</span>
          </div>
        </div>
      )}

      {modal === 'add'  && <AddModal onClose={() => setModal(null)} onSuccess={handleAdd}/>}
      {modal === 'with' && <WithdrawModal wallet={wallet} onClose={() => setModal(null)} onSuccess={handleWith}/>}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* NOTIFICATIONS */}
      {showNotices && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999,
          display:'flex', alignItems:'center', justifyContent:'center', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowNotices(false)}>
          <div style={{ background:'linear-gradient(145deg, #063d35, #021f1b)', width:'90%', maxWidth:350, borderRadius:16,
            overflow:'hidden', border:'1px solid rgba(0, 255, 213, 0.3)', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{
              position: 'absolute', inset: 0, padding: 2, borderRadius: 16,
              background: 'linear-gradient(90deg, transparent, #00ffd5, transparent)',
              backgroundSize: '300% 300%', animation: 'borderMove 4s linear infinite',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'
            }}></div>
            <div style={{ background:'rgba(0, 255, 200, 0.05)', color:'#00ffd5', padding:'12px 16px',
              fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: '1px solid rgba(0, 255, 213, 0.3)' }}>
              <span style={{ fontSize:16, fontFamily: "'Poppins', sans-serif", letterSpacing: 1, textTransform: 'uppercase' }}>Notifications</span>
              <span onClick={() => setShowNotices(false)} style={{ cursor:'pointer', fontSize:20, lineHeight:1, color: '#00ffd5' }}>X</span>
            </div>
            <div style={{ padding:16, maxHeight:'60vh', overflowY:'auto' }}>
              {noticesData.length === 0 ? (
                <div style={{ color:'rgba(0, 255, 213, 0.65)', textAlign:'center', padding:'30px 20px', fontSize:14, fontFamily: "'Poppins', sans-serif" }}>
                  Abhi koi naya notification nahi hai.
                </div>
              ) : (
                noticesData.map((n, i) => (
                  <div key={n.id || i} style={{ background:'rgba(0, 255, 200, 0.05)', padding:12, borderRadius:8,
                    marginBottom:10, color:'#fff', fontSize:13,
                    borderLeft:'4px solid #00ffd5', lineHeight:1.5, fontFamily: "'Poppins', sans-serif" }}>
                    {n.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}