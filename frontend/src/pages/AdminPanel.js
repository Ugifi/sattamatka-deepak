import React, { useState, useEffect, useRef } from 'react';

// Purana code: const API = 'http://localhost:5000';

// Naya code:
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';// ── FIREFOX/CHROME CACHE FIX APPLIED ──
// ── CORS SAFE CACHE FIX ──
function apiCall(path, method = 'GET', body = null) {
  const token = localStorage.getItem('mk_token');
  
  // Sirf GET requests mein timestamp add karenge taaki cache break ho
  const url = method === 'GET' 
    ? `${API}${path}${path.includes('?') ? '&' : '?'}t=${new Date().getTime()}` 
    : `${API}${path}`;

  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Yahan se Cache-Control hata diya gaya hai taaki CORS error na aaye
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  }).then(r => r.json());
}
// ── Responsive Card Row (table ki jagah cards) ──
function UserCard({ u, onBlock, onAddCoins, onDeductCoins }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{u.name}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{u.mobile}</div>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: u.is_blocked ? '#fee2e2' : '#dcfce7',
          color: u.is_blocked ? '#dc2626' : '#16a34a'
        }}>{u.is_blocked ? 'Blocked' : 'Active'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#f8f8f8', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>WALLET</div>
          <div style={{ fontWeight: 700, color: '#0d3526' }}>₹{Number(u.wallet_balance || 0).toLocaleString()}</div>
        </div>
        <div style={{ background: '#f8f8f8', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>WINNING</div>
          <div style={{ fontWeight: 700, color: '#22c55e' }}>₹{Number(u.winning_balance || 0).toLocaleString()}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={() => onBlock(u.id, u.is_blocked)} style={{
          flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 12,
          background: u.is_blocked ? '#dcfce7' : '#fff3cd',
          color: u.is_blocked ? '#16a34a' : '#b45309'
        }}>{u.is_blocked ? '✅ Unblock' : '🚫 Block'}</button>
        <button onClick={() => onAddCoins(u.id)} style={{
          flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 12, background: '#dcfce7', color: '#16a34a'
        }}>+ Coins</button>
        <button onClick={() => onDeductCoins(u.id)} style={{
          flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 12, background: '#fee2e2', color: '#dc2626'
        }}>- Coins</button>
      </div>
    </div>
  );
}

function DepositCard({ d, onApprove, onReject }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{d.mobile}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 18, color: '#0d3526' }}>₹{Number(d.amount).toLocaleString()}</div>
      </div>
      {d.transaction_id && (
        <div style={{ background: '#f0faf5', borderRadius: 6, padding: '6px 10px', marginBottom: 8, fontSize: 12 }}>
          UTR: <strong>{d.transaction_id}</strong>
        </div>
      )}
      {d.upi_id && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>UPI: {d.upi_id}</div>
      )}
      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>
        {new Date(d.created_at).toLocaleString('en-IN')}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: d.status === 'approved' ? '#dcfce7' : d.status === 'rejected' ? '#fee2e2' : '#fff3cd',
          color: d.status === 'approved' ? '#16a34a' : d.status === 'rejected' ? '#dc2626' : '#b45309'
        }}>{d.status}</span>
        {d.status === 'pending' && <>
          <button onClick={() => onApprove(d.id)} style={{
            flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 12, background: '#dcfce7', color: '#16a34a'
          }}>✅ Approve</button>
          <button onClick={() => onReject(d.id)} style={{
            flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 12, background: '#fee2e2', color: '#dc2626'
          }}>❌ Reject</button>
        </>}
      </div>
    </div>
  );
}

