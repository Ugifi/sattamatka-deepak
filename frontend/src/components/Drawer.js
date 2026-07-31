import React from 'react';

export default function Drawer({ user, onClose, onNav, onLogout }) {
  const whatsappNumber = "919999999999"; // Apna WhatsApp no. daalein
  const telegramId = "matkaking_support"; // Apna Telegram username daalein

  // 🔥 Smart Image Checker Logic 🔥
  const API_URL = 'https://ziddi-1-we11.onrender.com';
  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky&backgroundColor=ffcc00";
  
  const getAvatarUrl = () => {
    if (!user?.profile_pic) return defaultAvatar;
    if (user.profile_pic.startsWith('http')) return user.profile_pic;
    return `${API_URL}${user.profile_pic}`;
  };

  // Reusable Section Label
  const SectionLabel = ({ text }) => (
    <div style={{ color: '#00ffd5', fontSize: 11, fontWeight: 800, padding: '15px 15px 5px 15px', letterSpacing: '1px', textTransform: 'uppercase' }}>
      {text}
    </div>
  );

  // Reusable Drawer Item
  const DrawerItem = ({ icon, label, onClick, iconBg = 'rgba(0,255,213,0.08)', iconBorder = 'rgba(0,255,213,0.2)', txtColor = '#fff' }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid rgba(0,255,213,0.08)', cursor: 'pointer', transition: 'background 0.2s' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: iconBg, border: `1px solid ${iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 15, fontSize: 16 }}>
        {icon}
      </div>
      <div style={{ fontSize: 14, color: txtColor, fontWeight: 600, flex: 1 }}>{label}</div>
      <div style={{ color: '#00ffd5', fontSize: 12 }}>❯</div>
    </div>
  );

  return (
    <>
      {/* 🔥 LOGOUT ARROW ANIMATION CSS 🔥 */}
      <style>{`
        @keyframes slideOutAnim {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>

      {/* Background Dark Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', zIndex: 1000 }} />
      
      {/* Side Menu Panel */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#011a13', zIndex: 1001, overflowY: 'auto', borderRight: '1px solid rgba(0,255,213,0.1)', color: '#fff' }}>
        
        {/* ─── USER INFO HEADER ─── */}
        <div style={{ padding: '20px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,255,213,0.1)', background: 'linear-gradient(135deg, #021a14, #063d35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img 
              src={getAvatarUrl()} 
              onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} 
              alt="Avatar"
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #00ffd5', boxShadow: '0 0 12px rgba(0,255,213,0.2)', background: '#0a2e26' }} 
            />
            <div>
              <div style={{ fontWeight: '900', fontSize: 16, color: '#fff', letterSpacing: '0.5px' }}>{user?.name || 'Vikas Verma'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>+91 {user?.mobile || '6375334550'}</div>
            </div>
          </div>
          <div onClick={onClose} style={{ fontSize: 22, color: '#00ffd5', cursor: 'pointer', padding: '0 5px' }}>✕</div>
        </div>

        {/* ─── QUICK BUTTONS (ADD FUND / WITHDRAW / BIDS) ─── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 10px', borderBottom: '1px solid rgba(0,255,213,0.08)', background: '#0a2e26' }}>
          <div onClick={() => { onNav('add'); onClose(); }} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 20 }}>💰</div>
            <div style={{ fontSize: 11, color: '#00ffd5', fontWeight: 800 }}>Add Fund</div>
          </div>
          <div onClick={() => { onNav('with'); onClose(); }} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.3)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 20 }}>💸</div>
            <div style={{ fontSize: 11, color: '#00ffd5', fontWeight: 800 }}>Withdraw</div>
          </div>
          <div onClick={() => { onNav('bids'); onClose(); }} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ background: 'rgba(0,255,213,0.1)', border: '1px solid rgba(0,255,213,0.3)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 20 }}>🎯</div>
            <div style={{ fontSize: 11, color: '#00ffd5', fontWeight: 800 }}>My Bids</div>
          </div>
        </div>

        {/* ─── ACCOUNT SECTION ─── */}
        <SectionLabel text="Account" />
        <DrawerItem icon="💼" label="My Wallet" onClick={() => { onNav('wallet'); onClose(); }} />
        <DrawerItem icon="📄" label="Transaction History" onClick={() => { onNav('txns'); onClose(); }} />
        <DrawerItem icon="✏️" label="Edit Profile" onClick={() => { onNav('profile'); onClose(); }} />

        {/* ─── GAMES SECTION ─── */}
        <SectionLabel text="Games" />
        <DrawerItem icon="🎮" label="All Games" onClick={() => { onNav('home'); onClose(); }} />
        <DrawerItem icon="🏆" label="Win History" onClick={() => { onNav('bids'); onClose(); }} />

        {/* ─── HELP & SUPPORT ─── */}
        <SectionLabel text="Help & Support" />
        <DrawerItem 
          icon="💬" label="WhatsApp Support" 
          iconBg="rgba(37,211,102,0.12)" iconBorder="rgba(37,211,102,0.35)" 
          onClick={() => { window.open(`https://wa.me/${whatsappNumber}`, '_blank'); onClose(); }} 
        />
        <DrawerItem 
          icon="✈️" label="Telegram Support" 
          iconBg="rgba(0,136,204,0.12)" iconBorder="rgba(0,136,204,0.35)" 
          onClick={() => { window.open(`https://t.me/${telegramId}`, '_blank'); onClose(); }} 
        />

        {/* ─── MORE SECTION ─── */}
        <SectionLabel text="More" />
        <DrawerItem icon="📖" label="How to Play" onClick={() => { onNav('htp'); onClose(); }} />
        <DrawerItem icon="❓" label="FAQ" onClick={() => { onNav('faq'); onClose(); }} />
        <DrawerItem icon="📜" label="Terms & Conditions" onClick={() => { onNav('terms'); onClose(); }} />
        <DrawerItem icon="🔒" label="Privacy Policy" onClick={() => { onNav('privacy'); onClose(); }} />

        {/* ─── LOGOUT (PURE SVG ANIMATED) ─── */}
        <div style={{ padding: '20px 15px', paddingBottom: '40px' }}>
          <div onClick={() => { onLogout(); onClose(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.25)', borderRadius: '8px', cursor: 'pointer' }}>
            
            {/* 🔥 PURE SVG CODE (Kabhi load hona fail nahi hoga) 🔥 */}
            <svg 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff1744" 
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
              style={{ marginRight: 10, animation: 'slideOutAnim 1.5s infinite ease-in-out' }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            
            <span style={{ color: '#ff1744', fontWeight: 800, fontSize: 16, letterSpacing: '1px' }}>LOGOUT</span>
          </div>
        </div>

      </div>
    </>
  );
}
