import React from 'react';
import { GameIcon } from '../components/Icons';
import { GAME_TYPES } from '../data/gameData'; // ✅ FIX: Removed DISAWAR_GAME_TYPES

export default function GameTypePage({ game, onSelect }) {
  // ✅ Used only GAME_TYPES to avoid import error
  const activeGameTypes = GAME_TYPES;

  // 🔥 Wave Animation Generator for Labels 🔥
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
  animationDelay: currentDelay,
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden'
}}
            >
              {char}
            </span>
          );
        })}
        {/* ✅ FIX: Added a breakable space span between words so they wrap to next line */}
        {wIdx < arr.length - 1 && <span style={{ display: 'inline-block', width: '4px' }}>&nbsp;</span>}
      </React.Fragment>
    ));
  };

  return (
      <div className="game-type-page screen" style={{ 
  background: 'linear-gradient(145deg, rgba(2,26,20,0.9), rgba(6,61,53,0.8))',
  minHeight: '100vh', 
  paddingTop: '20px',
  paddingBottom: '100px',
  overscrollBehavior: 'none',
  transform: 'translateZ(0)',
  WebkitTransform: 'translateZ(0)'
}}>
      
      {/* Game Name Banner (Bigger & Yellow) */}
      {game && (
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 900,
            color: '#FFD700', textTransform: 'uppercase', letterSpacing: 3,
            textShadow: '0 0 20px rgba(255,215,0,0.6)', display: 'inline-block', position: 'relative'
          }} className="gc-name">
             {renderWaveText(game.name || "SELECT TYPE")}
          </div>
        </div>
      )}

      <div className="game-type-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px' }}>
        {activeGameTypes.map((gt, i) => (
          <div
            key={gt.id}
            className="gt-cell anim-in"
            style={{ 
              animationDelay: `${i * 0.03}s`,
              background: 'linear-gradient(145deg, rgba(2,26,20,0.9), rgba(6,61,53,0.8))',
              padding: '28px 12px', 
              borderRadius: '14px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              border: '1px solid rgba(0, 255, 213, 0.15)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s'
            }}
            onClick={() => onSelect(gt)}
          >
            {/* 🔥 Smooth Right-to-Left Wave Sweep 🔥 */}
            <div style={{
              position: 'absolute', inset: 0, padding: 1.5, borderRadius: 14,
              background: 'linear-gradient(90deg, transparent 30%, rgba(0,255,213,0.6) 50%, transparent 70%)',
              backgroundSize: '250% 100%', 
              animation: 'sweepRTL 2.8s linear infinite', // ✅ Smooth Right-to-Left
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'
            }}></div>

            {/* Icon Wrapper */}
            <div className="gt-icon-wrap" style={{
              width: '60px', height: '60px', borderRadius: '50%', marginBottom: '12px',
              background: 'rgba(0, 255, 213, 0.05)', border: '1.5px solid rgba(0,255,213,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(0,255,213,0.1)', position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <GameIcon name={gt.icon} />
            </div>
            
            {/* 🔥 Animated Label (Text Wrapping Fixed) 🔥 */}
            <div className="gt-label" style={{
              fontSize: '18px', fontWeight: 800, color: '#FFD700',
              letterSpacing: '0.5px', textAlign: 'center',
              fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase',
              textShadow: '0 2px 5px rgba(0,0,0,0.5)',
              minHeight: '46px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexWrap: 'wrap', // ✅ FIX: Allows text to wrap to the next line
              width: '100%', 
              padding: '0 5px',
              lineHeight: '1.3'
            }}>
              {renderWaveText(gt.label)}
            </div>

          </div>
        ))}
      </div>

      <style>{`
        /* ✅ Smooth Right to Left Wave Animation */
        @keyframes sweepRTL {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
       @keyframes wave {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}
        .gc-name::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.7), transparent);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shineMove 3s infinite;
        }
        @keyframes shineMove {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .gt-cell:hover {
          transform: translateY(-3px) scale(1.02);
          border-color: rgba(0, 255, 213, 0.5) !important;
          box-shadow: 0 0 20px rgba(0,255,213,0.15) !important;
        }
        .gt-cell:hover .gt-icon-wrap {
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(0,255,213,0.3) !important;
        }
        .gt-icon-wrap svg { width: 30px; height: 30px; fill: #00ffd5; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-in { animation: fadeInUp 0.35s ease both; }
      `}</style>
    </div>
  );
}
