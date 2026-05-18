import React, { useState } from 'react';
import { SINGLE_PANAS, DOUBLE_PANAS, TRIPLE_PANAS } from '../data/gameData';

const DIGITS = [0,1,2,3,4,5,6,7,8,9];
const JODIS = Array.from({length:100},(_,i)=>String(i).padStart(2,'0'));

const ODD_NUMBERS  = [1, 3, 5, 7, 9];
const EVEN_NUMBERS = [0, 2, 4, 6, 8];

export default function BetForm({ game, gameType, wallet, onSubmit }) {
  const [num, setNum] = useState('');
  const [num2, setNum2] = useState('');
  const [activeN, setActiveN] = useState(null);
  const [amt, setAmt] = useState('');
  const [bets, setBets] = useState([]);
  const [oddEven, setOddEven] = useState('');
  const [oddEvenNum, setOddEvenNum] = useState(null); // ✅ NEW: selected number
  const [openClose, setOpenClose] = useState('open');
  const [cycleDigit, setCycleDigit] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const chips = [10, 50, 100, 200, 500];
  const id = gameType.id;
  const nt = gameType.numType;

  const getCycleJodis = (d) => {
    if (d === null) return [];
    const res = [];
    for (let i = 0; i <= 9; i++) { res.push(String(d)+String(i)); res.push(String(i)+String(d)); }
    return [...new Set(res)].sort();
  };
  const cycleJodis = getCycleJodis(cycleDigit);

  const getDigitJodis = (d, side) => {
    if (d === null) return [];
    const res = [];
    for (let i = 0; i <= 9; i++) {
      if (side === 'open') res.push(String(d)+String(i));
      else res.push(String(i)+String(d));
    }
    return res;
  };
  const digitJodis = getDigitJodis(activeN, openClose);

  const isBulkType = nt==='ank_bulk'||nt==='jodi_bulk'||nt==='pana_bulk'||id==='sp_common'||id==='dp_common'||id==='cycle_jodi'||id==='digit_jodi';

  const addToBulk = () => {
    if (id === 'cycle_jodi') {
      if (!amt || Number(amt) < 10) return;
      setBets(b => [...b, ...cycleJodis.map(j => ({ num: j, amt: Number(amt) }))]);
      setCycleDigit(null); setAmt('');
    } else if (id === 'digit_jodi') {
      if (!amt || Number(amt) < 10 || activeN === null) return;
      setBets(b => [...b, ...digitJodis.map(j => ({ num: j, amt: Number(amt) }))]);
      setActiveN(null); setAmt('');
    } else {
      if (!num || !amt || Number(amt) < 10) return;
      setBets(b => [...b, { num, amt: Number(amt) }]);
      setNum(''); setActiveN(null); setAmt('');
    }
  };
  const removeBet = i => setBets(b => b.filter((_, idx) => idx !== i));
  const totalAmt = bets.reduce((a, b) => a + b.amt, 0);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const commonData = { session: openClose };

      if (isBulkType) {
        if (!bets.length) { setSubmitting(false); return; }
        await onSubmit({ numbers: bets, totalAmt, ...commonData });
      } else if (id === 'odd_even') {
        // ✅ FIX: oddEvenNum se actual number bhejo, oddEven type se ODD/EVEN bhejo
        if (!oddEven || oddEvenNum === null || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: String(oddEvenNum), amount: Number(amt), ...commonData });
      } else if (id === 'half_sangam_a') {
        if (!num || !num2 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: `${num}-${num2}`, amount: Number(amt), ...commonData });
      } else if (id === 'half_sangam_b') {
        if (!num || !num2 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: `${num}-${num2}`, amount: Number(amt), ...commonData });
      } else if (id === 'full_sangam') {
        if (!num || !num2 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: `${num}-${num2}`, amount: Number(amt), ...commonData });
      } else if (id === 'two_digit_pana') {
        if (!num || !num2 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: `${num}|${num2}`, amount: Number(amt), ...commonData });
      } else {
        if (!num || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: num, amount: Number(amt), ...commonData });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const AmtInput = ({ label = 'Bid Amount (Min ₹10)' }) => (
    <div className="fg">
      <label className="fl">{label}</label>
      <input className="fi" type="number" placeholder="₹0" value={amt} onChange={e => setAmt(e.target.value)}/>
      <div className="chips-row">
        {chips.map(c => (
          <div key={c} className={`chip${amt === String(c) ? ' active' : ''}`} onClick={() => setAmt(String(c))}>₹{c}</div>
        ))}
      </div>
    </div>
  );

  const WinInfo = () => (
    <div className="infobox">
      You bet: <strong>₹{Number(amt||0).toLocaleString()}</strong> &nbsp;|&nbsp;
      Potential win: <strong>₹{(Number(amt||0)*parseInt(gameType.win)).toLocaleString()}</strong>
    </div>
  );

  const PlaceBtn = () => (
    <button
      className="btn-place"
      onClick={handleSubmit}
      disabled={submitting}
      style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
    >
      {submitting ? '⏳ Placing...' : `🎯 Place Bid — ₹${Number(amt||0).toLocaleString()}`}
    </button>
  );

  const BulkTable = () => (bets.length > 0 ? <>
    <table className="bet-table">
      <thead><tr><th>#</th><th>Number</th><th>Amount</th><th></th></tr></thead>
      <tbody>{bets.map((b, i) => (
        <tr key={i}>
          <td>{i+1}</td>
          <td style={{fontWeight:700}}>{b.num}</td>
          <td>₹{b.amt.toLocaleString()}</td>
          <td><button className="del-btn" onClick={() => removeBet(i)}>✕</button></td>
        </tr>
      ))}</tbody>
    </table>
    <div className="total-row">
      <span>Total Bets: {bets.length}</span>
      <strong>₹{totalAmt.toLocaleString()}</strong>
    </div>
  </> : null);

  const AddBtn = ({ label = '+ Add to List' }) => (
    <button onClick={addToBulk} style={{width:'100%',background:'#e8f5ee',color:'#0d3526',border:'2px dashed #0d3526',borderRadius:8,padding:10,fontWeight:700,fontFamily:'Rajdhani,sans-serif',fontSize:14,cursor:'pointer',marginBottom:14}}>
      {label}
    </button>
  );

  const PlaceAllBtn = () => (
    <button
      className="btn-place"
      onClick={handleSubmit}
      disabled={submitting}
      style={{ marginTop:12, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
    >
      {submitting ? '⏳ Placing...' : `🎯 Place All Bids — ₹${totalAmt.toLocaleString()}`}
    </button>
  );

  return (
    <div className="bet-page">
      <div className="bet-game-banner">
        <div className="bgb-icon">{game.icon}</div>
        <div>
          <div className="bgb-name">{game.name}</div>
          <div className="bgb-type">{gameType.label} &nbsp;|&nbsp; Win: {gameType.win} &nbsp;|&nbsp; Wallet: ₹{wallet.toLocaleString()}</div>
        </div>
      </div>

      <div className="bet-form-card">
        {/* ── Session Selection (Open/Close) ── */}
        {id !== 'jodi' && id !== 'jodi_bulk' && id !== 'jodi_digit' && (
          <div className="fg">
            <label className="fl">Select Session</label>
            <div style={{display:'flex', gap:10, marginBottom:15}}>
              {['open', 'close'].map(s => (
                <div 
                  key={s} 
                  className={`chip${openClose === s ? ' active' : ''}`}
                  style={{flex:1, textAlign:'center', padding:'10px 0', cursor:'pointer'}}
                  onClick={() => setOpenClose(s)}
                >
                  {s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bf-title">🎯 {gameType.label}</div>
        <div className="infobox">{gameType.desc} — Win multiplier: <strong>{gameType.win}</strong></div>

        {/* ── 1. SINGLE DIGIT ── */}
        {id === 'single_digit' && <>
          <div className="fg"><label className="fl">Pick a Digit (0–9)</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${activeN === d ? ' active' : ''}`}
                  onClick={() => { setActiveN(d); setNum(String(d)); }}>{d}
                </div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 2. SINGLE DIGIT BULK ── */}
        {id === 'single_digit_bulk' && <>
          <div className="fg"><label className="fl">Pick Digits</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${num === String(d) ? ' active' : ''}`}
                  onClick={() => setNum(String(d))}>{d}
                </div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn label="+ Add Digit"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── 3. JODI DIGIT ── */}
        {id === 'jodi_digit' && <>
          <div className="fg"><label className="fl">Pick Jodi (00–99)</label>
            <div className="jodi-scroll">
              <div className="jodi-grid">
                {JODIS.map(j => (
                  <div key={j} className={`jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>{j}</div>
                ))}
              </div>
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 4. JODI BULK ── */}
        {id === 'jodi_bulk' && <>
          <div className="fg"><label className="fl">Pick Jodi</label>
            <div className="jodi-scroll">
              <div className="jodi-grid">
                {JODIS.map(j => (
                  <div key={j} className={`jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>{j}</div>
                ))}
              </div>
            </div>
          </div>
          <AmtInput/>
          <AddBtn label="+ Add Jodi"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── 5. SINGLE PANA ── */}
        {id === 'single_pana' && <>
          <div className="fg"><label className="fl">Pick Single Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 6. SINGLE PANA BULK ── */}
        {id === 'single_pana_bulk' && <>
          <div className="fg"><label className="fl">Pick Single Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── 7. DOUBLE PANA ── */}
        {id === 'double_pana' && <>
          <div className="fg"><label className="fl">Pick Double Pana</label>
            <div className="pana-grid">
              {DOUBLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 8. DOUBLE PANA BULK ── */}
        {id === 'double_pana_bulk' && <>
          <div className="fg"><label className="fl">Pick Double Pana</label>
            <div className="pana-grid">
              {DOUBLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── 9. TRIPLE PANA ── */}
        {id === 'triple_pana' && <>
          <div className="fg"><label className="fl">Pick Triple Pana</label>
            <div className="pana-grid">
              {TRIPLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 10. HALF SANGAM A ── */}
        {id === 'half_sangam_a' && <>
          <div className="fg"><label className="fl">Open Digit (0–9)</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${num === String(d) ? ' active' : ''}`} onClick={() => setNum(String(d))}>{d}</div>
              ))}
            </div>
          </div>
          <div className="fg"><label className="fl">Close Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num2 === p ? ' active' : ''}`} onClick={() => setNum2(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 11. HALF SANGAM B ── */}
        {id === 'half_sangam_b' && <>
          <div className="fg"><label className="fl">Open Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <div className="fg"><label className="fl">Close Digit (0–9)</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${num2 === String(d) ? ' active' : ''}`} onClick={() => setNum2(String(d))}>{d}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 12. FULL SANGAM ── */}
        {id === 'full_sangam' && <>
          <div className="fg"><label className="fl">Open Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <div className="fg"><label className="fl">Close Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num2 === p ? ' active' : ''}`} onClick={() => setNum2(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 13. ODD / EVEN ── */}
        {id === 'odd_even' && <>
          {/* Step 1: ODD ya EVEN chunna */}
          <div className="fg"><label className="fl">Bet On</label>
            <div style={{display:'flex', gap:10}}>
              {['ODD','EVEN'].map(oe => (
                <div key={oe} className={`chip${oddEven === oe ? ' active' : ''}`}
                  style={{flex:1, textAlign:'center', padding:'12px 0', fontSize:14}}
                  onClick={() => { setOddEven(oe); setOddEvenNum(null); }}
                >
                  {oe}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: ODD/EVEN ke numbers dikhao */}
          {oddEven !== '' && (
            <div className="fg">
              <label className="fl">
                {oddEven === 'ODD' ? 'ODD Numbers (1,3,5,7,9)' : 'EVEN Numbers (0,2,4,6,8)'}
              </label>
              <div className="num-grid">
                {(oddEven === 'ODD' ? ODD_NUMBERS : EVEN_NUMBERS).map(n => (
                  <div
                    key={n}
                    className={`nchip${oddEvenNum === n ? ' active' : ''}`}
                    onClick={() => setOddEvenNum(n)}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}

          <AmtInput/>
          <div className="infobox">
            You bet: <strong>₹{Number(amt||0).toLocaleString()}</strong> &nbsp;|&nbsp;
            Potential win: <strong>₹{(Number(amt||0)*2).toLocaleString()}</strong>
          </div>
          <PlaceBtn/>
        </>}

        {/* ── 14/15. DP/SP MOTOR ── */}
        {(id === 'dp_motor' || id === 'sp_motor') && <>
          <div className="fg"><label className="fl">Pick Pana</label>
            <div className="pana-grid">
              {(id === 'dp_motor' ? DOUBLE_PANAS : SINGLE_PANAS).map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── 16. RED JODI ── */}
        {id === 'red_jodi' && <>
          <div className="fg"><label className="fl">Pick Jodi</label>
            <div className="jodi-scroll">
              <div className="jodi-grid">
                {JODIS.map(j => (
                  <div key={j} className={`jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>{j}</div>
                ))}
              </div>
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 17. CYCLE JODI ── */}
        {id === 'cycle_jodi' && <>
          <div className="fg"><label className="fl">Pick a Digit to Cycle</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${cycleDigit === d ? ' active' : ''}`} onClick={() => setCycleDigit(d)}>{d}</div>
              ))}
            </div>
          </div>
          {cycleDigit !== null && (
            <div className="infobox">Will add <strong>{cycleJodis.length} jodis</strong>: {cycleJodis.slice(0,6).join(', ')}...</div>
          )}
          <AmtInput label="Amount per jodi"/>
          <AddBtn label="+ Add All Cycle Jodis"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── 18. SP DP TP ── */}
{id === 'sp_dp_tp' && <>
  {/* SP / DP / TP Type Select */}
  <div className="fg"><label className="fl">Select Type</label>
    <div style={{display:'flex', gap:8, marginBottom:10}}>
      {['SP','DP','TP'].map(t => (
        <div key={t}
          className={`chip${num2 === t ? ' active' : ''}`}
          style={{flex:1, textAlign:'center', padding:'10px 0', fontSize:14, cursor:'pointer'}}
          onClick={() => { setNum2(t); setNum(''); }}
        >{t}</div>
      ))}
    </div>
  </div>

  {/* Pana Grid - type ke hisaab se */}
  {num2 === 'SP' && (
    <div className="fg"><label className="fl">Pick Single Pana</label>
      <div className="pana-grid">
        {SINGLE_PANAS.map(p => (
          <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
        ))}
      </div>
    </div>
  )}
  {num2 === 'DP' && (
    <div className="fg"><label className="fl">Pick Double Pana</label>
      <div className="pana-grid">
        {DOUBLE_PANAS.map(p => (
          <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
        ))}
      </div>
    </div>
  )}
  {num2 === 'TP' && (
    <div className="fg"><label className="fl">Pick Triple Pana</label>
      <div className="pana-grid">
        {TRIPLE_PANAS.map(p => (
          <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
        ))}
      </div>
    </div>
  )}

  <AmtInput/>
  <WinInfo/>
  <PlaceBtn/>
</>}

        {/* ── 19. TWO DIGIT PANA ── */}
        {id === 'two_digit_pana' && <>
          <div className="fg"><label className="fl">Pick Jodi (2-digit)</label>
            <div className="jodi-scroll">
              <div className="jodi-grid">
                {JODIS.map(j => (
                  <div key={j} className={`jchip${num === j ? ' active' : ''}`} onClick={() => setNum(j)}>{j}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="fg"><label className="fl">Pick Pana</label>
            <div className="pana-grid">
              {SINGLE_PANAS.map(p => (
                <div key={p} className={`pchip${num2 === p ? ' active' : ''}`} onClick={() => setNum2(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <WinInfo/>
          <PlaceBtn/>
        </>}

        {/* ── 20. DIGIT JODI ── */}
        {id === 'digit_jodi' && <>
          <div className="fg"><label className="fl">Open or Close?</label>
            <div style={{display:'flex',gap:10,marginBottom:10}}>
              {['open','close'].map(s => (
                <div key={s} className={`chip${openClose === s ? ' active' : ''}`}
                  style={{flex:1,textAlign:'center',padding:'10px 0',fontSize:13}}
                  onClick={() => setOpenClose(s)}>{s.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <div className="fg"><label className="fl">Pick a Digit</label>
            <div className="num-grid">
              {DIGITS.map(d => (
                <div key={d} className={`nchip${activeN === d ? ' active' : ''}`} onClick={() => setActiveN(d)}>{d}</div>
              ))}
            </div>
          </div>
          {activeN !== null && (
            <div className="infobox">Will add <strong>{digitJodis.length} jodis</strong>: {digitJodis.join(', ')}</div>
          )}
          <AmtInput label="Amount per jodi"/>
          <AddBtn label="+ Add Digit Jodis"/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}

        {/* ── 21/22. SP/DP COMMON ── */}
        {(id === 'sp_common' || id === 'dp_common') && <>
          <div className="fg"><label className="fl">Pick {id === 'sp_common' ? 'Single' : 'Double'} Pana</label>
            <div className="pana-grid">
              {(id === 'sp_common' ? SINGLE_PANAS : DOUBLE_PANAS).map(p => (
                <div key={p} className={`pchip${num === p ? ' active' : ''}`} onClick={() => setNum(p)}>{p}</div>
              ))}
            </div>
          </div>
          <AmtInput/>
          <AddBtn/>
          <BulkTable/>
          {bets.length > 0 && <PlaceAllBtn/>}
        </>}
      </div>
    </div>
  );
}
