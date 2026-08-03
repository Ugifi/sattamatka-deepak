import React, { useState, useEffect } from 'react';
import { DepositModal } from './OtherPages';


export default function HomeScreen({ wallet, onAdd, onWith, onPlay, navigate, apiCall, onViewChart }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [disawarGames, setDisawarGames] = useState([]);
  const [showDisawar, setShowDisawar] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState(null);

  const [settings, setSettings] = useState({
    site_name: 'MATKA KING',
    whatsapp: '9999999999',
    telegram: 'matkaking_support',
    phone: '9999999999',
    ticker_text: '',
  });

  const banners = [
    { bg: 'linear-gradient(135deg, #113a39, #113a39)', text: 'DAILY Disawar', sub: 'Win Big Every Day!', emoji: '🏆', eyebrow: 'MATKAKING PRESENTS' },
    { bg: 'linear-gradient(135deg, #113a39, #113a39)', text: '100% SAFE & TRUSTED', sub: 'Instant Withdrawal', emoji: '🪙', eyebrow: 'MATKAKING PRESENTS' },
    { bg: 'linear-gradient(135deg, #113a39, #113a39)', text: 'FAST WITHDRAWAL', sub: 'Instant Money Transfer', emoji: '⚡', eyebrow: 'MATKAKING PRESENTS' },
    { bg: 'linear-gradient(135deg, #113a39, #113a39)', text: 'NEW GAMES ADDED', sub: 'Play & Win Now!', emoji: '🎯', eyebrow: 'MATKAKING PRESENTS' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % banners.length), 3000);
    return () => clearInterval(timer);
  }, []);

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
        const main = allGames.filter(g =>
          !g.name?.toLowerCase().includes('disawar') &&
          g.category?.toLowerCase() !== 'disawar' &&
          g.game_category?.toLowerCase() !== 'disawar'
        );

        setGames(main);
        setDisawarGames(disawar.length > 0 ? disawar : allGames.filter(g => g.name?.toLowerCase().includes('disawar')));
      } catch (err) {
        setGames([
          { id: 1, name: 'STARLINE MORNING', open_time: '09:00:00', close_time: '09:30:00', status: 'open',   result: null },
          { id: 2, name: 'TIME BAZAR',       open_time: '01:00:00', close_time: '02:00:00', status: 'closed', result: null },
        ]);
        setDisawarGames([
          { id: 10, name: 'DISAWAR', open_time: '05:00:00', close_time: '04:30:00', status: 'open', result: null },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // ✅ 30 Second Delay Logic
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

  // ✅ Result Format with 30 Sec Delay
  const formatResult = (g) => {
    let openRes = g.open_result;
    let closeRes = g.close_result;

    // 1 AM ke baad results hide karo (reset time)
    const nowH = new Date().getHours();
    if (nowH >= 1 && nowH < 6) {
      return '***-**-***';
    }

    if (openRes && !isTimePassed(g.open_time, 30)) {
      openRes = null;
    }
    if (closeRes && !isTimePassed(g.close_time, 30)) {
      closeRes = null;
    }

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

  const getGameStatus = (g) => {
  const hasOpen  = g.open_result  && String(g.open_result).trim()  !== '';
  const hasClose = g.close_result && String(g.close_result).trim() !== '';

  // Dono results aa gaye = band
  if (hasOpen && hasClose) {
    return { text: 'Closed for today', canPlay: false };
  }

  // ✅ Time comparison — minutes mein convert karke (midnight crossing handle)
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const toMins = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const closeMins = toMins(g.close_time);

  // Reset window: 2:00 AM = 120 mins tak games open rahein
  // Agar close_time raat ka hai (>= 22:00 = 1320 mins)
  // aur current time 2 AM se pehle hai (< 120 mins), toh abhi band nahi hui
  const isLateNightGame = closeMins >= 22 * 60; // 10 PM ke baad close hone wali games
  const isAfterMidnight = nowMins < 2 * 60;     // 12 AM - 2 AM window

  let isClosed = false;
  if (isLateNightGame && isAfterMidnight) {
    // Late night game, abhi 2 AM nahi hua — band nahi karni
    isClosed = false;
  } else {
    isClosed = nowMins >= closeMins;
  }

  if (isClosed) {
    return { text: 'Closed for today', canPlay: false };
  }

  if (hasOpen) {
    return { text: 'Running for close', canPlay: true };
  }

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

  const tickerContent = settings.ticker_text
    ? settings.ticker_text
    : `📞 Contact: ${settings.phone} &nbsp;&nbsp;&nbsp; 💳 Instant Withdrawal | 100% Safe &nbsp;&nbsp;&nbsp; 📞 Contact: ${settings.phone} &nbsp;&nbsp;&nbsp; 💳 Instant Withdrawal | 100% Safe`;

  // ✅ ADMIN IMPERSONATION CHECK
  const isAdminImpersonating = localStorage.getItem('mk_admin_token');
  const backToAdmin = () => {
    localStorage.setItem('mk_token', localStorage.getItem('mk_admin_token'));
    localStorage.removeItem('mk_admin_token');
    window.location.href = '/?admin=1'; // Wapas admin panel
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
            <span 
              key={charIndex} 
              style={{ 
                display: 'inline-block', 
                animation: 'wave 1.5s infinite', 
                animationDelay: currentDelay 
              }}
            >
              {char}
            </span>
          );
        })}
        {wIdx < arr.length - 1 && <>&nbsp;&nbsp;</>}
      </React.Fragment>
    ));
  };

  // ── DISAWAR PAGE ──────────────────────────────────────────────
  if (showDisawar) {
    return (
      <div className="screen" style={{ paddingBottom: 80, backgroundColor: '#021a14', minHeight: '100vh', color: '#fff', fontFamily: "'Poppins', sans-serif" }}>
        {/* ✅ BACK TO ADMIN BUTTON */}
        {isAdminImpersonating && (
          <button onClick={backToAdmin} style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#0d1b5e', color: '#FFD700', padding: '8px 16px', borderRadius: 8, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
            ⬅️ Back to Admin
          </button>
        )}

        <style>{`
          @keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes resultGlow { from { text-shadow: 0 0 5px #00ffd5; } to { text-shadow: 0 0 20px #00aaff; } }
          .result-number { animation: resultGlow 1.5s infinite alternate; }
          .gc-name { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 900; letter-spacing: 2px; position: relative; display: inline-block; text-transform: uppercase; background: linear-gradient(180deg, #fff2a8, #ffd700, #ff9900); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 0 #cc9900, 0 4px 10px rgba(0,0,0,0.6); margin-top: 2px; }
          .gc-name span { display: inline-block; }
          .play-btn-active { width: 100%; padding: 10px; border: none; border-radius: 10px 40px 10px 40px; color: #001a17; font-weight: 900; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(90deg, #14f4ce, #e0800b); transition: all 0.3s ease; letter-spacing: 2px; text-transform: uppercase; box-shadow: none; position: relative; overflow: hidden; }
          .play-btn-active::before { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.7), transparent); animation: shineMove 2.5s infinite linear; }
          @keyframes shineMove { 0% { left: -100%; } 100% { left: 100%; } }
          .play-btn-disabled { width: 100%; padding: 10px; background: #69e2a6; border: 1px solid rgba(0,255,213,0.1); border-radius: 10px 40px 10px 40px; color: #3a5a4a; font-weight: 900; font-size: 13px; cursor: not-allowed; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); text-transform: uppercase; }
          @keyframes spinIcon { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
          .rotate-icon { display: inline-block; animation: spinIcon 2s linear infinite; }
          .game-wrapper { position: relative; border-radius: 10px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,255,213,0.15); transition: transform 0.2s ease; overflow: hidden; padding: 2.5px; }
          .game-wrapper:hover { transform: translateY(-3px); }
          .game-card-content { position: relative; background: linear-gradient(145deg, #021a14, #063d35); border-radius: 8px; padding: 10px 12px; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: center; }
        `}</style>

        <div style={{ background: 'linear-gradient(135deg, #1a3a6e, #2356b0)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 3px 14px rgba(26,58,110,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setShowDisawar(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>MATKA DISAWAR</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{disawarGames.length} Game{disawarGames.length !== 1 ? 's' : ''} Available</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 14px 4px' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#2a6dd9', animation: 'livePulse 1.4s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: '#1a3a6e', letterSpacing: 1, textTransform: 'uppercase' }}>Disawar Markets</span>
          <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}`}</style>
        </div>

        <div style={{ padding: '0 12px' }}>
          {disawarGames.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#8a9bb5' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Koi Disawar game nahi mila</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Admin se games add karwao</div>
            </div>
          ) : (
            disawarGames.map((g) => {
              const status = getGameStatus(g);
              return (
                <div key={g.id} className="game-wrapper">
                  <div className="game-card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 10, color: '#00ffd5', fontWeight: 800, background: 'rgba(0,255,213,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(0,255,213,0.3)' }}>{g.open_time}</div>
                      <div style={{ fontSize: 10, color: '#00ffd5', fontWeight: 800, background: 'rgba(0,255,213,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(0,255,213,0.3)' }}>{g.close_time}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="gc-name">
                        <span style={{ animation: 'none', background: 'none', WebkitTextFillColor: 'initial', textShadow: 'none' }}>{getGameIcon(g.name)}&nbsp;</span>
                        {renderWaveText(g.name)}
                      </div>
                    </div>
                    <div className="result-number" style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#00ffd5', margin: '4px 0 8px 0', letterSpacing: '3px', fontFamily: "'Orbitron', sans-serif" }}>
                      {formatResult(g)}
                    </div>
                    <div style={{ fontSize: 10, color: status.canPlay ? '#00cc44' : '#ff2244', fontWeight: 800, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, letterSpacing: 2 }}>
                      <span style={{ width: 7, height: 7, background: status.canPlay ? '#00cc44' : '#ff2244', borderRadius: '50%', display: 'inline-block', boxShadow: status.canPlay ? '0 0 6px #00cc44' : '0 0 6px #ff2244' }}></span>
                      {status.text.toUpperCase()}
                    </div>
                    <button onClick={() => status.canPlay && onPlay(g)} disabled={!status.canPlay} className={status.canPlay ? 'play-btn-active' : 'play-btn-disabled'}>
                      {status.canPlay && <span className="rotate-icon" style={{ fontSize: 12 }}>◀</span>}
                      {status.canPlay ? 'PLAY NOW' : 'MARKET CLOSED'}
                    </button>

                     {/* 📊 CHART BUTTON - NEW */}
                    <button 
                      onClick={() => onViewChart(g)}
                      style={{ width: '100%', padding: '8px', border: '1.5px solid rgba(0,255,213,0.4)', borderRadius: '10px', background: 'rgba(0,255,213,0.08)', color: '#00ffd5', fontWeight: 800, fontSize: 12, cursor: 'pointer', marginTop: 8, letterSpacing: 1, textTransform: 'uppercase' }}
                    >
                      📊 VIEW CHART
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ── MAIN HOME ─────────────────────────────────────────────────
  return (
    <div className="screen" style={{ 
      paddingBottom: 80, 
      backgroundColor: '#021a14', 
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: "'Poppins', sans-serif" 
    }}>
      
      {/* ✅ BACK TO ADMIN BUTTON */}
      {isAdminImpersonating && (
        <button onClick={backToAdmin} style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#0d1b5e', color: '#FFD700', padding: '8px 16px', borderRadius: 8, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
          ⬅️ Back to Admin
        </button>
      )}

      <style>{`
        /* SLIDER ANIMATION */
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .infinite-slider {
          display: flex; gap: 10px; width: max-content;
          animation: scroll 15s linear infinite;
        }
        .infinite-slider:hover { animation-play-state: paused; }

        /* ACTION BUTTONS */
        .action-btn {
          flex: 1; padding: 12px; border: none; border-radius: 20px; 
          color: #fff; font-weight: 900; font-size: 13px; cursor: pointer; 
          display: flex; align-items: center; justify-content: center; gap: 6px; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: all 0.3s ease;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .action-btn:hover { transform: scale(1.03); }

        /* PLAY NOW SYMBOL ROTATE */
        @keyframes spinIcon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .rotate-icon { display: inline-block; animation: spinIcon 2s linear infinite; }

        /* 🔥 TOP BUTTONS ELECTRIC WRAPPER 🔥 */
        .top-btn-wrapper {
          flex: 1; position: relative; border-radius: 25px; overflow: hidden;
          padding: 2px; box-shadow: 0 4px 10px rgba(0,255,213,0.25);
          transition: transform 0.2s ease;
        }
        .top-btn-wrapper:hover { transform: translateY(-3px); }
        .top-btn-inner {
          width: 100%; height: 100%; padding: 10px;
          background: linear-gradient(145deg, #021a14, #063d35);
          border: none; border-radius: 3px; color: #00ffd5; font-weight: 900; font-size: 12px; 
          cursor: pointer; display: flex; align-items: center; justify-content: center; 
          gap: 6px; letter-spacing: 1px; position: relative; z-index: 2;
        }

        /* GAME CARD WRAPPER */
                .game-wrapper {
          position: relative; border-radius: 10px; margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(0,255,213,0.15); 
          transition: transform 0.2s ease, box-shadow 0.3s ease;
          overflow: hidden; padding: 2.5px;
        }
        .game-wrapper:hover { 
          transform: translateY(-3px); 
          /* 🔥 ELECTRIC GLOW 🔥 */
          box-shadow: 
            0 0 5px rgba(0, 255, 213, 0.8),   /* Sharp inner glow */
            0 0 15px rgba(0, 255, 213, 0.6),  /* Middle spread */
            0 0 30px rgba(0, 255, 213, 0.4);  /* Outer wide glow */
        }
        .game-card-content {
          position: relative; background: linear-gradient(145deg, #021a14, #063d35);
          border-radius: 8px; padding: 10px 12px; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: center;
        }

        /* 🔥 PLAY BUTTON ACTIVE 🔥 */
        .play-btn-active {
          width: 100%; 
          padding: 10px; 
          border: none; 
          border-radius: 10px 40px 10px 40px;
          color: #001a17; 
          font-weight: 900; 
          font-size: 13px; 
          cursor: pointer; 
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: linear-gradient(90deg, #14f4ce, #e0800b);
          transition: all 0.3s ease; 
          letter-spacing: 2px;
          text-transform: uppercase;
          box-shadow: none; 
          position: relative;
          overflow: hidden; 
        }
          
        .play-btn-active:hover {
          transform: scale(1.02);
          box-shadow: none;
        }

        /* 🔥 LEFT TO RIGHT SHINE ANIMATION 🔥 */
        .play-btn-active::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.7),
            transparent
          );
          animation: shineMove 2.5s infinite linear;
        }

        @keyframes shineMove {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .play-btn-disabled {
          width: 100%; padding: 10px; background: #69e2a6; 
          border: 1px solid rgba(0,255,213,0.1); border-radius: 10px 40px 10px 40px;
          color: #3a5a4a; font-weight: 900; font-size: 13px; cursor: not-allowed; 
          display: flex; align-items: center; justify-content: center; gap: 6px;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); text-transform: uppercase;
        }

        /* Result number glow */
        @keyframes resultGlow {
          from { text-shadow: 0 0 5px #00ffd5; }
          to   { text-shadow: 0 0 20px #00aaff; }
        }
        .result-number {
          animation: resultGlow 1.5s infinite alternate;
        }

        .gc-name {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 2px;
          position: relative;
          display: inline-block;
          text-transform: uppercase;
          background: linear-gradient(180deg, #fff2a8, #ffd700, #ff9900);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 0 #cc9900, 0 4px 10px rgba(0,0,0,0.6);
          margin-top: 2px;
        }
        
        .gc-name span {
          display: inline-block;
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* MARQUEE */}
      <div style={{ background: 'rgba(2,20,15,0.95)', padding: '6px 0', borderBottom: '1px solid rgba(0,255,213,0.18)', overflow: 'hidden' }}>
        <marquee style={{ color: '#00ffd5', fontSize: 12, fontWeight: 800, letterSpacing: '0.5px' }}>
          {settings.ticker_text || `Welcome To ${settings.site_name}... Play and Enjoy! Contact: ${settings.phone}`}
        </marquee>
      </div>

      <div style={{ padding: '12px 12px 0 12px' }}>
        
        {/* STARLINE & DISAWAR */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div className="top-btn-wrapper">
            <button className="top-btn-inner" onClick={() => navigate && navigate('starline')}>▶ STARLINE</button>
          </div>
          <div className="top-btn-wrapper">
            <button className="top-btn-inner" onClick={() => setShowDisawar(true)}>▶ DISAWAR</button>
          </div>
        </div>

        {/* BANNER SLIDER (Premium Blue) */}
        <div style={{ overflow: 'hidden', marginBottom: 14, borderRadius: 14, height: 115, position: 'relative', boxShadow: '0 6px 22px rgba(26,58,110,0.30)' }}>
          {banners.map((b, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 22px', background: b.bg, opacity: currentSlide === i ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: currentSlide === i ? 'auto' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: 2, marginBottom: 5 }}>{b.eyebrow}</div>
                <div style={{ fontSize: 21, fontWeight: 900, color: '#fff', fontFamily: "'Baloo 2', cursive", lineHeight: 1.15, marginBottom: 4 }}>{b.text}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{b.sub}</div>
              </div>
              <div style={{ fontSize: 44, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))' }}>{b.emoji}</div>
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
            {banners.map((_, i) => (
              <div key={i} onClick={() => setCurrentSlide(i)} style={{ width: 7, height: 7, borderRadius: 4, background: currentSlide === i ? '#fff' : 'rgba(255,255,255,0.35)', transition: 'all 0.3s', cursor: 'pointer' }} />
            ))}
          </div>
        </div>

        {/* ADD / WITHDRAW BUTTONS */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button onClick={() => setShowDeposit(true)} className="action-btn" style={{ background: 'linear-gradient(to right, #006622, #00cc44)' }}>
            💰 ADD MONEY
          </button>
          <button onClick={onWith} className="action-btn" style={{ background: 'linear-gradient(to right, #660011, #ff2244)' }}>
            💸 WITHDRAW
          </button>
        </div>

        {/* DEPOSIT MODAL */}
        {showDeposit && (
          <DepositModal
            apiCall={apiCall}
            onClose={() => setShowDeposit(false)}
            onSuccess={() => { setShowDeposit(false); }}
          />
        )}

        {/* GAMES LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#00ffd5', padding: 40, fontWeight: 700 }}>⏳ Loading Games...</div>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>Koi game available nahi hai.</div>
        ) : (
          games.map(g => {
            const status = getGameStatus(g);
            return (
              <div key={g.id} className="game-wrapper">
                <div className="game-card-content">
                  
                  {/* TOP ROW — Time + Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ 
                      fontSize: 10, color: '#00ffd5', fontWeight: 800,
                      background: 'rgba(0,255,213,0.1)', padding: '2px 8px',
                      borderRadius: 4, border: '1px solid rgba(0,255,213,0.3)'
                    }}>
                      Open: {g.open_time}
                    </div>
                    
                    <div 
                      style={{ position: 'relative' }} 
                      onMouseEnter={() => setTooltipInfo(g.id)}
                      onMouseLeave={() => setTooltipInfo(null)}
                      onClick={() => setTooltipInfo(tooltipInfo === g.id ? null : g.id)}
                    >
                      <div style={{ 
                        color: '#00ffd5', border: '1.5px solid rgba(0,255,213,0.6)', borderRadius: '50%', 
                        width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: 10, fontWeight: 900, cursor: 'pointer', background: 'rgba(0,255,213,0.1)'
                      }}>i</div>
                      
                      {tooltipInfo === g.id && (
                        <div style={{ 
                          position: 'absolute', right: 0, top: 22,
                          background: '#021a14', border: '1px solid rgba(0,255,213,0.4)',
                          borderRadius: 6, padding: '6px 10px', 
                          color: '#fff', fontSize: 10, fontWeight: 700, zIndex: 50, 
                          whiteSpace: 'nowrap', boxShadow: '0 8px 16px rgba(0,0,0,0.8)'
                        }}>
                          <div style={{ marginBottom: 4 }}>🟢 Open: <span style={{ color: '#00ffd5' }}>{formatTime(g.open_time)}</span></div>
                          <div>🔴 Close: <span style={{ color: '#00ffd5' }}>{formatTime(g.close_time)}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 🔥 GAME NAME WITH WAVE ANIMATION 🔥 */}
                  <div style={{ textAlign: 'center' }}>
                    <div className="gc-name">
                      <span style={{ animation: 'none', background: 'none', WebkitTextFillColor: 'initial', textShadow: 'none' }}>
                         {getGameIcon(g.name)}&nbsp;
                      </span>
                      {renderWaveText(g.name)}
                    </div>
                  </div>

                  {/* RESULT */}
                  <div className="result-number" style={{ 
                    textAlign: 'center', fontSize: 24, fontWeight: 900, color: '#00ffd5', 
                    margin: '4px 0 8px 0', letterSpacing: '3px',
                    fontFamily: "'Orbitron', sans-serif"
                  }}>
                    {formatResult(g)}
                  </div>

                  {/* STATUS DOT */}
                  <div style={{ 
                    fontSize: 10,
                    color: status.canPlay ? '#00cc44' : '#ff2244', 
                    fontWeight: 800, marginBottom: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    letterSpacing: 2
                  }}>
                    <span style={{ 
                      width: 7, height: 7,
                      background: status.canPlay ? '#00cc44' : '#ff2244', 
                      borderRadius: '50%', display: 'inline-block',
                      boxShadow: status.canPlay ? '0 0 6px #00cc44' : '0 0 6px #ff2244'
                    }}></span>
                    {status.text.toUpperCase()}
                  </div>

                  {/* PLAY BUTTON */}
                  <button 
                    onClick={() => status.canPlay && onPlay(g)} 
                    disabled={!status.canPlay} 
                    className={status.canPlay ? 'play-btn-active' : 'play-btn-disabled'}
                  >
                    {status.canPlay && <span className="rotate-icon" style={{ fontSize: 12 }}>◀</span>}
                    {status.canPlay ? 'PLAY NOW' : 'MARKET CLOSED'}
                  </button>
                     {/* 📊 CHART BUTTON - NEW */}
                  <button 
                    onClick={() => onViewChart(g)}
                    style={{ width: '100%', padding: '8px', border: '1.5px solid rgba(0,255,213,0.4)', borderRadius: '10px', background: 'rgba(0,255,213,0.08)', color: '#00ffd5', fontWeight: 800, fontSize: 12, cursor: 'pointer', marginTop: 8, letterSpacing: 1, textTransform: 'uppercase' }}
                  >
                    📊 VIEW CHART
                  </button>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
