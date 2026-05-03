import React, { useState, useEffect } from 'react';

// ── MY BIDS PAGE (Real API Connected) ──
export function BidsPage({ apiCall }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (apiCall) {
      apiCall('/api/games/bids/my')
        .then(res => {
          if (res.success && res.bids) setBids(res.bids);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [apiCall]);

  const won   = bids.filter(b => b.status === 'win').length;
  const lost  = bids.filter(b => b.status === 'loss').length;
  const pend  = bids.filter(b => b.status === 'pending').length;
  const winAmt = bids.reduce((a, b) => a + (b.status === 'win' ? Number(b.win_amount || b.potential_winning || 0) : 0), 0);

  return (
    <div className="bids-page screen">
      <div className="stats-section-title">📊 Bid Statistics</div>
      <div className="stats-grid">
        {[
          { icon:'🎯', val: bids.length, label:'TOTAL BIDS', cls:'',       bar:'linear-gradient(90deg,#14f4ce,#e0800b)' },
          { icon:'🏆', val: won,         label:'WON',        cls:'green',  bar:'#00cc44' },
          { icon:'💔', val: lost,        label:'LOST',       cls:'red',    bar:'#ff2244' },
          { icon:'⏳', val: pend,        label:'PENDING',    cls:'orange', bar:'#FFA500' },
        ].map((s, i) => (
          <div key={i} className="stat-cell" style={{ boxShadow: 'none' }}> {/* Removed glow */}
            <div className="stat-top-bar" style={{ background: s.bar }}/>
            <div className="stat-icon">{s.icon}</div>
            <div className={`stat-value${s.cls ? ' '+s.cls : ''}`}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="pnl-row" style={{ marginTop: 8, boxShadow: 'none' }}> {/* Removed glow */}
        <div className="pnl-left">
          <div className="pnl-ic">💰</div>
          <div className="pnl-label">Total Winnings</div>
        </div>
        <div className="pnl-val">₹{winAmt.toLocaleString('en-IN')}</div>
      </div>

      <div className="stats-section-title" style={{ marginTop: 8 }}>🎮 Recent Bids</div>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'#00ffd5' }}>⏳ Bids load ho rahi hain...</div>
      ) : bids.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.4)' }}>📭 Aapne abhi tak koi bid nahi lagayi hai</div>
      ) : (
        <div className="menu-list">
          {bids.map(b => {
            const amount  = Number(b.amount || 0);
            const winning = Number(b.win_amount || b.potential_winning || 0);
            return (
              <div key={b.id} className="ml-item" style={{ boxShadow: 'none', border: '1px solid rgba(0, 255, 213, 0.2)' }}> {/* Clean flat border */}
                <div className="ml-left">
                  <div className="ml-icon">🎯</div>
                  <div>
                    <div className="ml-title">{b.game_name} — {b.game_type}</div>
                    <div className="ml-sub">#{b.number} · {new Date(b.created_at).toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{
                    fontSize:13, fontWeight:700,
                    color: b.status==='win' ? '#00cc44' : b.status==='loss' ? '#ff2244' : '#FFA500'
                  }}>
                    {b.status==='win' ? `+₹${winning.toLocaleString('en-IN')}` : `₹${amount.toLocaleString('en-IN')}`}
                  </div>
                  <div style={{
                    fontSize:10, fontWeight:700, marginTop:2,
                    color: b.status==='win' ? '#00cc44' : b.status==='loss' ? '#ff2244' : '#FFA500'
                  }}>
                    {b.status.toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TRANSACTIONS PAGE ──
export function TxnsPage({ apiCall, navigate }) {
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => { fetchTxns(); }, []);

  const fetchTxns = async () => {
    setLoading(true); setError('');
    try {
      const res  = await apiCall('/api/wallet/transactions');
      const list = res?.transactions || res?.data || res || [];
      setTxns(Array.isArray(list) ? list : []);
    } catch (e) {
      setError('Transactions load nahi hui. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = (type) => ({
    deposit:'💰 Deposit', withdrawal:'🏦 Withdrawal', withdraw:'🏦 Withdrawal',
    bid:'🎯 Bid', winning:'🏆 Winning', win:'🏆 Winning',
    refund:'↩️ Refund', bonus:'🎁 Bonus', credit:'⬆️ Credit', debit:'⬇️ Debit',
  })[type?.toLowerCase()] || `📋 ${type || 'Transaction'}`;

  const isCredit = (tx) => {
    if (tx.type === 'credit') return true;
    if (tx.type === 'debit')  return false;
    const creditTypes = ['deposit','winning','win','refund','bonus'];
    if (creditTypes.includes(tx.type?.toLowerCase())) return true;
    if (typeof tx.amount === 'number') return tx.amount > 0;
    return false;
  };

  const filtered = filter==='all' ? txns : filter==='credit' ? txns.filter(t=>isCredit(t)) : txns.filter(t=>!isCredit(t));
  const totalCredit = txns.filter(t=>isCredit(t)).reduce((a,t)=>a+Math.abs(Number(t.amount||t.amt||0)),0);
  const totalDebit  = txns.filter(t=>!isCredit(t)).reduce((a,t)=>a+Math.abs(Number(t.amount||t.amt||0)),0);

  return (
    <div className="screen" style={{ paddingBottom:80 }}>
      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg,#021a14,#063d35)',
        padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
        borderBottom:'1.5px solid rgba(0,255,213,0.18)',
        position:'sticky', top:0, zIndex:10
      }}>
        {navigate && (
          <div onClick={() => navigate('wallet')}
            style={{ fontSize:26, cursor:'pointer', color:'#00ffd5', lineHeight:1 }}>‹</div>
        )}
        <div style={{ fontSize:16, fontWeight:700, color:'#00ffd5', fontFamily:'Teko,sans-serif', letterSpacing:2, flex:1 }}>
          💳 Transaction History
        </div>
        <button onClick={fetchTxns} style={{
          background:'rgba(0,255,213,0.1)', border:'1px solid rgba(0,255,213,0.3)',
          color:'#00ffd5', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700
        }}>🔄 Refresh</button>
      </div>

      {/* Summary cards */}
      {!loading && txns.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'14px 14px 0' }}>
          <div style={{ background:'rgba(0,20,15,0.97)', borderRadius:10, padding:'12px 14px', borderLeft:'3px solid #00cc44' }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Total Credit</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#00cc44' }}>+₹{totalCredit.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ background:'rgba(0,20,15,0.97)', borderRadius:10, padding:'12px 14px', borderLeft:'3px solid #ff2244' }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Total Debit</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#ff2244' }}>-₹{totalDebit.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, padding:'12px 14px' }}>
        {[['all','All'],['credit','Credit ⬆️'],['debit','Debit ⬇️']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer',
            fontWeight:700, fontSize:12, fontFamily:'Teko,sans-serif', letterSpacing:1,
            background: filter===val ? 'linear-gradient(135deg,#14f4ce,#e0800b)' : 'rgba(0,255,213,0.08)',
            color: filter===val ? '#001a17' : 'rgba(0,255,213,0.6)',
            transition:'all 0.15s',
            boxShadow: 'none' /* Flat active buttons */
          }}>{label}</button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign:'center', padding:60, color:'#00ffd5' }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
          <div>Transactions load ho rahi hain...</div>
        </div>
      )}
      {!loading && error && (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>❌</div>
          <div style={{ color:'#ff2244', marginBottom:16 }}>{error}</div>
          <button onClick={fetchTxns} style={{
            background:'linear-gradient(135deg,#14f4ce,#e0800b)', border:'none',
            color:'#001a17', padding:'10px 24px', borderRadius:8, cursor:'pointer', fontWeight:700,
            boxShadow: 'none'
          }}>Dobara Try Karo</button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
          <div style={{ fontSize:14 }}>
            {filter==='all' ? 'Koi transaction nahi mili' : `Koi ${filter} transaction nahi`}
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div style={{ padding:'0 14px' }}>
        {filtered.map((tx, i) => {
          const credit   = isCredit(tx);
          const amount   = Math.abs(Number(tx.amount ?? tx.amt ?? 0));
          const balAfter = tx.balance_after ?? tx.closing_balance ?? null;
          return (
            <div key={tx.id||i} style={{
              background:'rgba(0,20,15,0.97)', borderRadius:10, padding:'14px 16px',
              marginBottom:10, display:'flex', alignItems:'center', gap:14,
              borderLeft:`3px solid ${credit ? '#00cc44' : '#ff2244'}`,
              boxShadow: 'none', border: '1px solid rgba(0, 255, 213, 0.15)' /* Removed shadow for cleaner look */
            }}>
              <div style={{
                width:40, height:40, borderRadius:10, flexShrink:0,
                background: credit ? 'rgba(0,204,68,0.15)' : 'rgba(255,34,68,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18
              }}>
                {credit ? '⬆️' : '⬇️'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, color:'#fff', fontSize:13, marginBottom:3 }}>{typeLabel(tx.type)}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {tx.description||tx.note||tx.name||tx.ref||'—'}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>
                  {tx.created_at ? new Date(tx.created_at).toLocaleString('hi-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : tx.date||'—'}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontWeight:700, fontSize:16, color: credit ? '#00cc44' : '#ff2244' }}>
                  {credit?'+':'-'}₹{amount.toLocaleString('en-IN',{minimumFractionDigits:2})}
                </div>
                {balAfter!==null && (
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:3 }}>Bal: ₹{Number(balAfter).toLocaleString('en-IN')}</div>
                )}
                {(tx.statusTxt||tx.status) && (
                  <div style={{
                    fontSize:9, fontWeight:700, marginTop:4, padding:'2px 6px', borderRadius:4, display:'inline-block',
                    background: (tx.statusTxt||tx.status)==='SUCCESS'||(tx.statusTxt||tx.status)==='approved' ? 'rgba(0,204,68,0.2)' : 'rgba(255,165,0,0.2)',
                    color: (tx.statusTxt||tx.status)==='SUCCESS'||(tx.statusTxt||tx.status)==='approved' ? '#00cc44' : '#FFA500'
                  }}>
                    {(tx.statusTxt||tx.status||'').toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!loading && filtered.length > 0 && (
        <div style={{ textAlign:'center', padding:'10px 0 20px', fontSize:11, color:'rgba(255,255,255,0.25)' }}>
          {filtered.length} transactions dikh rahi hain
        </div>
      )}
    </div>
  );
}

// ── WALLET PAGE ──
export function WalletPage({ wallet, onAdd, onWith, user, navigate, apiCall }) {
  const [stats, setStats] = useState({
    highest_win: user?.highest_win||0, total_bids: user?.total_bids||0,
    games_won: user?.games_won||0,   avg_bid: user?.avg_bid||0
  });

  useEffect(() => {
    if (apiCall) {
      apiCall('/api/auth/profile').then(res => {
        if (res?.success && res?.user) {
          setStats({
            highest_win: res.user.highest_win||0, total_bids: res.user.total_bids||0,
            games_won:   res.user.games_won||0,   avg_bid:    res.user.avg_bid||0
          });
        }
      }).catch(err => console.log('Stats error:', err));
    }
  }, [apiCall]);

  return (
    <div className="screen">
      <div className="wallet-hero" style={{ boxShadow: 'none' }}> {/* Removed glow */}
        <div className="wh-label">Total Balance</div>
        <div className="wh-amount">₹{wallet.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:16 }}>
          <button className="btn-add" style={{ flex:1, maxWidth:140, boxShadow: 'none' }} onClick={onAdd}>💰 Add Money</button>
          <button className="btn-wdr" style={{ flex:1, maxWidth:140, boxShadow: 'none' }} onClick={onWith}>💸 Withdraw</button>
        </div>
        <div className="wh-stats-row">
          {[
            {label:'Total Added', val:'₹'+Number(user?.total_deposited||0).toLocaleString('en-IN')},
            {label:'Total Won',   val:'₹'+Number(user?.total_won||0).toLocaleString('en-IN')},
            {label:'Withdrawn',   val:'₹'+Number(user?.total_withdrawn||0).toLocaleString('en-IN')},
          ].map((s,i,arr) => (
            <React.Fragment key={i}>
              <div className="wh-stat">
                <div className="wh-stat-label">{s.label}</div>
                <div className="wh-stat-val">{s.val}</div>
              </div>
              {i < arr.length-1 && <div className="wh-divider"/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="wallet-menu">
        {[
          {ic:'💰', l:'Add Fund',            sub:'UPI, Net Banking, Cards',  fn: onAdd},
          {ic:'💸', l:'Withdraw Fund',       sub:'Bank Transfer, UPI',       fn: onWith},
          {ic:'📋', l:'Transaction History', sub:'All credits & debits',     fn: () => navigate && navigate('txns')},
          {ic:'🎁', l:'Refer & Earn',        sub:'Earn ₹100 per referral',   fn: undefined},
        ].map((item,i) => (
          <div key={i} className="wm-item" onClick={item.fn} style={{ cursor: item.fn ? 'pointer' : 'default', boxShadow: 'none', borderBottom: '1px solid rgba(0, 255, 213, 0.1)' }}> {/* Flat items */}
            <div className="wm-left">
              <div className="wm-ic">{item.ic}</div>
              <div>
                <div className="wm-label">{item.l}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{item.sub}</div>
              </div>
            </div>
            <div className="wm-arrow">›</div>
          </div>
        ))}
      </div>

      <div className="your-stats-label">📈 Your Stats</div>
      <div className="wallet-stats-grid">
        {[
          {val:'₹'+Number(stats.highest_win).toLocaleString('en-IN'), label:'HIGHEST WIN', cls:''},
          {val:String(stats.total_bids),                              label:'TOTAL BIDS',  cls:'orange'},
          {val:String(stats.games_won),                               label:'GAMES WON',   cls:''},
          {val:'₹'+Number(stats.avg_bid).toLocaleString('en-IN'),     label:'AVG BID',     cls:'orange'},
        ].map((s,i) => (
          <div key={i} className="ws-cell" style={{ boxShadow: 'none' }}> {/* Removed glow */}
            <div className="ws-left-bar"/>
            <div className={`ws-value${s.cls?' '+s.cls:''}`}>{s.val}</div>
            <div className="ws-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SHARED STYLES ──
const S = {
  container: { padding:'0 16px 80px', color:'#e5e7eb' },
  heading:   { fontSize:15, fontWeight:700, color:'#00ffd5', marginTop:20, marginBottom:8, fontFamily:'Teko,sans-serif', letterSpacing:2 },
  para:      { fontSize:13, lineHeight:1.8, color:'rgba(255,255,255,0.7)', marginBottom:10 },
  box:       { background:'rgba(0,20,15,0.97)', border:'1px solid rgba(0,255,213,0.15)', borderRadius:10, padding:'12px 14px', marginBottom:10, boxShadow: 'none' }, /* Cleaned box */
  boxTitle:  { fontSize:14, fontWeight:700, color:'#00ffd5', marginBottom:4, fontFamily:'Teko,sans-serif', letterSpacing:1 },
  boxText:   { fontSize:12, color:'rgba(255,255,255,0.5)', lineHeight:1.7 },
  badge:     { display:'inline-block', background:'linear-gradient(135deg,#14f4ce,#e0800b)', color:'#001a17', borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:700, marginRight:6 },
};

function SubHeader({ title, onBack }) {
  return (
    <div style={{
      background:'linear-gradient(135deg,#021a14,#063d35)',
      padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
      borderBottom:'1.5px solid rgba(0,255,213,0.18)',
      position:'sticky', top:0, zIndex:10
    }}>
      <div onClick={onBack} style={{ fontSize:26, cursor:'pointer', color:'#00ffd5', lineHeight:1 }}>‹</div>
      <div style={{ fontSize:16, fontWeight:700, color:'#00ffd5', fontFamily:'Teko,sans-serif', letterSpacing:2 }}>{title}</div>
    </div>
  );
}

// ── HOW TO PLAY ──
export function HowToPlayPage({ onBack }) {
  return (
    <div className="screen" style={{ paddingBottom:0 }}>
      <SubHeader title="📖 How to Play" onBack={onBack} />
      <div style={S.container}>
        <div style={S.heading}>🎯 Matka Kya Hota Hai?</div>
        <p style={S.para}>Matka ek number guessing game hai. Aap open aur close numbers pe bet lagate ho. Sahi number aane pe aapko multiplied amount milta hai.</p>

        <div style={S.heading}>📋 Step-by-Step Guide</div>
        {[
          {n:'1', t:'Wallet Mein Paisa Daalo',  d:'Add Money karo. UPI se deposit karo, admin 15–30 min mein approve karega.'},
          {n:'2', t:'Game Chunno',              d:'Home screen se koi bhi open game chunno — Kalyan, Milan Day, etc.'},
          {n:'3', t:'Game Type Chunno',         d:'Single Digit, Jodi, Pana, Sangam — apni marzi ka game type chunno.'},
          {n:'4', t:'Number & Amount Daalo',    d:'Lucky number chunno aur bet amount daalo. Minimum ₹10.'},
          {n:'5', t:'Bid Place Karo',           d:'Place Bid dabao. Amount wallet se turant cut ho jaayega.'},
          {n:'6', t:'Result Ka Intezaar Karo',  d:'Result aane ke baad winning amount winning wallet mein credit ho jaayegi.'},
        ].map((s,i) => (
          <div key={i} style={S.box}>
            <div style={S.boxTitle}><span style={S.badge}>{s.n}</span>{s.t}</div>
            <div style={S.boxText}>{s.d}</div>
          </div>
        ))}

        <div style={S.heading}>🎮 Game Types & Multipliers</div>
        {[
          {type:'Single Digit', mult:'9x',     desc:'0–9 mein se ek digit'},
          {type:'Jodi',         mult:'90x',    desc:'00–99 mein se ek jodi'},
          {type:'Single Pana',  mult:'150x',   desc:'3 digit ka single pana'},
          {type:'Double Pana',  mult:'300x',   desc:'3 digit ka double pana'},
          {type:'Triple Pana',  mult:'600x',   desc:'3 digit ka triple pana'},
          {type:'Half Sangam',  mult:'1500x',  desc:'Digit + Pana combination'},
          {type:'Full Sangam',  mult:'10000x', desc:'Pana + Pana combination'},
        ].map((g,i) => (
          <div key={i} style={{ ...S.box, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={S.boxTitle}>{g.type}</div>
              <div style={S.boxText}>{g.desc}</div>
            </div>
            <div style={{ color:'#00ffd5', fontWeight:700, fontSize:16 }}>{g.mult}</div>
          </div>
        ))}

        <div style={S.heading}>💰 Wallet Rules</div>
        <p style={S.para}>
          • <strong style={{ color:'#00ffd5' }}>Wallet Balance</strong> — Deposit se aata hai. Bid lagane mein use hota hai.<br/>
          • <strong style={{ color:'#00cc44' }}>Winning Balance</strong> — Game jeeto toh yahan aata hai. Sirf yahan se withdrawal hogi.<br/>
          • Minimum withdrawal: <strong style={{ color:'#00ffd5' }}>₹500</strong><br/>
          • Withdrawal admin approve karega.
        </p>
      </div>
    </div>
  );
}

// ── FAQ ──
export function FAQPage({ onBack }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    {q:'Account kaise banayein?',             a:'App ke login page pe "Register" dabao. Mobile number aur password se account bana sakte ho.'},
    {q:'Paisa kaise add karein?',             a:'Wallet → Add Money → UPI se payment → UTR number submit karo → Admin 15–30 min mein approve karega.'},
    {q:'Minimum deposit kitna hai?',          a:'Minimum deposit ₹100 hai. Maximum ₹1,00,000 tak kar sakte hain.'},
    {q:'Winning kaise withdraw karein?',      a:'Winning Balance mein jaao → Withdraw → UPI ID ya Bank details daalo → Admin approve karega. Min ₹500 chahiye.'},
    {q:'Result kab aata hai?',                a:'Har game ka alag result time hota hai. Game card pe time dikh jaata hai. Result aane ke baad winning balance turant update hota hai.'},
    {q:'Bid cancel ho sakti hai?',            a:'Nahi. Ek baar bid place hone ke baad cancel nahi hogi. Dhyan se number aur amount check karke bid lagao.'},
    {q:'Ek se zyada account ban sakta hai?',  a:'Nahi. Ek mobile number pe sirf ek account allowed hai. Multiple accounts pe permanent ban milega.'},
    {q:'Koi problem ho toh kya karein?',      a:'Support page pe jaao. Call ya Telegram se contact karo. Mon–Sat 10AM–8PM available hain.'},
  ];

  return (
    <div className="screen" style={{ paddingBottom:0 }}>
      <SubHeader title="❓ FAQ" onBack={onBack} />
      <div style={S.container}>
        <p style={{ ...S.para, marginTop:16 }}>Aksar pooche jaane wale sawaal:</p>
        {faqs.map((f,i) => (
          <div key={i} style={{ ...S.box, cursor:'pointer' }} onClick={() => setOpen(open===i?null:i)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ ...S.boxTitle, marginBottom:0, flex:1, paddingRight:8 }}>{f.q}</div>
              <div style={{ color:'#00ffd5', fontSize:20, fontWeight:700 }}>{open===i ? '−' : '+'}</div>
            </div>
            {open===i && (
              <div style={{ ...S.boxText, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(0,255,213,0.15)' }}>{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TERMS & CONDITIONS ──
export function TermsPage({ onBack }) {
  return (
    <div className="screen" style={{ paddingBottom:0 }}>
      <SubHeader title="📜 Terms & Conditions" onBack={onBack} />
      <div style={S.container}>
        <p style={{ ...S.para, marginTop:16, color:'#00ffd5' }}>Last updated: January 2024</p>
        {[
          {t:'1. Eligibility',             d:'Sirf 18+ log hi MatkaKing use kar sakte hain. Minor hone pe account turant band kar diya jaayega aur remaining balance refund hoga.'},
          {t:'2. Account Rules',           d:'Ek user sirf ek account rakh sakta hai. Fake information dene pe permanent ban ho sakta hai. Apna password safe rakhen.'},
          {t:'3. Deposits',                d:'Sirf UPI aur Bank Transfer se deposit hoga. Admin verification ke baad hi wallet credit hoga. Minimum deposit ₹100 hai.'},
          {t:'4. Withdrawals',             d:'Sirf winning balance se withdrawal hogi. Minimum ₹500 chahiye. Admin approve karega. Processing 24–48 ghante le sakta hai.'},
          {t:'5. Gameplay Rules',          d:'Bid lagane ke baad cancel nahi hogi. Result declare hone ke baad winning automatic credit hogi. Cheating ya manipulation pe permanent ban milega.'},
          {t:'6. Responsible Gaming',      d:'Apni financial limit ke andar khelo. MatkaKing responsible gaming ko encourage karta hai. Agar gambling addiction feel ho toh support se contact karein.'},
          {t:'7. Limitation of Liability', d:'MatkaKing technical issues ya server downtime ke liye zimmedaar nahi hai. Emergency mein bids cancel ho sakti hain aur amount refund kiya jaayega.'},
          {t:'8. Account Termination',     d:'MatkaKing kisi bhi account ko rules violation pe band kar sakta hai. Remaining balance refund kiya jaayega.'},
        ].map((s,i) => (
          <div key={i} style={S.box}>
            <div style={S.boxTitle}>{s.t}</div>
            <div style={S.boxText}>{s.d}</div>
          </div>
        ))}
        <p style={{ ...S.para, textAlign:'center', color:'rgba(255,255,255,0.25)', marginTop:16 }}>
          MatkaKing use karne se aap in terms se agree karte hain.
        </p>
      </div>
    </div>
  );
}

// ── PRIVACY POLICY ──
export function PrivacyPage({ onBack }) {
  return (
    <div className="screen" style={{ paddingBottom:0 }}>
      <SubHeader title="🔒 Privacy Policy" onBack={onBack} />
      <div style={S.container}>
        <p style={{ ...S.para, marginTop:16, color:'#00ffd5' }}>Last updated: January 2024</p>
        {[
          {t:'📱 Kaunsa Data Collect Hota Hai?', d:'Mobile number, naam, device info aur transaction history collect hoti hai. Koi bhi card number ya banking password store nahi hota.'},
          {t:'🔐 Data Kaise Safe Hai?',          d:'Aapka data encrypted servers pe store hota hai. JWT tokens se authentication secure hai. Kisi third party ke saath data share nahi hota.'},
          {t:'💳 Payment Information',           d:'UPI ID sirf withdrawal ke liye use hota hai. Bank details encrypted form mein store hoti hain. Processing ke baad sensitive details delete ho jaati hain.'},
          {t:'🍪 Local Storage',                 d:'App smoothly kaam kare isliye login token local storage mein save hota hai. Logout karne pe automatically delete ho jaata hai.'},
          {t:'👤 Aapke Rights',                  d:'Aap apna account aur data delete karwa sakte hain. Transaction history download kar sakte hain. Personal information update kar sakte hain.'},
          {t:'📞 Contact',                       d:'Privacy se related kisi bhi sawaal ke liye Support page pe humse contact karein. Hum 48 ghante mein jawab dete hain.'},
        ].map((s,i) => (
          <div key={i} style={S.box}>
            <div style={S.boxTitle}>{s.t}</div>
            <div style={S.boxText}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SUPPORT & PROFILE PAGE ──
export function SupportPage({ apiCall, user }) {
  const [contacts, setContacts] = useState({ phone:'9999999999', telegram:'matkaking_support' });
  const [profileForm, setProfileForm] = useState({
    username: user?.name || '',
    oldPassword: '', newPassword: '', confirmPassword: '',
  });
  const [profilePicPreview, setProfilePicPreview] = useState(
    user?.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'User')}&background=063d35&color=00ffd5&size=150`
  );
  const [loading, setLoading]     = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]   = useState('');

  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/admin/settings').then(d => {
      if (d?.success && d?.settings) {
        setContacts({
          phone:    d.settings.phone    || d.settings.support_phone || '9999999999',
          telegram: d.settings.telegram || d.settings.telegram_user || 'matkaking_support'
        });
      }
    }).catch(()=>{});
  }, [apiCall]);

  const updateProfile = async () => {
    setSuccessMsg(''); setErrorMsg('');
    if (!profileForm.username.trim()) { setErrorMsg('❌ Username dalna zaruri hai!'); return; }
    setLoading(true);
    try {
      const profileRes = await apiCall('/api/auth/update-profile', 'PUT', { name: profileForm.username.trim() });
      if (!profileRes?.success) { setErrorMsg(profileRes?.message || '❌ Profile update fail ho gaya'); setLoading(false); return; }

      if (profileForm.newPassword) {
        if (!profileForm.oldPassword) { setErrorMsg('❌ Purana password zaruri hai'); setLoading(false); return; }
        if (profileForm.newPassword !== profileForm.confirmPassword) { setErrorMsg('❌ Naya password match nahi ho raha'); setLoading(false); return; }
        if (profileForm.newPassword.length < 4) { setErrorMsg('❌ Password minimum 4 characters ka hona chahiye'); setLoading(false); return; }
        const passRes = await apiCall('/api/auth/update-password', 'POST', { oldPassword: profileForm.oldPassword, newPassword: profileForm.newPassword });
        if (!passRes?.success) { setErrorMsg(passRes?.message || '❌ Password update fail ho gaya'); setLoading(false); return; }
      }

      setSuccessMsg('✅ Profile successfully updated!');
      setProfileForm(p => ({ ...p, oldPassword:'', newPassword:'', confirmPassword:'' }));
      setProfilePicPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.username.trim())}&background=063d35&color=00ffd5&size=150`);
    } catch (error) {
      setErrorMsg('❌ Server se connect nahi ho pa raha. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:'100%', padding:'12px 14px', borderRadius:8,
    background:'rgba(0,255,213,0.06)', border:'1.5px solid rgba(0,255,213,0.2)',
    color:'#fff', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:12,
  };
  const labelStyle = {
    color:'rgba(0,255,213,0.6)', fontSize:11, textTransform:'uppercase',
    letterSpacing:2, marginBottom:6, display:'block', fontFamily:'Teko,sans-serif',
  };

  return (
    <div className="screen" style={{ paddingBottom:80 }}>

      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg,#021a14,#063d35)',
        padding:'16px', borderBottom:'1.5px solid rgba(0,255,213,0.18)',
        position:'sticky', top:0, zIndex:10
      }}>
        <span style={{ fontSize:18, fontWeight:700, color:'#00ffd5', fontFamily:'Teko,sans-serif', letterSpacing:2 }}>
          👤 My Profile
        </span>
      </div>

      {/* Profile Card */}
      <div style={{
        background:'linear-gradient(135deg,#021a14,#063d35)',
        margin:16, borderRadius:14,
        border:'1.5px solid rgba(0,255,213,0.2)', overflow:'hidden',
        boxShadow: 'none' /* Cleaned the glow */
      }}>
        {/* Avatar */}
        <div style={{ textAlign:'center', padding:'24px 20px 16px', borderBottom:'1px solid rgba(0,255,213,0.15)' }}>
          <img
            src={profilePicPreview} alt="Avatar"
            style={{ width:90, height:90, borderRadius:'50%', border:'3px solid #00ffd5', objectFit:'cover', display:'block', margin:'0 auto' }}
          />
          <div style={{ marginTop:12, color:'#fff', fontWeight:700, fontSize:16, fontFamily:'Teko,sans-serif', letterSpacing:1 }}>
            {user?.name || 'User'}
          </div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:2 }}>📱 {user?.mobile || '—'}</div>
          <div style={{
            display:'inline-block', marginTop:8,
            background:'rgba(0,204,68,0.15)', border:'1px solid rgba(0,204,68,0.3)',
            borderRadius:20, padding:'3px 12px', fontSize:11, color:'#00cc44', fontWeight:700
          }}>✅ Mobile Number Verified</div>
        </div>

        {/* Form */}
        <div style={{ padding:'20px' }}>
          {successMsg && (
            <div style={{ background:'rgba(0,204,68,0.15)', border:'1px solid rgba(0,204,68,0.4)', borderRadius:8, padding:'10px 14px', marginBottom:14, color:'#00cc44', fontSize:13, fontWeight:600 }}>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{ background:'rgba(255,34,68,0.15)', border:'1px solid rgba(255,34,68,0.4)', borderRadius:8, padding:'10px 14px', marginBottom:14, color:'#ff2244', fontSize:13, fontWeight:600 }}>
              {errorMsg}
            </div>
          )}

          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} value={profileForm.username}
            onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))}
            placeholder="Apna naam likhein" />

          <div style={{ borderTop:'1px solid rgba(0,255,213,0.15)', marginTop:4, marginBottom:16, paddingTop:16 }}>
            <div style={{ ...labelStyle, color:'#00ffd5' }}>🔐 Change Password (Optional)</div>
            <label style={labelStyle}>Current Password</label>
            <input type="password" style={inputStyle} placeholder="Purana password"
              value={profileForm.oldPassword}
              onChange={e => setProfileForm(p => ({ ...p, oldPassword: e.target.value }))} />
            <label style={labelStyle}>New Password</label>
            <input type="password" style={inputStyle} placeholder="Naya password (min 4 characters)"
              value={profileForm.newPassword}
              onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))} />
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" style={{ ...inputStyle, marginBottom:0 }} placeholder="Dobara naya password likhein"
              value={profileForm.confirmPassword}
              onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))} />
          </div>

          <button onClick={updateProfile} disabled={loading} style={{
            width:'100%', padding:'14px', borderRadius:'10px 40px 10px 40px', border:'none',
            background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg,#14f4ce,#e0800b)',
            color: loading ? 'rgba(255,255,255,0.4)' : '#001a17',
            fontWeight:700, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing:2, fontFamily:'Teko,sans-serif', transition:'all 0.2s',
            boxShadow: 'none' /* Cleaned glow */
          }}>
            {loading ? '⏳ Updating...' : '💾 UPDATE PROFILE'}
          </button>
        </div>
      </div>

      {/* Help & Support */}
      <div style={{ padding:'0 16px', marginTop:4 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'rgba(0,255,213,0.5)', textTransform:'uppercase', letterSpacing:2, marginBottom:10, fontFamily:'Teko,sans-serif' }}>
          🎧 Help & Support
        </div>

        <div onClick={() => window.open(`https://wa.me/91${contacts.phone}`, '_blank')} style={{
          cursor:'pointer', display:'flex', alignItems:'center',
          background:'rgba(0,20,15,0.97)', padding:'16px', borderRadius:10,
          marginBottom:10, border:'1px solid rgba(0,255,213,0.15)'
        }}>
          <div style={{ fontSize:28, marginRight:16 }}>💬</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'#fff', fontSize:15, fontFamily:'Teko,sans-serif', letterSpacing:1 }}>WhatsApp Support</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:3 }}>+91 {contacts.phone}</div>
          </div>
          <div style={{ color:'#00ffd5', fontSize:22 }}>›</div>
        </div>

        <div onClick={() => window.open(`https://t.me/${contacts.telegram}`, '_blank')} style={{
          cursor:'pointer', display:'flex', alignItems:'center',
          background:'rgba(0,20,15,0.97)', padding:'16px', borderRadius:10,
          border:'1px solid rgba(0,255,213,0.15)'
        }}>
          <div style={{ fontSize:28, marginRight:16 }}>✈️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'#fff', fontSize:15, fontFamily:'Teko,sans-serif', letterSpacing:1 }}>Telegram Support</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:3 }}>Quick reply in 5 mins</div>
          </div>
          <div style={{ color:'#00ffd5', fontSize:22 }}>›</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'30px 16px 10px', fontSize:11, color:'rgba(255,255,255,0.2)', textAlign:'center', lineHeight:1.8 }}>
        <strong style={{ color:'rgba(255,255,255,0.3)' }}>MatkaKing</strong> · Version 5.0.0<br/>
        18+ Only. Play Responsibly.
      </div>
    </div>
  );
}