function WithdrawCard({ w, onApprove, onReject }) {
  const isBank = w.method === 'bank' || w.account_number;
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{w.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{w.mobile}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 18, color: '#ef4444' }}>₹{Number(w.amount).toLocaleString()}</div>
      </div>

      <div style={{ background: '#f8f8f8', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
        {isBank ? <>
          <div style={{ fontSize: 11, color: '#f0a500', fontWeight: 700, marginBottom: 6 }}>🏦 BANK TRANSFER</div>
          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.8 }}>
            <span style={{ color: '#888' }}>Name:</span> <strong>{w.account_name}</strong><br />
            <span style={{ color: '#888' }}>A/C No:</span> <strong>{w.account_number}</strong><br />
            <span style={{ color: '#888' }}>IFSC:</span> <strong>{w.ifsc_code}</strong><br />
            <span style={{ color: '#888' }}>Bank:</span> <strong>{w.bank_name}</strong>
          </div>
        </> : <>
          <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginBottom: 4 }}>📲 UPI</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{w.upi_id}</div>
          {w.account_name && <div style={{ fontSize: 12, color: '#666' }}>{w.account_name}</div>}
        </>}
      </div>

      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>
        {new Date(w.created_at).toLocaleString('en-IN')}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: w.status === 'approved' ? '#dcfce7' : w.status === 'rejected' ? '#fee2e2' : '#fff3cd',
          color: w.status === 'approved' ? '#16a34a' : w.status === 'rejected' ? '#dc2626' : '#b45309'
        }}>{w.status}</span>
        {w.status === 'pending' && <>
          <button onClick={() => onApprove(w.id)} style={{
            flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 12, background: '#dcfce7', color: '#16a34a'
          }}>✅ Approve</button>
          <button onClick={() => onReject(w.id)} style={{
            flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 12, background: '#fee2e2', color: '#dc2626'
          }}>❌ Reject</button>
        </>}
      </div>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
export function AdminLogin({ onLogin }) {
  const [mobile, setMobile]     = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]           = useState('');
  const [loading, setLoading]   = useState(false);

  const go = async () => {
    setErr('');
    if (!mobile || !password) { setErr('Mobile aur password daalo'); return; }
    setLoading(true);
    try {
      const data = await apiCall('/api/auth/login', 'POST', { mobile, password });
      if (!data.success) { setErr(data.message || 'Login failed'); setLoading(false); return; }
      if (data.user.role !== 'admin') { setErr('Yeh account admin nahi hai'); setLoading(false); return; }
      localStorage.setItem('mk_token', data.token);
      onLogin(data.user);
    } catch {
      setErr('Server se connect nahi ho pa raha. Backend chalao!');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(135deg,#0d3526,#061510)', padding: 24
    }}>
      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
        SAKTA MATKA <span style={{ color: '#f0a500' }}>👑</span>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Admin Control Panel</div>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 }}>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 18, fontWeight: 700, color: '#0d3526', marginBottom: 16 }}>
          🔐 Admin Login
        </div>
        <input className="fi" type="tel" placeholder="Mobile (e.g. 9999999999)"
          maxLength={10} value={mobile}
          onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
          style={{ marginBottom: 10 }} />
        <input className="fi" type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          style={{ marginBottom: 10 }} />
        {err && <div className="err-msg">⚠️ {err}</div>}
        <button className="btn-g" onClick={go} disabled={loading}>
          {loading ? '⏳ Logging in...' : 'Login to Admin'}
        </button>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
