import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ── ADD MONEY MODAL ──
export function AddModal({ onClose, onSuccess }) {
  const [amt, setAmt]       = useState('');
  const [chip, setChip]     = useState(null);
  const [step, setStep]     = useState(1); // 1=amount, 2=QR, 3=done
  const [txnNo, setTxnNo]   = useState('');
  const [upiId, setUpiId]   = useState('');
  const [qrUrl, setQrUrl]   = useState('');
  const [loading, setLoading] = useState(false);

  const chips = [100, 200, 500, 1000, 2000, 5000];

  // Admin se UPI ID fetch karo
  useEffect(() => {
    fetch(`${API}/api/admin/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings) {
          const id = d.settings.upi_id || 'matkaking@upi';
          setUpiId(id);
          // QR code generate karo UPI ID se
          const upiStr = `upi://pay?pa=${id}&pn=MatkaKing&am=${amt || ''}&cu=INR`;
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiStr)}`);
        }
      })
      .catch(() => {
        setUpiId('matkaking@upi');
      });
  }, [amt]);

  const handleProceed = () => {
    if (!amt || Number(amt) < 100) return;
    const upiStr = `upi://pay?pa=${upiId}&pn=MatkaKing&am=${amt}&cu=INR`;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiStr)}`);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!txnNo.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('mk_token');
      const res = await fetch(`${API}/api/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ amount: Number(amt), transaction_id: txnNo, upi_id: upiId })
      });
      const d = await res.json();
      if (d.success) {
        setStep(3);
      } else {
        alert(d.message || 'Error submitting request');
      }
    } catch {
      setStep(3); // offline fallback
    }
    setLoading(false);
  };

  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal">
        <div className="mhandle"/>

        {/* STEP 1 — Amount */}
        {step === 1 && <>
          <div className="mtitle">💰 Add Fund</div>
          <div className="fg">
            <label className="fl">Amount (Min ₹100)</label>
            <input className="fi" type="number" placeholder="Enter amount" value={amt}
              onChange={e => { setAmt(e.target.value); setChip(null); }}/>
            <div className="chips-row">
              {chips.map(c => (
                <div key={c} className={`chip${chip === c ? ' active' : ''}`}
                  onClick={() => { setAmt(String(c)); setChip(c); }}>
                  ₹{c.toLocaleString()}
                </div>
              ))}
            </div>
          </div>

          {/* UPI ID show karo */}
          {upiId && (
            <div style={{
              background:'rgba(255,215,0,0.06)',
              border:'1.5px solid rgba(255,215,0,0.2)',
              borderRadius:10, padding:'10px 13px',
              marginBottom:14, fontSize:13,
              color:'var(--gold)', textAlign:'center'
            }}>
              💳 Pay to UPI: <strong>{upiId}</strong>
            </div>
          )}

          <button className="btn-g" onClick={handleProceed}
            style={{ opacity: amt && Number(amt) >= 100 ? 1 : 0.5 }}>
            Proceed ₹{Number(amt || 0).toLocaleString()}
          </button>
          <button className="btn-gry" onClick={onClose}>Cancel</button>
        </>}

        {/* STEP 2 — QR Code + Transaction No */}
        {step === 2 && <>
          <div className="mtitle">📲 Scan & Pay</div>

          {/* QR Code */}
          <div style={{ textAlign:'center', marginBottom:14 }}>
            <div style={{
              background:'#fff',
              borderRadius:12,
              padding:12,
              display:'inline-block',
              border:'2px solid rgba(255,215,0,0.3)'
            }}>
              {qrUrl
                ? <img src={qrUrl} alt="QR Code" width={180} height={180}
                    style={{ display:'block', borderRadius:8 }}/>
                : <div style={{
                    width:180, height:180,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#999', fontSize:13
                  }}>Loading QR...</div>
              }
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:8 }}>
              UPI ID: <span style={{ color:'var(--gold)', fontWeight:700 }}>{upiId}</span>
            </div>
            <div style={{
              fontSize:20, fontWeight:900,
              color:'var(--gold)', fontFamily:'Orbitron,sans-serif',
              marginTop:6
            }}>
              ₹{Number(amt).toLocaleString()}
            </div>
          </div>

          {/* Transaction Number */}
          <div className="fg">
            <label className="fl">Transaction Number / UTR</label>
            <input className="fi" type="text"
              placeholder="12-digit transaction number daalo"
              value={txnNo}
              onChange={e => setTxnNo(e.target.value)}/>
          </div>

          <div style={{
            background:'rgba(255,215,0,0.06)',
            border:'1px solid rgba(255,215,0,0.2)',
            borderRadius:8, padding:'8px 12px',
            fontSize:11, color:'rgba(255,255,255,0.6)',
            marginBottom:14, lineHeight:1.7
          }}>
            ✅ Pay karke <strong style={{color:'var(--gold)'}}>Transaction No / UTR</strong> daalo<br/>
            ⏰ Credit within <strong style={{color:'var(--gold)'}}>30 minutes</strong>
          </div>

          <button className="btn-g" onClick={handleSubmit}
            disabled={loading || !txnNo.trim()}
            style={{ opacity: txnNo.trim() ? 1 : 0.5 }}>
            {loading ? 'Submitting...' : '✅ Submit'}
          </button>
          <button className="btn-gry" onClick={() => setStep(1)}>← Back</button>
        </>}

        {/* STEP 3 — Success */}
        {step === 3 && <>
          <div className="mtitle">⏳ Request Sent!</div>
          <div style={{
            background:'rgba(0,204,68,0.08)',
            border:'1px solid rgba(0,204,68,0.3)',
            borderRadius:10, padding:'14px',
            marginBottom:14, fontSize:13,
            color:'rgba(0,204,68,0.9)', lineHeight:1.8,
            textAlign:'center'
          }}>
            <div style={{fontSize:36, marginBottom:8}}>✅</div>
            Deposit <strong>₹{Number(amt).toLocaleString()}</strong> request submitted!<br/>
            UTR: <strong>{txnNo}</strong><br/>
            Admin approve karega — <strong>30 min</strong> mein credit hoga.
          </div>
          <button className="btn-g" onClick={() => { onSuccess(Number(amt)); onClose(); }}>Done</button>
        </>}
      </div>
    </div>
  );
}

// ── WITHDRAW MODAL ──
export function WithdrawModal({ wallet, onClose, onSuccess }) {
  const [amt, setAmt]         = useState('');
  const [method, setMethod]   = useState('upi'); // 'upi' or 'bank'
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);

  // UPI fields
  const [upiId, setUpiId]   = useState('');
  const [upiName, setUpiName] = useState('');

  // Bank fields
  const [accNo, setAccNo]     = useState('');
  const [accName, setAccName] = useState('');
  const [ifsc, setIfsc]       = useState('');
  const [bankName, setBankName] = useState('');

  const MIN = 300;

  const isValid = () => {
    if (!amt || Number(amt) < MIN || Number(amt) > wallet) return false;
    if (method === 'upi') return upiId.trim() && upiName.trim();
    return accNo.trim() && accName.trim() && ifsc.trim() && bankName.trim();
  };

  const handleSubmit = async () => {
    if (!isValid()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('mk_token');
      const body = {
        amount: Number(amt),
        method,
        ...(method === 'upi'
          ? { upi_id: upiId, account_name: upiName }
          : { account_number: accNo, account_name: accName, ifsc_code: ifsc, bank_name: bankName }
        )
      };
      const res = await fetch(`${API}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      const d = await res.json();
      if (d.success) setStep(2);
      else alert(d.message || 'Error');
    } catch {
      setStep(2); // offline fallback
    }
    setLoading(false);
  };

  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal">
        <div className="mhandle"/>

        {step === 1 ? <>
          <div className="mtitle">💸 Withdraw Fund</div>

          {/* Balance info */}
          <div style={{
            background:'rgba(255,215,0,0.06)',
            border:'1.5px solid rgba(255,215,0,0.2)',
            borderRadius:10, padding:'10px 13px',
            marginBottom:14, fontSize:12,
            color:'var(--gold)', lineHeight:1.8
          }}>
            💰 Available: <strong>₹{wallet.toLocaleString()}</strong> &nbsp;|&nbsp;
            Min: <strong>₹{MIN}</strong>
          </div>

          {/* Amount */}
          <div className="fg">
            <label className="fl">Amount</label>
            <input className="fi" type="number"
              placeholder={`Min ₹${MIN}`}
              value={amt} onChange={e => setAmt(e.target.value)}/>
          </div>

          {/* Method Toggle */}
          <div className="fg">
            <label className="fl">Withdrawal Method</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              {[
                { id:'upi',  icon:'📲', label:'UPI' },
                { id:'bank', icon:'🏦', label:'Bank Account' }
              ].map(m => (
                <div key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    background: method === m.id ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${method === m.id ? 'var(--gold)' : 'rgba(255,215,0,0.15)'}`,
                    borderRadius:10, padding:'12px 8px',
                    textAlign:'center', cursor:'pointer',
                    color: method === m.id ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                    transition:'all 0.2s'
                  }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{m.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* UPI Fields */}
          {method === 'upi' && <>
            <div className="fg">
              <label className="fl">Account Holder Name</label>
              <input className="fi" type="text" placeholder="Apna naam daalo"
                value={upiName} onChange={e => setUpiName(e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">UPI ID</label>
              <input className="fi" type="text" placeholder="name@upi / name@paytm"
                value={upiId} onChange={e => setUpiId(e.target.value)}/>
            </div>
          </>}

          {/* Bank Fields */}
          {method === 'bank' && <>
            <div className="fg">
              <label className="fl">Account Holder Name</label>
              <input className="fi" type="text" placeholder="Apna naam daalo"
                value={accName} onChange={e => setAccName(e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">Account Number</label>
              <input className="fi" type="number" placeholder="Account number daalo"
                value={accNo} onChange={e => setAccNo(e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">IFSC Code</label>
              <input className="fi" type="text" placeholder="SBIN0001234"
                value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())}
                style={{ textTransform:'uppercase' }}/>
            </div>
            <div className="fg">
              <label className="fl">Bank Name</label>
              <input className="fi" type="text" placeholder="SBI / HDFC / ICICI..."
                value={bankName} onChange={e => setBankName(e.target.value)}/>
            </div>
          </>}

          <button className="btn-r" onClick={handleSubmit}
            disabled={loading || !isValid()}
            style={{ opacity: isValid() ? 1 : 0.5 }}>
            {loading ? 'Submitting...' : '📤 Submit Request'}
          </button>
          <button className="btn-gry" onClick={onClose}>Cancel</button>

        </> : <>
          {/* Step 2 — Success */}
          <div className="mtitle">⏳ Request Sent!</div>
          <div style={{
            background:'rgba(255,165,0,0.08)',
            border:'1px solid rgba(255,165,0,0.3)',
            borderRadius:10, padding:'14px',
            marginBottom:14, fontSize:13,
            color:'rgba(255,165,0,0.9)', lineHeight:1.8,
            textAlign:'center'
          }}>
            <div style={{ fontSize:36, marginBottom:8 }}>⏳</div>
            Withdrawal <strong>₹{Number(amt).toLocaleString()}</strong> request bheja gaya!<br/>
            Method: <strong>{method === 'upi' ? `UPI — ${upiId}` : `Bank — ${bankName}`}</strong><br/>
            Processing: <strong>24–48 hrs</strong>
          </div>
          <button className="btn-g" onClick={() => { onSuccess(Number(amt)); onClose(); }}>Done</button>
        </>}
      </div>
    </div>
  );
}