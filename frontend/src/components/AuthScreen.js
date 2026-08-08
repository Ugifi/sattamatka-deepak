import React, { useState, useEffect, useRef } from 'react';
import { DepositModal } from './OtherPages';

function getMatkaDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  if (ist.getUTCHours() < 2) {
    ist.setUTCDate(ist.getUTCDate() - 1);
  }
  return ist.toISOString().split('T')[0];
}

export default function HomeScreen({ wallet, onAdd, onWith, onPlay, navigate, apiCall, onViewChart, openDisawar, onDisawarOpened }) {
  const [games, setGames] = useState([]);
  const [starlineGames, setStarlineGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [disawarGames, setDisawarGames] = useState([]);
  const [selectedDisawarGame, setSelectedDisawarGame] = useState(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  
  const [activeView, setActiveView] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = 0;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

 const handleTouchEnd = () => {
  if (!touchStartX.current || !touchEndX.current) return;
  const distance = touchStartX.current - touchEndX.current;
  const isLeftSwipe = distance > 50;
  const isRightSwipe = distance < -50;
  if (isLeftSwipe) setActiveView(prev => (prev + 1) % 3);
  else if (isRightSwipe) setActiveView(prev => (prev - 1 + 3) % 3);
  touchStartX.current = 0;
  touchEndX.current = 0;
};
  const [settings, setSettings] = useState({
    site_name: 'MATKA KING',
    whatsapp: '9999999999',
    telegram: 'matkaking_support',
    phone: '9999999999',
    ticker_text: '',
  });

  const DISAWAR_GAME_TYPES = [
    { id: 'single_digit',       label: 'Left Digit',     icon: '🎯', desc: 'Open result digit',    win: '9.5',   numType: 'ank'       },
    { id: 'single_digit_close', label: 'Right Digit',    icon: '🎰', desc: 'Close result digit',   win: '9.5',   numType: 'ank'       },
    { id: 'jodi_digit',         label: 'Jodi',           icon: '🎲', desc: 'Two digit pair',        win: '95',    numType: 'jodi'      },
    { id: 'jodi_bulk',          label: 'Jodi Bulk',      icon: '📦', desc: 'Multiple Jodis',        win: '95',    numType: 'jodi_bulk' },
    { id: 'odd_even',           label: 'Odd / Even',     icon: '⚖️', desc: 'Odd ya Even pick karo', win: '2',     numType: 'odd_even'  },
    { id: 'family_jodi',        label: 'Family Jodi',    icon: '👨‍👩‍👧', desc: 'Family jodi set',        win: '95',    numType: 'jodi'      },
    { id: 'crossing_jodi',      label: 'Crossing Jodi',  icon: '✂️', desc: 'Crossing combination',  win: '95',    numType: 'jodi_bulk' },
    { id: 'cycle_jodi',         label: 'Cycle Jodi',     icon: '🔄', desc: 'Cycle jodi set',        win: '95',    numType: 'jodi_bulk' },
  ];

 const slides = [
  { img: `${process.env.PUBLIC_URL}/1.jpeg` },
  { img: `${process.env.PUBLIC_URL}/2.jpeg` },
  { img: `${process.env.PUBLIC_URL}/3.jpeg` },
  { img: `${process.env.PUBLIC_URL}/4.jpeg` },
  { img: `${process.env.PUBLIC_URL}/5.jpeg` },
  { img: `${process.env.PUBLIC_URL}/12.jpeg` },
  { img: `${process.env.PUBLIC_URL}/8.jpeg` },
  { img: `${process.env.PUBLIC_URL}/13.jpeg` },
 
];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (openDisawar) {
      setActiveView(2);
      setSelectedDisawarGame(null);
      if (onDisawarOpened) onDisawarOpened();
    }
  }, [openDisawar]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const API_URL = 'https://sattamatka-deepak-hy1n.onrender.com';
        const res = await fetch(`${API_URL}/api/admin/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data?.success && data?.settings) {
          const s = data.settings;
          setSettings({
            site_name:   s.site_name   || 'MATKA KING',
            whatsapp:    s.whatsapp    || s.whatsapp_support || '9999999999',
            telegram:    s.telegram    || 'matkaking_support',
            phone:       s.phone       || s.support_phone   || '9999999999',
            ticker_text: s.ticker_text || s.notice_text     || '',
          });
        }
      } catch (err) {
        console.log('Settings fetch failed, using defaults');
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const API_URL = 'https://sattamatka-deepak-hy1n.onrender.com';
        const res = await fetch(`${API_URL}/api/games`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        let allGames = [];
        if (Array.isArray(data)) allGames = data;
        else if (data?.games) allGames = data.games;
        else if (data?.data) allGames = data.data;

        const disawar = allGames.filter(g =>
          g.name?.toLowerCase().includes('disawar') ||
          g.category?.toLowerCase() === 'disawar' ||
          g.game_category?.toLowerCase() === 'disawar'
        );
        const starline = allGames.filter(g =>
          g.name?.toLowerCase().includes('starline') ||
          g.category?.toLowerCase() === 'starline' ||
          g.game_category?.toLowerCase() === 'starline'
        );
        const main = allGames.filter(g =>
          !g.name?.toLowerCase().includes('disawar') &&
          g.category?.toLowerCase() !== 'disawar' &&
          g.game_category?.toLowerCase() !== 'disawar' &&
          !g.name?.toLowerCase().includes('starline') &&
          g.category?.toLowerCase() !== 'starline' &&
          g.game_category?.toLowerCase() !== 'starline'
        );

        setGames(main);
        setStarlineGames(starline);
        setDisawarGames(disawar.length > 0 ? disawar : allGames.filter(g => g.name?.toLowerCase().includes('disawar')));
      } catch (err) {
        setGames([{ id: 1, name: 'TIME BAZAR', open_time: '01:00:00', close_time: '02:00:00', status: 'closed', result: null }]);
        setStarlineGames([{ id: 2, name: 'STARLINE MORNING', open_time: '09:00:00', close_time: '09:30:00', status: 'open', result: null }]);
        setDisawarGames([{ id: 10, name: 'DISAWAR', open_time: '05:00:00', close_time: '04:30:00', status: 'open', result: null }]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const isTimePassed = (timeStr, delaySeconds = 30) => {
    if (!timeStr) return false;
    try {
      const now = new Date();
      const [h, m, s] = timeStr.split(':').map(Number);
      const gameDate = new Date();
      gameDate.setHours(h, m, s || 0, 0);
      const diff = (now.getTime() - gameDate.getTime()) / 1000;
      return diff >= delaySeconds;
    } catch { return false; }
  };

  const formatResult = (g) => {
    let openRes = g.open_result;
    let closeRes = g.close_result;
    const nowH = new Date().getHours();
    if (nowH >= 1 && nowH < 6) return '***-**-***';
    if (openRes && !isTimePassed(g.open_time, 30)) openRes = null;
    if (closeRes && !isTimePassed(g.close_time, 30)) closeRes = null;
    const open  = openRes  || '***';
    const close = closeRes || '***';
    let jodi = '**';
    if (openRes) {
      const openDigit = String(openRes).split('').reduce((sum, d) => sum + parseInt(d, 10), 0) % 10;
      if (closeRes) {
        const closeDigit = String(closeRes).split('').reduce((sum, d) => sum + parseInt(d, 10), 0) % 10;
        jodi = `${openDigit}${closeDigit}`;
      } else {
        jodi = `${openDigit}*`;
      }
    }
    return `${open}-${jodi}-${close}`;
  };

  // Yeh function decide karta hai TODAY slot mein kya dikhao
  const formatDisawarResult = (g) => {
    const matkaDate = getMatkaDate();
    const jodiRes = g.jodi_result;
    const hasJodi = jodiRes && String(jodiRes).trim() !== '';

    // result_date available hai — compare karo
    if (g.result_date) {
      // result_date aaj ka nahi hai — yeh kal ka result hai, today mein ** dikhao
      if (g.result_date !== matkaDate) return '**';
      // result_date aaj ka hai — jodi_result today mein dikhao
      if (hasJodi) {
        const j = String(jodiRes).replace(/[^0-9]/g, '');
        if (/^\d{2}$/.test(j)) return j;
      }
      return '**';
    }

    // result_date NULL hai — purana logic fallback
    if (!hasJodi) return '**';
    const j = String(jodiRes).replace(/[^0-9]/g, '');
    if (/^\d{2}$/.test(j)) return j;

    const closeRes = g.close_result;
    if (!closeRes || !isTimePassed(g.close_time, 30)) return '**';
    const cleaned = String(closeRes).replace(/[^0-9]/g, '');
    if (/^\d{2}$/.test(cleaned)) return cleaned;

    const openRes = g.open_result;
    if (openRes && closeRes) {
      const od = String(openRes).split('').reduce((s, c) => s + parseInt(c), 0) % 10;
      const cd = String(closeRes).split('').reduce((s, c) => s + parseInt(c), 0) % 10;
      return `${od}${cd}`;
    }
    return '**';
  };

  // Yeh function decide karta hai YESTERDAY slot mein kya dikhao
  const getDisawarYesterdayJodi = (g) => {
    const matkaDate = getMatkaDate();
    const jodiRes = g.jodi_result;
    const hasJodi = jodiRes && String(jodiRes).trim() !== '';

    // result_date available hai
    if (g.result_date) {
      if (g.result_date === matkaDate) {
        // Aaj ka result aa gaya — yesterday mein prev_jodi_result dikhao
        return g.prev_jodi_result || '--';
      } else {
        // result_date alag hai — jodi_result khud kal ka hai, yesterday mein dikhao
        if (hasJodi) {
          const j = String(jodiRes).replace(/[^0-9]/g, '');
          if (/^\d{2}$/.test(j)) return j;
        }
        return g.prev_jodi_result || '--';
      }
    }

    // result_date NULL hai — agar jodi_result hai toh wo kal ka samjho
    if (hasJodi) {
      const j = String(jodiRes).replace(/[^0-9]/g, '');
      if (/^\d{2}$/.test(j)) return j;
    }
    return g.prev_jodi_result || '--';
  };

  const getDisawarStatus = (g) => {
    const hasClose = g.close_result && String(g.close_result).trim() !== '';
    if (hasClose) return { text: 'Closed for today', canPlay: false };
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const toMins = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const closeMins = toMins(g.close_time);
    const isNextDay = closeMins < 6 * 60;
    let isClosed = false;
    if (isNextDay) isClosed = nowMins >= closeMins && nowMins < 6 * 60;
    else isClosed = nowMins >= closeMins;
    if (isClosed) return { text: 'Closed for today', canPlay: false };
    return { text: 'Market is open', canPlay: true };
  };

  const getGameStatus = (g) => {
    const hasOpen  = g.open_result  && String(g.open_result).trim()  !== '';
    const hasClose = g.close_result && String(g.close_result).trim() !== '';
    if (hasOpen && hasClose) return { text: 'Closed for today', canPlay: false };
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const toMins = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const closeMins = toMins(g.close_time);
    const isLateNightGame = closeMins >= 22 * 60;
    const isAfterMidnight = nowMins < 2 * 60;
    let isClosed = false;
    if (isLateNightGame && isAfterMidnight) isClosed = false;
    else isClosed = nowMins >= closeMins;
    if (isClosed) return { text: 'Closed for today', canPlay: false };
    if (hasOpen) return { text: 'Running for close', canPlay: true };
    return { text: 'Market is open', canPlay: true };
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    } catch { return timeStr; }
  };

  const isAdminImpersonating = localStorage.getItem('mk_admin_token');
  const backToAdmin = () => {
    localStorage.setItem('mk_token', localStorage.getItem('mk_admin_token'));
    localStorage.removeItem('mk_admin_token');
    window.location.href = '/?admin=1';
  };

  const getGameIcon = (name) => {
    if (!name) return '🎯';
    const n = name.toUpperCase();
    if (n.includes('TIME')) return '⏳';
    if (n.includes('MILAN')) return '🎲';
    if (n.includes('KALYAN')) return '👑';
    if (n.includes('RAJDHANI')) return '🏰';
    if (n.includes('MAIN')) return '💎';
    if (n.includes('MADHUR')) return '🏺';
    if (n.includes('SRIDEVI')) return '👸';
    if (n.includes('SUPREME')) return '🌟';
    if (n.includes('KUBER')) return '💰';
    if (n.includes('NIGHT')) return '🌙';
    if (n.includes('DAY')) return '☀️';
    return '🎰';
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

  if (selectedDisawarGame) {
    const digitTypes  = DISAWAR_GAME_TYPES.slice(0, 2);
    const jodiTypes   = DISAWAR_GAME_TYPES.slice(2, 4);
    const extraTypes  = DISAWAR_GAME_TYPES.slice(4);

    return (
      <div className="screen" style={{ paddingBottom: 80, backgroundColor: '#021a14', minHeight: '100vh', color: '#fff', fontFamily: "'Poppins', sans-serif" }}>
        <style>{`
          @keyframes sweepRTL { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
          .anim-in { animation: fadeInUp 0.35s ease both; }
          .dgt-cell { transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
          .dgt-cell:hover { transform: translateY(-3px) scale(1.02); border-color: rgba(0,255,213,0.5) !important; box-shadow: 0 0 20px rgba(0,255,213,0.15) !important; }
        `}</style>

        <div style={{ background: 'linear-gradient(135deg, #053c3a, #053c3a)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setSelectedDisawarGame(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{selectedDisawarGame.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Game Type Select Karo</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, fontWeight: 900, color: '#FFD700', textTransform: 'uppercase', letterSpacing: 3, textShadow: '0 0 20px rgba(255,215,0,0.6)' }}>
            {selectedDisawarGame.name}
          </div>
        </div>

        <div style={{ padding: '8px 14px 20px' }}>

          {/* DIGIT GAMES */}
          <div style={{ fontSize: 13, fontWeight: 800, color: '#FFD700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, borderLeft: '3px solid #FFD700', paddingLeft: 10 }}>Digit Games</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {digitTypes.map((gt, i) => (
              <div key={i} className="dgt-cell anim-in"
                style={{ animationDelay: `${i * 0.05}s`, background: 'linear-gradient(145deg, rgba(2,26,20,0.95), rgba(6,61,53,0.9))', padding: '22px 12px', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1.5px solid rgba(255,215,0,0.3)', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}
                onClick={() => onPlay(selectedDisawarGame, gt)}>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 900, color: '#FFD700' }}>{gt.win}x</div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,215,0,0.08)', border: '1.5px solid rgba(255,215,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 10 }}>{gt.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#FFD700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{gt.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{gt.desc}</div>
              </div>
            ))}
          </div>

          {/* JODI GAMES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {jodiTypes.map((gt, i) => (
              <div key={i} className="dgt-cell anim-in"
                style={{ animationDelay: `${(i+2) * 0.05}s`, background: 'linear-gradient(145deg, rgba(2,26,20,0.95), rgba(6,61,53,0.9))', padding: '22px 12px', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1.5px solid rgba(255,215,0,0.3)', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}
                onClick={() => onPlay(selectedDisawarGame, gt)}>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 900, color: '#FFD700' }}>{gt.win}x</div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,215,0,0.08)', border: '1.5px solid rgba(255,215,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 10 }}>{gt.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#FFD700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{gt.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{gt.desc}</div>
              </div>
            ))}
          </div>

          {/* MORE GAMES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {extraTypes.map((gt, i) => (
              <div key={i} className="dgt-cell anim-in"
                style={{ animationDelay: `${(i+4) * 0.05}s`, background: 'linear-gradient(145deg, rgba(2,26,20,0.95), rgba(6,61,53,0.9))', padding: '22px 12px', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1.5px solid rgba(255,215,0,0.3)', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}
                onClick={() => onPlay(selectedDisawarGame, gt)}>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 900, color: '#FFD700' }}>{gt.win}x</div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,215,0,0.08)', border: '1.5px solid rgba(255,215,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 10 }}>{gt.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#FFD700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{gt.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{gt.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // ── RENDER GAMES LIST ──────────────────────────────────────────
  const renderGamesList = (gamesList, isDisawarStyle = false, hideOpenTime = false) => {
    if (loading) return <div style={{ textAlign: 'center', color: '#00ffd5', padding: 40, fontWeight: 700 }}>⏳ Loading Games...</div>;
    if (gamesList.length === 0) return <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>Koi game available nahi hai.</div>;

    return gamesList.map(g => {
      const status = isDisawarStyle ? getDisawarStatus(g) : getGameStatus(g);
      const formatStarlineResult = (g) => {
  const openRes = g.open_result;
  if (!openRes) return '***-*';
  const digits = String(openRes).replace(/[^0-9]/g, '');
  if (digits.length < 3) return '***-*';
  const sum = digits.split('').reduce((s, d) => s + parseInt(d), 0) % 10;
  return `${digits}-${sum}`;
};
      return (
        <div key={g.id} className="game-wrapper">
          <div className="game-card-content">

            {(isDisawarStyle || hideOpenTime) ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#00ffd5', fontWeight: 800, background: 'rgba(0,255,213,0.1)', padding: '3px 12px', borderRadius: 4, border: '1px solid rgba(0,255,213,0.3)' }}>
                  🕐 Close: {formatTime(g.close_time)}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 10, color: '#00ffd5', fontWeight: 800, background: 'rgba(0,255,213,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(0,255,213,0.3)' }}>
  Open: {formatTime(g.open_time)}
</div>
                <div style={{ position: 'relative' }} onMouseEnter={() => setTooltipInfo(g.id)} onMouseLeave={() => setTooltipInfo(null)} onClick={() => setTooltipInfo(tooltipInfo === g.id ? null : g.id)}>
                  <div style={{ color: '#00ffd5', border: '1.5px solid rgba(0,255,213,0.6)', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, cursor: 'pointer', background: 'rgba(0,255,213,0.1)' }}>i</div>
                  {tooltipInfo === g.id && (
                    <div style={{ position: 'absolute', right: 0, top: 22, background: '#021a14', border: '1px solid rgba(0,255,213,0.4)', borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 10, fontWeight: 700, zIndex: 50, whiteSpace: 'nowrap', boxShadow: '0 8px 16px rgba(0,0,0,0.8)' }}>
                      <div style={{ marginBottom: 4 }}>🟢 Open: <span style={{ color: '#00ffd5' }}>{formatTime(g.open_time)}</span></div>
                      <div>🔴 Close: <span style={{ color: '#00ffd5' }}>{formatTime(g.close_time)}</span></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <div className="gc-name">
  <span style={{ animation: 'none', background: 'none', WebkitTextFillColor: 'initial', textShadow: 'none' }}>{getGameIcon(g.name)}&nbsp;</span>
  {hideOpenTime ? renderWaveText(formatTime(g.name)) : renderWaveText(g.name)}
</div>
            </div>

            {isDisawarStyle ? (
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '8px 0', gap: 8 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>YESTERDAY'S JODI</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'rgba(0,255,213,0.5)', letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>
                    {getDisawarYesterdayJodi(g)}
                  </div>
                </div>
                <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.15)' }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>TODAY'S JODI</div>
                  <div className="result-number" style={{ fontSize: 15, fontWeight: 900, color: '#00ffd5', letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>
                    {formatDisawarResult(g)}
                  </div>
                </div>
              </div>
            ) : (
             <div className="result-number" style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#00ffd5', margin: '4px 0 8px 0', letterSpacing: '3px', fontFamily: "'Orbitron', sans-serif" }}>
  {hideOpenTime ? formatStarlineResult(g) : formatResult(g)}
</div>
            )}

            <div style={{ fontSize: 10, color: status.canPlay ? '#00cc44' : '#ff2244', fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, letterSpacing: 2 }}>
              <span style={{ width: 7, height: 7, background: status.canPlay ? '#00cc44' : '#ff2244', borderRadius: '50%', display: 'inline-block', boxShadow: status.canPlay ? '0 0 6px #00cc44' : '0 0 6px #ff2244' }}></span>
              {status.text.toUpperCase()}
            </div>

            <button onClick={() => status.canPlay && (isDisawarStyle ? setSelectedDisawarGame(g) : onPlay(g))} disabled={!status.canPlay} className={status.canPlay ? 'play-btn-active' : 'play-btn-disabled'}>
              {status.canPlay && <span className="rotate-icon" style={{ fontSize: 12 }}>◀</span>}
              {status.canPlay ? 'PLAY NOW' : 'MARKET CLOSED'}
            </button>

            <button onClick={() => onViewChart(g)} style={{ width: '100%', padding: '8px', border: '1.5px solid rgba(0,255,213,0.4)', borderRadius: '10px', background: 'rgba(0,255,213,0.08)', color: '#00ffd5', fontWeight: 800, fontSize: 12, cursor: 'pointer', marginTop: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
              📊 VIEW CHART
            </button>
          </div>
        </div>
      );
    });
  };

  // ── MAIN HOME ──────────────────────────────────────────────────
  return (
    <div className="screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ paddingBottom: 80, backgroundColor: '#021a14', minHeight: '100vh', color: '#fff', fontFamily: "'Poppins', sans-serif" }}
    >
      {isAdminImpersonating && (
        <button onClick={backToAdmin} style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#0d1b5e', color: '#FFD700', padding: '8px 16px', borderRadius: 8, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
          ⬅️ Back to Admin
        </button>
      )}

      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .infinite-slider { display: flex; gap: 10px; width: max-content; animation: scroll 15s linear infinite; }
        .infinite-slider:hover { animation-play-state: paused; }
        @keyframes spinIcon { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        .rotate-icon { display: inline-block; animation: spinIcon 2s linear infinite; }
        .game-wrapper { position: relative; border-radius: 10px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,255,213,0.15); transition: transform 0.2s ease, box-shadow 0.3s ease; overflow: hidden; padding: 2.5px; }
        .game-wrapper:hover { transform: translateY(-3px); box-shadow: 0 0 5px rgba(0, 255, 213, 0.8), 0 0 15px rgba(0, 255, 213, 0.6), 0 0 30px rgba(0, 255, 213, 0.4); }
        .game-card-content { position: relative; background: linear-gradient(145deg, #021a14, #063d35); border-radius: 8px; padding: 10px 12px; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: center; }
        .play-btn-active { width: 100%; padding: 10px; border: none; border-radius: 10px 40px 10px 40px; color: #001a17; font-weight: 900; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(90deg, #14f4ce, #e0800b); transition: all 0.3s ease; letter-spacing: 2px; text-transform: uppercase; box-shadow: none; position: relative; overflow: hidden; }
        .play-btn-active::before { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.7), transparent); animation: shineMove 2.5s infinite linear; }
        @keyframes shineMove { 0% { left: -100%; } 100% { left: 100%; } }
        .play-btn-disabled { width: 100%; padding: 10px; background: #69e2a6; border: 1px solid rgba(0,255,213,0.1); border-radius: 10px 40px 10px 40px; color: #3a5a4a; font-weight: 900; font-size: 13px; cursor: not-allowed; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); text-transform: uppercase; }
        @keyframes resultGlow { from { text-shadow: 0 0 5px #00ffd5; } to { text-shadow: 0 0 20px #00aaff; } }
        .result-number { animation: resultGlow 1.5s infinite alternate; }
        .gc-name { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 900; letter-spacing: 2px; position: relative; display: inline-block; text-transform: uppercase; background: linear-gradient(180deg, #fff2a8, #ffd700, #ff9900); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 0 #cc9900, 0 4px 10px rgba(0,0,0,0.6); margin-top: 2px; }
        .gc-name span { display: inline-block; }
        @keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .slider-dot { width: 10px; height: 10px; borderRadius: 50%; background: rgba(0,255,213,0.3); transition: all 0.3s ease; }
        .slider-dot.active { background: #00ffd5; width: 24px; borderRadius: 5px; box-shadow: 0 0 8px rgba(0,255,213,0.6); }
      `}</style>

      {/* MARQUEE */}
      <div style={{ background: 'rgba(2,20,15,0.95)', padding: '6px 0', borderBottom: '1px solid rgba(0,255,213,0.18)', overflow: 'hidden' }}>
        <marquee style={{ color: '#00ffd5', fontSize: 12, fontWeight: 800, letterSpacing: '0.5px' }}>
          {settings.ticker_text || `Welcome To ${settings.site_name}... Play and Enjoy! Contact: ${settings.phone}`}
        </marquee>
      </div>

      <div style={{ padding: '-12px -12px 0 -12px' }}>

        {/*  SLIDER */}
        <div style={{ overflow: 'hidden', borderRadius: '14px 14px 0 0', height: 200, position: 'relative', margin: '0 -12px', marginBottom: '-20px' }}>
          {slides.map((b, i) => (
            <div key={i} style={{ 
  position: 'absolute', 
  inset: 1, 
  opacity: currentSlide === i ? 1 : 0, 
  transition: 'opacity 0.5s ease', 
  pointerEvents: currentSlide === i ? 'auto' : 'none'
}}>
              <img 
                src={b.img} 
                alt={`-${i}`}
                onError={(e) => { e.target.style.display = 'none'; }}
               style={{ 
  width: '95%', 
  marginLeft: '10px',
  height: '90%', 
  objectFit: 'fill',
  display: 'block',
  borderRadius: 14
}}
              />
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setCurrentSlide(i)} style={{ width: 7, height: 7, borderRadius: 4, background: currentSlide === i ? '#fff' : 'rgba(255,255,255,0.35)', transition: 'all 0.3s', cursor: 'pointer' }} />
            ))}
          </div>
        </div>

        {/* SLIDER TAB BUTTONS */}
        <div style={{ display: 'flex', gap: 10, margin: 6, marginbottom: '10px', background: 'rgba(79, 225, 199, 0.4)', padding: 5, borderRadius: 14, border: '1px solid rgba(0,255,213,0.2)' }}>
          <button onClick={() => setActiveView(1)} style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 12, cursor: 'pointer', letterSpacing: 1, transition: 'all 0.3s ease', background: activeView === 1 ? 'linear-gradient(145deg, #021a14, #063d35)' : 'transparent', color: activeView === 1 ? '#edf729' : 'rgb(250, 248, 248)', boxShadow: activeView === 1 ? '0 4px 10px  #7dece8' : 'none', textTransform: 'uppercase' }}>
            ⭐ Starline
          </button>
          <button onClick={() => setActiveView(0)} style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 12, cursor: 'pointer', letterSpacing: 1, transition: 'all 0.3s ease', background: activeView === 0 ? 'linear-gradient(145deg, #021a14, #063d35)' : 'transparent', color: activeView === 0 ? '#edf729' : 'rgb(255, 255, 255)', boxShadow: activeView === 0 ? '0 4px 10px  #7dece8' : 'none', textTransform: 'uppercase' }}>
            🏠 Main Bazar
          </button>
          <button onClick={() => setActiveView(2)} style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer', letterSpacing: 1, transition: 'all 0.3s ease', background: activeView === 2 ? 'linear-gradient(145deg, #021a14, #063d35)' : 'transparent', color: activeView === 2 ? '#edf729' : 'rgb(255, 255, 255)', boxShadow: activeView === 2 ? '0 4px 10px #7dece8' : 'none', textTransform: 'uppercase' }}>
            🎯 Disawar
          </button>
        </div>
        


        
        {/* GAMES */}
        <div style={{ transition: 'all 0.3s ease' }}>
          {activeView === 0 && renderGamesList(games)}
          {activeView === 1 && renderGamesList(starlineGames, false, true)}
          {activeView === 2 && renderGamesList(disawarGames, true)}
        </div>
      </div>
    </div>
  );
}