export default function AdminPanel({ onLogout }) {
  const [page, setPage]               = useState('dashboard');
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [stats, setStats]             = useState(null);
  const [users, setUsers]             = useState([]);
  const [games, setGames]             = useState([]);
  const [deposits, setDeposits]       = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bids, setBids]               = useState([]);
  const [newGame, setNewGame]         = useState({ name: '', open_time: '', close_time: '' });
  const [resultForm, setResultForm]   = useState({});
  const [toast, setToast]             = useState('');
  const [loading, setLoading]         = useState(false);
  
  // ✅ FIX: Notices ke liye state variables
  const [notices, setNotices]         = useState([]);
  const [noticeMsg, setNoticeMsg]     = useState('');

  // ✅ Last refresh time dikhane ke liye
  const [lastRefresh, setLastRefresh] = useState(null);

  // Settings state
  const [settings, setSettings]           = useState({ upi_id: '', site_name: '', whatsapp: '' });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Support System state
  const [support, setSupport]           = useState({
    phone:            '9999999999',
    whatsapp:         '',
    telegram:         'matkaking_support',
    support_hours:    'Mon–Sat 10AM–8PM',
    support_email:    '',
    telegram_channel: '',
  });
  const [supportSaved, setSupportSaved] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ✅ FIX: fetchPageData — page ke hisaab se data fetch karo
  const fetchPageData = (currentPage, isInitial = false) => {
    if (isInitial) setLoading(true);

    if (currentPage === 'dashboard') {
      apiCall('/api/admin/stats').then(d => {
        if (d.success) { setStats(d.stats); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'users') {
      apiCall('/api/admin/users').then(d => {
        if (d.success) { setUsers(d.users); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'games' || currentPage === 'results') {
      apiCall('/api/admin/games').then(d => {
        if (d.success) { setGames(d.games); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'deposits') {
      apiCall('/api/admin/deposits').then(d => {
        if (d.success) { setDeposits(d.deposits); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'withdrawals') {
      apiCall('/api/admin/withdrawals').then(d => {
        if (d.success) { setWithdrawals(d.withdrawals); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'bids') {
      apiCall('/api/admin/bids').then(d => {
        if (d.success) { setBids(d.bids); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });
      
    // ✅ FIX: Notices ke liye fetch route
    } else if (currentPage === 'notices') {
      apiCall('/api/admin/notices').then(d => {
        if (d.success) { setNotices(d.notices || []); setLastRefresh(new Date()); }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else if (currentPage === 'settings' || currentPage === 'support') {
      apiCall('/api/admin/settings').then(d => {
        if (d.success && d.settings) {
          setSettings(d.settings);
          setSupport(prev => ({
            phone:            d.settings.phone            || d.settings.support_phone    || prev.phone,
            whatsapp:         d.settings.whatsapp         || d.settings.whatsapp_number  || prev.whatsapp,
            telegram:         d.settings.telegram         || d.settings.telegram_user    || prev.telegram,
            support_hours:    d.settings.support_hours    || prev.support_hours,
            support_email:    d.settings.support_email    || prev.support_email,
            telegram_channel: d.settings.telegram_channel || prev.telegram_channel,
          }));
        }
        if (isInitial) setLoading(false);
      }).catch(() => { if (isInitial) setLoading(false); });

    } else {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(page, true);

    // ✅ Realtime refresh 
    const realtimePages = ['dashboard', 'bids', 'deposits', 'withdrawals', 'notices'];
    let interval = null;

    if (realtimePages.includes(page)) {
      interval = setInterval(() => {
        fetchPageData(page, false);
      }, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [page]);

  const navigateTo = (id) => { setPage(id); setDrawerOpen(false); };

  // ── USER ACTIONS ──
  const toggleBlock = async (id, blocked) => {
    const res = await apiCall(`/api/admin/users/${id}/block`, 'PUT', { block: !blocked });
    if (res.success) {
      setUsers(us => us.map(u => u.id === id ? { ...u, is_blocked: !blocked } : u));
      showToast(blocked ? 'User unblocked ✅' : 'User blocked 🚫');
    }
  };

  const addCoins = async (id) => {
    const a = prompt('Kitne coins ADD karne hain?');
    if (!a) return;
    const res = await apiCall(`/api/admin/users/${id}/coins`, 'PUT', { amount: Number(a), action: 'add', wallet: 'wallet' });
    if (res.success) {
      showToast('Coins added ✅');
      fetchPageData('users', false); // ✅ UI Update fix
    } else {
      showToast('Error: ' + res.message);
    }
  };

  const deductCoins = async (id) => {
    const a = prompt('Kitne coins DEDUCT karne hain?');
    if (!a) return;
    const res = await apiCall(`/api/admin/users/${id}/coins`, 'PUT', { amount: Number(a), action: 'deduct', wallet: 'wallet' });
    if (res.success) {
      showToast('Coins deducted ✅');
      fetchPageData('users', false); // ✅ UI Update fix
    } else {
      showToast('Error: ' + res.message);
    }
  };

  // ── GAME ACTIONS ──
  const addGame = async () => {
    if (!newGame.name || !newGame.open_time) return;
    const res = await apiCall('/api/admin/games', 'POST', newGame);
    if (res.success) {
      setGames(gs => [...gs, res.game]);
      setNewGame({ name: '', open_time: '', close_time: '' });
      showToast('Game added ✅');
    }
  };
  const toggleGameStatus = async (id, status) => {
    const newStatus = status === 'open' ? 'closed' : 'open';
    const res = await apiCall(`/api/admin/games/${id}/status`, 'PUT', { status: newStatus });
    if (res.success) {
      setGames(gs => gs.map(g => g.id === id ? { ...g, status: newStatus } : g));
      showToast(`Game ${newStatus} ✅`);
    }
  };
  const declareResult = async (gameId) => {
    const val = resultForm[gameId];
    if (!val) return;
    const parts = val.split('-');
    const res = await apiCall(`/api/admin/games/${gameId}/result`, 'PUT', {
      open_result: parts[0] || '', close_result: parts[1] || ''
    });
    if (res.success) {
      setGames(gs => gs.map(g => g.id === gameId ? { ...g, result: val } : g));
      setResultForm(rf => ({ ...rf, [gameId]: '' }));
      showToast('Result declared! Winners credited ✅');
    } else {
      showToast('Error: ' + (res.message || 'Failed'));
    }
  };

  // ── DEPOSIT / WITHDRAWAL ──
  const updateDeposit = async (id, action) => {
    const res = await apiCall(`/api/admin/deposits/${id}`, 'PUT', { action });
    if (res.success) {
      setDeposits(ds => ds.map(d => d.id === id ? { ...d, status: action === 'approve' ? 'approved' : 'rejected' } : d));
      showToast(`Deposit ${action}d ✅`);
    }
  };
  const updateWithdrawal = async (id, action) => {
    const res = await apiCall(`/api/admin/withdrawals/${id}`, 'PUT', { action });
    if (res.success) {
      setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: action === 'approve' ? 'approved' : 'rejected' } : w));
      showToast(`Withdrawal ${action}d ✅`);
    }
  };

  // ── SETTINGS SAVE ──
  const saveSettings = async () => {
    const res = await apiCall('/api/admin/settings', 'POST', settings);
    if (res.success) { setSettingsSaved(true); showToast('Settings saved ✅'); setTimeout(() => setSettingsSaved(false), 2000); }
    else showToast('Error saving settings');
  };

  const saveSupport = async () => {
    const merged = { ...settings, ...support };
    const res = await apiCall('/api/admin/settings', 'POST', merged);
    if (res.success) {
      setSupportSaved(true);
      showToast('Support settings saved ✅');
      setTimeout(() => setSupportSaved(false), 2000);
    } else {
      showToast('Error saving support settings');
    }
  };

  const SIDEBAR = [
    { id: 'dashboard',   ic: '📊', l: 'Dashboard' },
    { id: 'users',       ic: '👥', l: 'Users' },
    { id: 'games',       ic: '🎮', l: 'Games' },
    { id: 'deposits',    ic: '💰', l: 'Deposits' },
    { id: 'withdrawals', ic: '💸', l: 'Withdrawals' },
    { id: 'bids',        ic: '🎯', l: 'All Bids' },
    { id: 'results',     ic: '🏆', l: 'Declare Result' },
    { id: 'notices',     ic: '🔔', l: 'Notices' }, // ✅ FIX: Sidebar link added
    { id: 'settings',    ic: '⚙️', l: 'Settings' },
    { id: 'support',     ic: '💬', l: 'Support System' },
  ];

  const pageTitles = {
    dashboard:   '📊 Dashboard',
    users:       '👥 Users',
    games:       '🎮 Games',
    deposits:    '💰 Deposits',
    withdrawals: '💸 Withdrawals',
    bids:        '🎯 All Bids',
    results:     '🏆 Declare Result',
    notices:     '🔔 Notices',     // ✅ FIX: Title added
    settings:    '⚙️ Settings',
    support:     '💬 Support System',
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid #e0e0e0', fontSize: 14, marginBottom: 12,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
  };
  const labelStyle = {
    fontSize: 11, color: '#888', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 1,
    display: 'block', marginBottom: 6
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5', fontFamily: 'Roboto,sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, background: '#1a1a2e',
          color: '#f0a500', padding: '12px 20px', borderRadius: 10,
          border: '1px solid #f0a500', zIndex: 9999, fontWeight: 600
        }}>{toast}</div>
      )}

      {/* NAVBAR */}
      <div style={{
        background: 'linear-gradient(135deg,#0d3526,#1a5c3a)',
        height: 56, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
        position: 'sticky', top: 0, zIndex: 200, flexShrink: 0
      }}>
        <button onClick={() => setDrawerOpen(true)} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 8, width: 38, height: 38, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 5, padding: 0
        }}>
          {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 18, height: 2, background: '#fff', borderRadius: 2 }} />)}
        </button>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
          SAKTA <span style={{ color: '#f0a500' }}>MATKA</span> — Admin
        </div>
        <button className="admin-logout" onClick={() => { localStorage.removeItem('mk_token'); onLogout(); }}>
          Logout
        </button>
      </div>

      {/* DRAWER OVERLAY */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300
        }} />
      )}

      {/* SIDE DRAWER */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100%',
        width: 260, background: '#0d3526', zIndex: 400,
        overflowY: 'auto', paddingBottom: 40,
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: drawerOpen ? '4px 0 20px rgba(0,0,0,0.4)' : 'none'
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#0d3526,#1a7a4a)',
          padding: '20px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>
              SAKTA <span style={{ color: '#f0a500' }}>MATKA</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Admin Control Panel</div>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
            color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase', padding: '14px 18px 6px', fontWeight: 600 }}>Navigation</div>
        {SIDEBAR.map(s => (
          <div key={s.id} onClick={() => navigateTo(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: page === s.id ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderLeft: page === s.id ? '3px solid #f0a500' : '3px solid transparent',
            color: page === s.id ? '#fff' : 'rgba(255,255,255,0.72)',
            fontSize: 14, fontWeight: page === s.id ? 600 : 400, transition: 'all 0.15s'
          }}>
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{s.ic}</span>
            {s.l}
            {page === s.id && <span style={{ marginLeft: 'auto', color: '#f0a500', fontSize: 12 }}>●</span>}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '16px 14px', overflowY: 'auto', background: '#f5f5f5' }}>

        {/* Page title + last refresh indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 22, fontWeight: 700, color: '#0d3526' }}>
            {pageTitles[page]}
          </div>
          {['dashboard','bids','deposits','withdrawals','notices'].includes(page) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#e8f5e9', border: '1px solid #a5d6a7',
              borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#2e7d32'
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
                display: 'inline-block', animation: 'pulse 2s infinite'
              }}/>
              Live · 15s
              {lastRefresh && (
                <span style={{ color: '#888', fontSize: 10 }}>
                  · {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>

        {loading && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Loading...</div>}

        {/* DASHBOARD */}
        {!loading && page === 'dashboard' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { val: stats.total_users || 0, label: 'Total Users', color: '#22c55e', icon: '👥' },
              { val: stats.active_games || 0, label: 'Active Games', color: '#a855f7', icon: '🎮' },
              { val: stats.today_bids?.count || 0, label: 'Aaj ke Bids', color: '#f0a500', icon: '🎯' },
              { val: '₹' + (stats.today_bids?.volume || 0).toLocaleString(), label: 'Bid Volume', color: '#f0a500', icon: '📈' },
              { val: stats.pending_deposits?.count || 0, label: 'Pending Deposits', color: '#ef4444', icon: '⏳' },
              { val: '₹' + (stats.pending_deposits?.volume || 0).toLocaleString(), label: 'Pending Dep. Amt', color: '#ef4444', icon: '💳' },
              { val: stats.pending_withdrawals?.count || 0, label: 'Pending Withdraw', color: '#f97316', icon: '🔄' },
              { val: '₹' + (stats.pending_withdrawals?.volume || 0).toLocaleString(), label: 'Pending With. Amt', color: '#f97316', icon: '💵' },
              { val: '₹' + (stats.total_deposited || 0).toLocaleString(), label: 'Total Deposited', color: '#3b82f6', icon: '🏦' },
              { val: '₹' + (stats.total_winnings_paid || 0).toLocaleString(), label: 'Winnings Paid', color: '#ec4899', icon: '🏆' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 10, padding: '14px 16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${s.color}`,
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {!loading && page === 'users' && (
          <div>
            {users.length === 0
              ? <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Koi user nahi mila</div>
              : users.map(u => (
                <UserCard key={u.id} u={u}
                  onBlock={toggleBlock}
                  onAddCoins={addCoins}
                  onDeductCoins={deductCoins} />
              ))}
          </div>
        )}

       {!loading && page === 'games' && <>
  <div className="admin-card">
    <div className="admin-card-title">➕ Add New Game</div>
    <input className="admin-input" placeholder="Game Name (e.g. Kalyan)"
      value={newGame.name} onChange={e => setNewGame({ ...newGame, name: e.target.value })} />
    <input className="admin-input" placeholder="Open Time (e.g. 10:00 AM)"
      value={newGame.open_time} onChange={e => setNewGame({ ...newGame, open_time: e.target.value })} />
    <input className="admin-input" placeholder="Close Time (e.g. 12:00 PM)"
      value={newGame.close_time} onChange={e => setNewGame({ ...newGame, close_time: e.target.value })} />
    
    <button className="admin-btn" onClick={async () => {
        if (!newGame.name || !newGame.open_time || !newGame.close_time) {
            showToast('Saari details bhariye!');
            return;
        }
        const res = await apiCall('/api/admin/games', 'POST', { ...newGame, category: 'regular' });
        if (res.success) {
            setGames(gs => [...gs, res.game || res.data]);
            setNewGame({ name: '', open_time: '', close_time: '' });
            showToast('Game Add Ho Gaya! ✅');
            fetchPageData('games'); 
        } else {
            showToast('Error: ' + res.message);
        }
    }}>+ Add Game</button>
  </div>

  <div className="admin-card">
    <div className="admin-card-title">🎮 All Games</div>
    {games.length === 0 ? <div style={{color:'#888', textAlign:'center'}}>No games found.</div> : 
      games.map(g => (
      <div key={g.id} style={{
        background: '#180404', borderRadius: 10, padding: '12px 14px',
        marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
        opacity: g.is_hidden ? 0.6 : 1 // 🔥 Hidden game thoda dhundhla dikhega
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#f0a500' }}>
            {g.name} {g.is_hidden && <span style={{fontSize: 10, color: '#ff2244'}}>(HIDDEN)</span>}
          </div>
          <div style={{ fontSize: 11, color: '#f0a500', marginTop: 2 }}>{g.open_time} – {g.close_time}</div>
          <div style={{ fontSize: 12, color: '#d21010', marginTop: 2 }}>Result: <strong>{g.result || '—'}</strong></div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display:'flex', gap: 6 }}>
            
            {/* 🔥 HIDE / UNHIDE BUTTON 🔥 */}
            <button 
              onClick={async () => {
                const res = await apiCall(`/api/admin/games/${g.id}/hide`, 'PUT', { hide: !g.is_hidden });
                if(res.success) {
                  showToast(g.is_hidden ? 'Game Show Kar Diya! 👁️' : 'Game Hide Kar Diya! 🙈');
                  setGames(gs => gs.map(item => item.id === g.id ? { ...item, is_hidden: !g.is_hidden } : item));
                }
              }}
              style={{ padding: '6px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', background: g.is_hidden ? '#22c55e' : '#f0a500', color: '#000', fontSize: 11, fontWeight: 'bold' }}
            >
              {g.is_hidden ? '👁️ Show' : '🙈 Hide'}
            </button>

            {/* DELETE BUTTON */}
            <button 
              onClick={async () => {
                if(!window.confirm(`Kya aap "${g.name}" ko delete karna chahte hain?`)) return;
                const res = await apiCall(`/api/admin/games/${g.id}`, 'DELETE');
                if(res.success) {
                  showToast('Game Delete Ho Gaya! 🗑️');
                  setGames(prev => prev.filter(item => item.id !== g.id));
                }
              }}
              style={{ padding: '6px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 'bold' }}
            >🗑️ Delete</button>
          </div>
          
          <button onClick={() => toggleGameStatus(g.id, g.status)} style={{
              padding: '4px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 11,
              background: g.status === 'open' ? '#dcfce7' : '#fee2e2',
              color: g.status === 'open' ? '#16a34a' : '#dc2626'
            }}>
              {g.status?.toUpperCase()}
          </button>
        </div>
      </div>
    ))}
  </div>
</>}
        {/* DEPOSITS */}
        {!loading && page === 'deposits' && (
          <div>
            {deposits.length === 0
              ? <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Koi deposit request nahi</div>
              : deposits.map(d => (
                <DepositCard key={d.id} d={d}
                  onApprove={id => updateDeposit(id, 'approve')}
                  onReject={id => updateDeposit(id, 'reject')} />
              ))}
          </div>
        )}

        {/* WITHDRAWALS */}
        {!loading && page === 'withdrawals' && (
          <div>
            {withdrawals.length === 0
              ? <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Koi withdrawal request nahi</div>
              : withdrawals.map(w => (
                <WithdrawCard key={w.id} w={w}
                  onApprove={id => updateWithdrawal(id, 'approve')}
                  onReject={id => updateWithdrawal(id, 'reject')} />
              ))}
          </div>
        )}

        {/* BIDS */}
        {!loading && page === 'bids' && (
          <div>
            {bids.length === 0
              ? <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Koi bid nahi mili</div>
              : bids.map(b => (
                <div key={b.id} style={{
                  background: '#ffffff', borderRadius: 10, padding: 14, marginBottom: 10,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700 }}>{b.name}</div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: b.status === 'win' ? '#dcfce7' : b.status === 'loss' ? '#fee2e2' : '#fff3cd',
                      color: b.status === 'win' ? '#16a34a' : b.status === 'loss' ? '#dc2626' : '#b45309'
                    }}>{b.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
                    Game: <strong>{b.game_name}</strong> · Session: <strong style={{color:'#f0a500'}}>{b.session ? b.session.toUpperCase() : 'N/A'}</strong> · Type: <strong>{b.game_type}</strong><br />
                    Number: <strong>{b.number}</strong> · Amount: <strong>₹{Number(b.amount).toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                    {new Date(b.created_at).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* DECLARE RESULT */}
        {!loading && page === 'results' && (
          <div className="admin-card">
            <div className="admin-card-title">🏆 Declare Results</div>
            <p style={{ color: '#aaa', fontSize: 12, marginBottom: 16 }}>
              Format: <strong>OpenPana-ClosePana</strong> (e.g. <code>128-456</code>)<br />
              Digit auto-calculate hoga. Winners ko winning_balance credit milega.
            </p>
            {games.map(g => (
              <div key={g.id} style={{ background: '#110c02', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>
                  {g.open_time} – {g.close_time} · Current: <strong>{g.result || '—'}</strong>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="admin-input" style={{ flex: 1, margin: 0 }}
                    placeholder="e.g. 128-456"
                    value={resultForm[g.id] || ''}
                    onChange={e => setResultForm(rf => ({ ...rf, [g.id]: e.target.value }))} />
                  <button className="admin-btn" onClick={() => declareResult(g.id)}>Set</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ FIX: NOTICES (NEW UI ADDED) */}
        {!loading && page === 'notices' && (
          <div className="admin-card">
            <div className="admin-card-title">🔔 Send Notification</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input
                className="admin-input"
                style={{ flex: 1, margin: 0 }}
                placeholder="Message likhein (e.g. Aaj Kalyan game band rahega...)"
                value={noticeMsg}
                onChange={e => setNoticeMsg(e.target.value)}
              />
              <button className="admin-btn" onClick={async () => {
                if(!noticeMsg) return;
                const res = await apiCall('/api/admin/notices', 'POST', { message: noticeMsg, type: 'info' });
                if(res.success) {
                  showToast('Notice sent ✅');
                  setNoticeMsg('');
                  fetchPageData('notices');
                } else {
                  showToast('Error: ' + (res.message || 'Failed'));
                }
              }}>Send</button>
            </div>

            <div className="admin-card-title">📋 Active Notifications</div>
            {notices.length === 0 ? (
              <div style={{ color: '#888', fontSize: 13 }}>Koi active notice nahi hai.</div>
            ) : (
              notices.map(n => (
                <div key={n.id} style={{ background: '#110c02', padding: 12, borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#fff', fontSize: 13 }}>{n.message}</div>
                  <button onClick={async () => {
                    if(!window.confirm('Delete this notice?')) return;
                    const res = await apiCall(`/api/admin/notices/${n.id}`, 'DELETE');
                    if(res.success) { showToast('Notice deleted ✅'); fetchPageData('notices'); }
                  }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 'bold' }}>Delete</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* SETTINGS */}
        {!loading && page === 'settings' && (
          <div className="admin-card">
            <div className="admin-card-title">⚙️ Site Settings</div>

            <label style={labelStyle}>UPI ID (QR auto-update hoga)</label>
            <input className="admin-input" placeholder="yourname@upi"
              value={settings.upi_id || ''}
              onChange={e => setSettings(s => ({ ...s, upi_id: e.target.value }))} />

            {settings.upi_id && (
              <div style={{ textAlign: 'center', margin: '10px 0 16px' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>QR Preview:</div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('upi://pay?pa=' + settings.upi_id + '&pn=MatkaKing&cu=INR')}`}
                  alt="UPI QR"
                  style={{ borderRadius: 10, border: '2px solid #0d3526', display: 'inline-block' }}
                />
                <div style={{ fontSize: 12, color: '#0d3526', marginTop: 6, fontWeight: 700 }}>{settings.upi_id}</div>
              </div>
            )}

            <label style={labelStyle}>WhatsApp Number</label>
            <input className="admin-input" placeholder="91XXXXXXXXXX"
              value={settings.whatsapp || ''}
              onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} />

            <label style={labelStyle}>Site Name</label>
            <input className="admin-input" placeholder="MatkaKing"
              value={settings.site_name || ''}
              onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))} />

            <button className="admin-btn" onClick={saveSettings} style={{ width: '100%', padding: 12 }}>
              {settingsSaved ? '✅ Saved!' : '💾 Save Settings'}
            </button>
          </div>
        )}

        {/* SUPPORT SYSTEM */}
        {!loading && page === 'support' && (
          <div>
            <div style={{
              background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 10,
              padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#2e7d32'
            }}>
              💡 Yahan jo bhi change karoge, woh <strong>Support page</strong> pe users ko dikh jaayega.
            </div>

            <div className="admin-card">
              <div className="admin-card-title">📞 Contact Details</div>

              <label style={labelStyle}>Phone Number</label>
              <input style={inputStyle} type="tel" placeholder="9999999999" maxLength={15}
                value={support.phone}
                onChange={e => setSupport(s => ({ ...s, phone: e.target.value }))} />

              <label style={labelStyle}>WhatsApp Number (with country code)</label>
              <input style={inputStyle} type="tel" placeholder="919999999999"
                value={support.whatsapp}
                onChange={e => setSupport(s => ({ ...s, whatsapp: e.target.value }))} />

              <label style={labelStyle}>Telegram Username</label>
              <input style={inputStyle} placeholder="matkaking_support"
                value={support.telegram}
                onChange={e => setSupport(s => ({ ...s, telegram: e.target.value.replace('@','') }))} />

              <label style={labelStyle}>Telegram Channel (optional)</label>
              <input style={inputStyle} placeholder="matkaking_official"
                value={support.telegram_channel}
                onChange={e => setSupport(s => ({ ...s, telegram_channel: e.target.value.replace('@','') }))} />

              <label style={labelStyle}>Support Email (optional)</label>
              <input style={inputStyle} type="email" placeholder="support@matkaking.com"
                value={support.support_email}
                onChange={e => setSupport(s => ({ ...s, support_email: e.target.value }))} />
            </div>

            <div className="admin-card">
              <div className="admin-card-title">🕐 Support Hours</div>
              <label style={labelStyle}>Support Timing</label>
              <input style={inputStyle} placeholder="Mon–Sat 10AM–8PM"
                value={support.support_hours}
                onChange={e => setSupport(s => ({ ...s, support_hours: e.target.value }))} />
            </div>

            <button onClick={saveSupport} style={{
              width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 15, marginBottom: 20,
              background: supportSaved ? '#22c55e' : 'linear-gradient(135deg,#0d3526,#1a7a4a)',
              color: '#fff', transition: 'all 0.2s'
            }}>
              {supportSaved ? '✅ Support Settings Saved!' : '💾 Save Support Settings'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}