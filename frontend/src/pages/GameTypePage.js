import React from 'react';
import { GameIcon } from '../components/Icons';
import { GAME_TYPES } from '../data/gameData';

// ── Disawar specific game types ──────────────────────────────────────────────
const DISAWAR_GAME_TYPES = [
  { id: 'single_digit',      label: 'LEFT DIGIT',   icon: 'single_digit', desc: 'Open result digit (0–9)',  win: '9.5',  numType: 'ank' },
  { id: 'jodi_digit',        label: 'RIGHT DIGIT',  icon: 'jodi',         desc: 'Close result digit (0–9)', win: '9.5',  numType: 'ank' },
  { id: 'jodi_bulk',         label: 'JODI',         icon: 'jodi',         desc: 'Pick 2-digit Jodi 00–99',  win: '95',   numType: 'jodi' },
  { id: 'single_digit_bulk', label: 'JODI BULK',    icon: 'bulk',         desc: 'Multiple Jodi bets',       win: '95',   numType: 'jodi_bulk' },
  { id: 'odd_even',          label: 'ODD / EVEN',   icon: 'odd_even',     desc: 'Bet on Odd or Even digit', win: '2',    numType: 'oddeven' },
  { id: 'family_jodi',       label: 'FAMILY JODI',  icon: 'family',       desc: 'Play all family combos',   win: '95',   numType: 'jodi_bulk' },
  { id: 'crossing_jodi',     label: 'CROSSING JODI',icon: 'cross',        desc: 'Cross digits for Jodis',   win: '95',   numType: 'jodi_bulk' },
  { id: 'cycle_jodi',        label: 'CYCLE JODI',   icon: 'cycle_jodi',   desc: 'All jodis with a digit',   win: '95',   numType: 'jodi_bulk' },
];

// ── Starline specific game types ─────────────────────────────────────────────
const STARLINE_GAME_TYPES = GAME_TYPES.filter(gt =>
  ['single_digit', 'single_pana', 'double_pana', 'triple_pana',
   'single_pana_bulk', 'double_pana_bulk', 'sp_common', 'dp_common',
   'sp_dp_tp', 'family_pana', 'odd_even'].includes(gt.id)
);

export default function GameTypePage({ game, onSelect }) {
  const category = game?.game_category?.toLowerCase() || game?.category?.toLowerCase() || '';

  const isStarline = category === 'starline';
  const isDisawar  = category === 'disawar';

  const activeGameTypes = isStarline
    ? STARLINE_GAME_TYPES
    : isDisawar
      ? DISAWAR_GAME_TYPES
      : GAME_TYPES;

  const renderWaveText = (text) => text || null;

  return (
    <div className="game-type-page screen" style={{
      background: 'linear-gradient(145deg, rgba(2,26,20,0.9), rgba(6,61,53,0.8))',
      minHeight: '100vh',
      paddingTop: '20px',
      paddingBottom: '80px',
      overscrollBehavior: 'none',
    }}>

      {/* Game Name Banner */}
      {game && (
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 900,
            color: '#FFD700', textTransform: 'uppercase', letterSpacing: 3,
            textShadow: '0 0 20px rgba(255,215,0,0.6)', display: 'inline-block', position: 'relative'
          }} className="gc-name">
            {renderWaveText(game.name || 'SELECT TYPE')}
          </div>
        </div>
      )}

      <div className="game-type-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        padding: '15px'
      }}>
        {activeGameTypes.map((gt, i) => (
          <div
            key={gt.id}
            className="gt-cell anim-in"
            style={{
              animationDelay: `${i * 0.03}s`,
              background: 'linear-gradient(145deg, rgba(2,26,20,0.95), rgba(6,61,53,0.85))',
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
            {/* Sweep animation */}
            <div style={{
              position: 'absolute', inset: 0, padding: 1.5, borderRadius: 14,
              background: 'linear-gradient(90deg, transparent 30%, rgba(0,255,213,0.6) 50%, transparent 70%)',
              backgroundSize: '250% 100%',
              animation: 'sweepRTL 2.8s linear infinite',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'
            }} />

            {/* Icon */}
            <div className="gt-icon-wrap" style={{
              width: '60px', height: '60px', borderRadius: '50%', marginBottom: '12px',
              background: 'rgba(0, 255, 213, 0.05)',
              border: '1.5px solid rgba(0,255,213,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(0,255,213,0.1)',
              position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <GameIcon name={gt.icon} />
            </div>

            {/* Label — yellow, no blue */}
            <div className="gt-label" style={{
              fontSize: '15px', fontWeight: 800,
              color: '#FFD700',           // ✅ always yellow, kabhi blue nahi
              letterSpacing: '0.5px', textAlign: 'center',
              fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase',
              textShadow: '0 2px 5px rgba(0,0,0,0.5)',
              minHeight: '46px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexWrap: 'wrap',
              width: '100%', padding: '0 5px', lineHeight: '1.3'
            }}>
              {renderWaveText(gt.label)}
            </div>

            {/* Win multiplier badge */}
            {gt.win && (
              <div style={{
                marginTop: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#00ffd5',
                opacity: 0.8,
                letterSpacing: '0.5px'
              }}>
                {gt.win}x WIN
              </div>
            )}

          </div>
        ))}
      </div>

      <style>{`
        @keyframes sweepRTL {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        .gc-name::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.7), transparent);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shineMove 3s infinite;
        }
        @keyframes shineMove {
          0%   { left: -100%; }
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