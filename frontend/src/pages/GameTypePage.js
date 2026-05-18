import React from 'react';
import { GameIcon } from '../components/Icons';
import { GAME_TYPES, DISAWAR_GAME_TYPES } from '../data/gameData';

export default function GameTypePage({ game, onSelect }) {

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

  // ✅ Disawar ke liye sirf 2 types, baaki sab ke liye sab types
  const activeGameTypes = game?.game_category === 'disawar' ? DISAWAR_GAME_TYPES : GAME_TYPES;

  return (
    <div className="game-type-page screen" style={{ 
      background: 'linear-gradient(145deg, #063d35, #021f1b)', 
      minHeight: '100vh', 
      paddingTop: '20px' 
    }}>
      
      {/* Agar upar Game ka naam dikhana ho toh yahan aayega */}
      {game && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif", fontSize: 24, fontWeight: 900,
            color: '#FFD700', textTransform: 'uppercase', letterSpacing: 2,
            textShadow: '0 0 10px rgba(255,215,0,0.6)', display: 'inline-block', position: 'relative'
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
              background: 'linear-gradient(145deg, #021a14, #063d35)',
              padding: '25px 10px',
              borderRadius: '15px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
            }}
            onClick={() => onSelect(gt)}
          >
            {/* 🔥 Moving Border Animation 🔥 */}
            <div style={{
              position: 'absolute', inset: 0, padding: 2, borderRadius: 15,
              background: 'linear-gradient(90deg, transparent, #00ffd5, transparent)',
              backgroundSize: '300% 300%', animation: 'borderMove 4s linear infinite',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'
            }}></div>

            {/* Icon Wrapper */}
            <div className="gt-icon-wrap" style={{
              width: '60px', height: '60px', borderRadius: '50%', marginBottom: '12px',
              background: 'rgba(0, 255, 213, 0.1)', border: '2px solid #00ffd5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px #00ffd5', position: 'relative'
            }}>
              <GameIcon name={gt.icon} />
            </div>
            
            {/* 🔥 Animated Label 🔥 */}
            <div className="gt-label" style={{
              fontSize: '15px', fontWeight: 900, color: '#FFD700',
              letterSpacing: '1.5px', textAlign: 'center',
              fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase',
              textShadow: '0 2px 5px rgba(0,0,0,0.5)'
            }}>
              {renderWaveText(gt.label)}
            </div>

          </div>
        ))}
      </div>

      <style>{`
        @keyframes borderMove {
          0% { background-position: 0% }
          100% { background-position: 300% }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
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
      `}</style>
    </div>
  );
}
