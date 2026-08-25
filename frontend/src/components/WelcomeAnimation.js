import React, { useState, useEffect } from 'react';

export default function WelcomeAnimation({ onFinish, wallet }) {
  const [phase, setPhase] = useState(0); // 0=spin, 1=jackpot, 2=done
  const [reels, setReels] = useState([3, 5, 7]);
  const [fadeOut, setFadeOut] = useState(false);

  const symbols = ['7', '👑', '💎', '9', '🎰', '💰', '🏆', '⭐', '🃏', '6'];

  useEffect(() => {
    // Phase 0: Spinning reels
    const spinInterval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
      ]);
    }, 80);

    // Phase 1: Stop reels one by one
    const t1 = setTimeout(() => {
      clearInterval(spinInterval);
      setReels([0, 0, 0]); // 7 7 7
      setPhase(1);
    }, 2500);

    // Phase 2: Show continue button
    const t2 = setTimeout(() => setPhase(2), 4000);

    return () => { clearInterval(spinInterval); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleContinue = () => {
    setFadeOut(true);
    setTimeout(() => onFinish(), 600);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#021a14',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes waCurtainL{0%{transform:translateX(-100%)}100%{transform:translateX(0)}}
        @keyframes waCurtainR{0%{transform:translateX(100%)}100%{transform:translateX(0)}}
        @keyframes waGlow{0%,100%{box-shadow:0 0 20px rgba(0,255,213,0.15)}50%{box-shadow:0 0 50px rgba(0,255,213,0.4)}}
        @keyframes waReelBlur{0%{filter:blur(0)}50%{filter:blur(3px)}100%{filter:blur(0)}}
        @keyframes waShine{0%{left:-100%}100%{left:200%}}
        @keyframes waBounce{0%{transform:scale(0) rotate(-10deg)}60%{transform:scale(1.15) rotate(2deg)}100%{transform:scale(1) rotate(0)}}
        @keyframes waConfetti{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(80px) rotate(360deg);opacity:0}}
        @keyframes waPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes waStar{0%,100%{opacity:0.2;transform:scale(0.6)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes waFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes waReelStop{0%{transform:translateY(-8px)}50%{transform:translateY(4px)}100%{transform:translateY(0)}}
        @keyframes waBorderGlow{0%,100%{border-color:rgba(0,255,213,0.3)}50%{border-color:rgba(0,255,213,0.7)}}
        @keyframes waShake{0%,100%{transform:translateX(0)}10%{transform:translateX(-4px)}20%{transform:translateX(4px)}30%{transform:translateX(-3px)}40%{transform:translateX(3px)}50%{transform:translateX(0)}}
        @keyframes waRise{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes waNumGlow{0%,100%{text-shadow:0 0 8px rgba(0,255,213,0.5)}50%{text-shadow:0 0 25px rgba(0,255,213,0.9)}}
        @keyframes waBtnGlow{0%,100%{box-shadow:0 4px 20px rgba(0,255,213,0.3)}50%{box-shadow:0 4px 40px rgba(0,255,213,0.6)}}
      `}</style>

      {/* Background Orbs */}
      <div style={{ position:'absolute', top:'-20%', left:'-15%', width:300, height:300, borderRadius:'50%', background:'rgba(0,255,213,0.04)', filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-15%', right:'-10%', width:250, height:250, borderRadius:'50%', background:'rgba(255,215,0,0.05)', filter:'blur(50px)', pointerEvents:'none' }} />

      {/* Curtains */}
      <div style={{ position:'absolute', top:0, left:0, width:'45%', height:'100%', background:'linear-gradient(90deg,rgba(1,26,19,0.9),transparent)', animation:'waCurtainL 1.2s ease-out', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:0, right:0, width:'45%', height:'100%', background:'linear-gradient(-90deg,rgba(1,26,19,0.9),transparent)', animation:'waCurtainR 1.2s ease-out', pointerEvents:'none' }} />

      {/* Stars */}
      {[{t:8,l:12},{t:15,l:88},{t:25,l:5},{t:20,l:95},{t:5,l:50},{t:30,l:30},{t:10,l:70}].map((s,i)=>(
        <div key={i} style={{ position:'absolute', top:`${s.t}%`, left:`${s.l}%`, fontSize:8+Math.random()*6, color:'#FFD700', animation:`waStar ${1.5+i*0.3}s ease-in-out infinite ${i*0.2}s`, pointerEvents:'none' }}>✦</div>
      ))}

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ textAlign:'center', position:'relative', zIndex:2, padding:20, width:'100%', maxWidth:380 }}>

        {/* Diamond Logo */}
        <div style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          width:80, height:80, borderRadius:16, transform:'rotate(45deg)',
          background:'linear-gradient(135deg,rgba(0,255,213,0.12),rgba(255,215,0,0.08))',
          border:'2px solid rgba(0,255,213,0.35)',
          animation:'waGlow 2s ease-in-out infinite, waFloat 3s ease-in-out infinite',
          marginBottom:16,
        }}>
          <span style={{ transform:'rotate(-45deg)', fontSize:36 }}>👑</span>
        </div>

        <div style={{
          fontSize:26, fontWeight:900, letterSpacing:3,
          background:'linear-gradient(135deg,#00ffd5,#4dffd8,#00ffd5)',
          backgroundSize:'200% auto',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          animation:'waRise 0.8s ease-out 0.3s both',
        }}>MATKA BOSS</div>

        <div style={{
          fontSize:11, color:'#FFD700', fontWeight:700, letterSpacing:1.5, marginTop:3,
          animation:'waRise 0.8s ease-out 0.5s both',
        }}>India's #1 Premium Matka Platform</div>

        {/* ═══ SLOT MACHINE ═══ */}
        <div style={{
          marginTop:24, borderRadius:18, overflow:'hidden',
          background:'linear-gradient(180deg,#0a2e26,#063d35,#0a2e26)',
          border:'2px solid rgba(0,255,213,0.2)',
          boxShadow:'0 8px 32px rgba(0,255,213,0.12)',
          animation:'waRise 0.6s ease-out 0.6s both',
          position:'relative',
        }}>

          {/* Shine sweep */}
          <div style={{
            position:'absolute', top:0, left:-100, width:'50%', height:'100%',
            background:'linear-gradient(90deg,transparent,rgba(0,255,213,0.06),transparent)',
            animation:'waShine 3s ease-in-out infinite', pointerEvents:'none',
          }} />

          {/* Top label */}
          <div style={{
            padding:'10px 16px 6px', fontSize:9, color:'#FFD700', fontWeight:800,
            letterSpacing:2, textTransform:'uppercase',
            background:'rgba(0,255,213,0.04)',
            borderBottom:'1px solid rgba(0,255,213,0.08)',
          }}>
            🎰 Lucky Spin
          </div>

          {/* Reels */}
          <div style={{
            display:'flex', justifyContent:'center', gap:10, padding:'16px 20px',
          }}>
            {reels.map((r, i) => (
              <div key={i} style={{
                width:76, height:76, borderRadius:14,
                background:'linear-gradient(180deg,#0a2e26,#063d35,#0a2e26)',
                border:'2px solid rgba(0,255,213,0.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:30, fontWeight:900, color:'#FFD700',
                boxShadow:'inset 0 2px 8px rgba(0,0,0,0.3), 0 2px 12px rgba(0,255,213,0.08)',
                position:'relative', overflow:'hidden',
                animation: phase === 0 ? 'waReelBlur 0.15s ease-in-out infinite' : 'waReelStop 0.3s ease-out',
                transitionDelay: `${i * 0.15}s`,
              }}>
                <span style={{ position:'relative', zIndex:1 }}>
                  {phase === 0 ? symbols[r] : symbols[0]}
                </span>
                <div style={{
                  position:'absolute', inset:0, borderRadius:12,
                  background:'linear-gradient(180deg,rgba(0,255,213,0.04),transparent 30%,transparent 70%,rgba(0,255,213,0.04))',
                  pointerEvents:'none',
                }} />
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div style={{ padding:'0 20px 8px' }}>
            <div style={{ width:'100%', height:4, background:'rgba(0,255,213,0.08)', borderRadius:2, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:2,
                background:'linear-gradient(90deg,#00ffd5,#4dffd8)',
                transition:'width 0.5s',
                width: phase === 0 ? '60%' : '100%',
              }} />
            </div>
          </div>

          {/* Jackpot Result */}
          {phase >= 1 && (
            <div style={{
              textAlign:'center', padding:'0 16px 8px',
              animation:'waBounce 0.6s ease-out',
            }}>
              <div style={{
                fontSize:22, fontWeight:900, letterSpacing:2,
                background:'linear-gradient(90deg,#FFD700,#FFA500,#FFD700)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                animation:'waPulse 0.8s ease-in-out infinite',
              }}>
                🎉 JACKPOT! 🎉
              </div>
              <div style={{ fontSize:10, color:'#00ffd5', fontWeight:700, marginTop:2 }}>
                Triple 7s — You're a Winner!
              </div>
            </div>
          )}

          {/* Confetti */}
          {phase >= 1 && (
            <div style={{ position:'absolute', top:10, left:0, right:0, pointerEvents:'none', zIndex:5 }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} style={{
                  position:'absolute',
                  left:`${10 + Math.random() * 80}%`,
                  top:0,
                  fontSize:10 + Math.random() * 6,
                  animation:`waConfetti ${1.2 + Math.random() * 0.8}s ease-out ${i * 0.08}s both`,
                }}>
                  {['🎉','🎊','⭐','💰','💎','🏆','👑','✨','🪙','🔥'][i]}
                </div>
              ))}
            </div>
          )}

          {/* Bottom text */}
          <div style={{
            textAlign:'center', padding:'0 16px 10px',
            fontSize:9, color:'rgba(255,255,255,0.25)', fontWeight:600,
          }}>
            The best matka platform in India
          </div>
        </div>

        {/* ═══ BALANCE ═══ */}
        {phase >= 1 && (
          <div style={{
            marginTop:16, animation:'waRise 0.5s ease-out',
          }}>
            <div style={{ fontSize:11, color:'#5a6a8d', fontWeight:700, letterSpacing:1 }}>
              Your Balance
            </div>
            <div style={{
              fontSize:28, fontWeight:900, color:'#00ffd5',
              letterSpacing:1, fontFamily:'"Orbitron",monospace',
              animation:'waNumGlow 2s ease-in-out infinite',
            }}>
              Rs.{Number(wallet || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}
            </div>
          </div>
        )}

        {/* ═══ CONTINUE BUTTON ═══ */}
        {phase >= 2 && (
          <div style={{ marginTop:20, animation:'waRise 0.5s ease-out' }}>
            <button
              onClick={handleContinue}
              style={{
                width:'100%', padding:'14px 24px',
                background:'linear-gradient(90deg,#14f4ce,#e0800b)',
                color:'#001a17', border:'none', borderRadius:14,
                fontSize:16, fontWeight:900, letterSpacing:2,
                cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                animation:'waBtnGlow 2s ease-in-out infinite',
                transition:'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}
            >
              <span style={{ fontSize:18 }}>🎮</span>
              <span>START PLAYING</span>
            </button>

            <div style={{
              marginTop:8, fontSize:9, color:'rgba(255,255,255,0.2)',
              fontWeight:600, letterSpacing:0.5,
            }}>
              MATKA BOSS CORPORATION — ALL RIGHTS RESERVED
            </div>
          </div>
        )}
      </div>
    </div>
  );
}