import React, { useState, useEffect } from 'react';

const API_URL = 'https://sattamatka-deepak.onrender.com';

function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleReset = async () => {
    setErr('');

    if (!mobile || mobile.length !== 10) {
      return setErr('Valid 10-digit mobile daalo');
    }

    if (!name.trim()) {
      return setErr('Registered naam daalo');
    }

    if (!newPass || newPass.length < 6) {
      return setErr('Naya password minimum 6 characters');
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile,
            name: name.trim(),
            new_password: newPass,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setErr(data.message || 'Kuch galat hua');
        setLoading(false);
        return;
      }

      setStep(2);
    } catch {
      setErr('Network error. Dobara try karo.');
    }

    setLoading(false);
  };

  return (
    <div
      className="forgot-overlay"
      onClick={(e) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div className="forgot-modal">

        <div className="modal-head">
          <div className="modal-title">
            🔑 Password Reset
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {step === 1 ? (
          <>
            <p className="modal-help">
              Apna registered mobile number aur naam daalo.
            </p>

            <label className="modal-label">
              Mobile Number
            </label>

            <div className="modal-input">
              <span>📱</span>

              <span className="modal-prefix">
                +91
              </span>

              <input
                type="tel"
                placeholder="10-digit mobile"
                value={mobile}
                maxLength={10}
                onChange={(e) =>
                  setMobile(
                    e.target.value.replace(/\D/g, '')
                  )
                }
              />
            </div>

            <label className="modal-label">
              Registered Naam
            </label>

            <div className="modal-input">
              <span>👤</span>

              <input
                type="text"
                placeholder="Register karte time diya naam"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <label className="modal-label">
              Naya Password
            </label>

            <div className="modal-input password-modal-input">
              <span>🔒</span>

              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={newPass}
                onChange={(e) =>
                  setNewPass(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleReset()
                }
              />

              <button
                className="modal-eye"
                onClick={() =>
                  setShowPass((p) => !p)
                }
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            {err && (
              <div className="error-box">
                ⚠️ {err}
              </div>
            )}

            <button
              className="modal-gold-btn"
              onClick={handleReset}
              disabled={loading}
            >
              {loading
                ? '⏳ Checking...'
                : '🔑 Reset Password'}
            </button>
          </>
        ) : (
          <div className="reset-success">

            <div className="success-icon">
              ✅
            </div>

            <div className="success-title">
              Password Reset Ho Gaya!
            </div>

            <div className="success-text">
              Ab naye password se login karo.
            </div>

            <button
              className="modal-gold-btn"
              onClick={onClose}
            >
              🚀 Login Karo
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthScreen({ onLogin }) {

  const [tab, setTab] = useState('login');

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [siteName, setSiteName] =
    useState('YONO MATKA');

  const [showForgot, setShowForgot] =
    useState(false);

  const [waNumber, setWaNumber] = useState('');
  const [tgUsername, setTgUsername] = useState('');

  useEffect(() => {

    fetch(`${API_URL}/api/payment-info`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.site_name) setSiteName(d.data.site_name);
        if (d.success && d.data?.whatsapp_support) setWaNumber(d.data.whatsapp_support);
        if (d.success && d.data?.telegram) setTgUsername(d.data.telegram);
      })
      .catch(() => {});

    const params =
      new URLSearchParams(
        window.location.search
      );

    const refCode =
      params.get('ref');

    if (refCode) {
      setReferralCode(
        refCode.toUpperCase()
      );

      setTab('register');
    }

  }, []);

  const go = async () => {

    setErr('');
    setLoading(true);

    try {

      let endpoint = '';
      let payload = {};

      if (tab === 'login') {

        if (!mobile || !password) {
          setErr(
            'Mobile aur password daalo'
          );

          setLoading(false);
          return;
        }

        endpoint = '/api/auth/login';

        payload = {
          mobile,
          password,
        };

      } else {

        if (!name || !mobile || !password) {

          setErr(
            'Sab fields zaroori hain'
          );

          setLoading(false);
          return;
        }

        if (mobile.length !== 10) {

          setErr(
            'Valid 10-digit mobile daalo'
          );

          setLoading(false);
          return;
        }

        if (password.length < 6) {

          setErr(
            'Password minimum 6 characters'
          );

          setLoading(false);
          return;
        }

        endpoint =
          '/api/auth/register';

        payload = {
          name,
          mobile,
          password,
        };

        if (referralCode.trim()) {

          payload.referral_code =
            referralCode
              .trim()
              .toUpperCase();
        }
      }

      const response =
        await fetch(
          `${API_URL}${endpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body:
              JSON.stringify(payload),
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status}`
        );
      }

      const res =
        await response.json();

      if (!res.success) {

        setErr(
          res.message || 'Failed'
        );

        setLoading(false);
        return;
      }

      localStorage.setItem(
        'mk_token',
        res.token
      );

      onLogin(res.user);

    } catch (e) {

      setErr(
        `Error: ${e.message}`
      );
    }

    setLoading(false);
  };

  const switchTab = (t) => {

    setTab(t);
    setErr('');

    setName('');
    setMobile('');
    setPassword('');

    if (t === 'login') {
      setReferralCode('');
    }
  };

  const sparks = [
    ['5%', '8%', 4],
    ['10%', '89%', 3],
    ['18%', '4%', 3],
    ['24%', '93%', 4],
    ['31%', '8%', 3],
    ['42%', '95%', 4],
    ['56%', '3%', 3],
    ['68%', '91%', 4],
    ['78%', '7%', 3],
    ['88%', '87%', 4],
    ['94%', '28%', 3],
    ['14%', '50%', 3],
    ['47%', '12%', 3],
    ['61%', '82%', 3],
    ['35%', '96%', 3],
    ['82%', '48%', 3],
  ];

  return (
    <div className="yono-page">

      <style>{`

        @import url(
          'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap'
        );

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden !important;
        }

        body {
          overflow: hidden !important;
        }

        button,
        input {
          font-family:
            'Poppins',
            sans-serif;
        }

        .yono-page {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          overflow: hidden !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background:
            radial-gradient(
              circle at 50% 20%,
              rgba(0,255,120,.10),
              transparent 32%
            ),
            linear-gradient(
              180deg,
              #021f18 0%,
              #01130f 100%
            );
          color: #fff;
        }

        .yono-shell {
          position: relative;
          width: min(100vw, 430px);
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 8px 12px 8px;
          background:
            radial-gradient(
              circle at 50% 17%,
              rgba(0,255,150,.20),
              transparent 31%
            ),
            radial-gradient(
              circle at 50% 82%,
              rgba(0,255,150,.10),
              transparent 39%
            ),
            linear-gradient(
              180deg,
              #064d3f 0%,
              #04352d 48%,
              #011a14 100%
            );
          box-shadow: 0 0 75px rgba(0,255,130,.12);
        }

        .yono-shell::before,
        .yono-shell::after {
          content: '';
          position: absolute;
          pointer-events: none;
          left: 50%;
          top: 42%;
          transform: translate(-50%, -50%) rotate(45deg);
          border: 2px solid rgba(30,255,150,.32);
          background: rgba(0,255,150,.025);
          box-shadow: 0 0 45px rgba(0,255,150,.11);
          animation: diamondPulse 5s ease-in-out infinite;
        }

        .yono-shell::before {
          width: 620px;
          height: 620px;
        }

        .yono-shell::after {
          width: 455px;
          height: 455px;
          border-color: rgba(30,255,150,.22);
          animation-delay: .5s;
        }

        .page-glow {
          position: absolute;
          width: 520px;
          height: 520px;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50%;
          background: rgba(0,255,160,.13);
          filter: blur(80px);
          pointer-events: none;
        }

        @keyframes sparkle {
          0%, 100% { opacity: .15; transform: scale(.5); }
          50% { opacity: 1; transform: scale(1.6); }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes diamondPulse {
          0%, 100% {
            opacity: .28;
            transform: translate(-50%,-50%) rotate(45deg) scale(1);
          }
          50% {
            opacity: .62;
            transform: translate(-50%,-50%) rotate(45deg) scale(1.035);
          }
        }

        @keyframes cardGlow {
          0%, 100% {
            box-shadow: 0 18px 50px rgba(0,0,0,.6), 0 0 20px rgba(0,255,190,.12);
          }
          50% {
            box-shadow: 0 18px 50px rgba(0,0,0,.6), 0 0 35px rgba(0,255,190,.25);
          }
        }

        @keyframes goldShine {
          0% { left: -130%; }
          55%, 100% { left: 160%; }
        }

        @keyframes textShine {
          0% { background-position: 220% center; }
          100% { background-position: -220% center; }
        }

        .spark {
          position: absolute;
          border-radius: 50%;
          background: #ffe16b;
          box-shadow: 0 0 10px 3px rgba(255,225,100,.75);
          animation: sparkle 2.4s ease-in-out infinite;
          z-index: 1;
        }

        .logo-wrap {
          position: relative;
          z-index: 3;
          width: min(100%, 430px);
          height: clamp(180px, 27vh, 255px);
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 0 0 auto;
        }

        .logo-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 310px;
          height: 310px;
          transform: translate(-50%,-50%) rotate(45deg);
          border: 2px solid rgba(30,255,150,.18);
          border-radius: 14px;
          animation: diamondPulse 5s ease-in-out infinite;
        }

        .logo-ring.small {
          width: 230px;
          height: 230px;
          animation-duration: 6.5s;
          animation-delay: .4s;
        }

        .logo-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          width: 230px;
          height: 230px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,190,20,.30), transparent 68%);
          filter: blur(20px);
        }

        .yono-logo {
          position: relative;
          z-index: 3;
          width: clamp(185px, 23vw, 285px);
          height: clamp(175px, 25vh, 235px);
          object-fit: contain;
          mix-blend-mode: lighten;
          filter:
            drop-shadow(0 0 22px rgba(255,210,0,.55))
            drop-shadow(0 7px 22px rgba(0,0,0,.55));
          animation: logoFloat 4s ease-in-out infinite;
        }

        .hero-divider {
          position: relative;
          z-index: 5;
          width: min(92%, 360px);
          height: 32px;
          margin: -1px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-divider::before,
        .hero-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 44%;
          height: 2px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, #ffd83a 18%, #fff0a0 52%, #ffd83a 82%, transparent);
          box-shadow: 0 0 7px rgba(255,210,30,.9), 0 0 18px rgba(255,180,20,.55);
        }

        .hero-divider::before { left: 0; }
        .hero-divider::after { right: 0; }

        .divider-gem {
          position: relative;
          width: 25px;
          height: 25px;
          transform: rotate(45deg);
          border: 2px solid #ffd82d;
          background: linear-gradient(135deg, #0caa63, #42e79a 48%, #087247);
          box-shadow: 0 0 9px rgba(255,215,35,.95), 0 0 22px rgba(0,255,140,.65);
        }

        .divider-spark {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fff2a0;
          box-shadow: 0 0 10px 3px rgba(255,210,35,.9);
          animation: sparkle 1.8s ease-in-out infinite;
        }

        .divider-spark.left { left: 23%; animation-delay: .2s; }
        .divider-spark.right { right: 23%; animation-delay: .8s; }

        .brand {
          position: relative;
          z-index: 4;
          width: 100%;
          text-align: center;
          flex: 0 0 auto;
          margin-top: 0;
        }

        .brand-title {
          margin: 0;
          font-size: clamp(30px, 4.1vw, 48px);
          line-height: 1;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: linear-gradient(90deg, #a85f00 0%, #ffd43d 20%, #fff4ad 40%, #ffbd1b 55%, #f47700 70%, #ffe25b 86%, #a85f00 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: textShine 3s linear infinite;
          filter:
            drop-shadow(0 3px 0 #6f3500)
            drop-shadow(0 0 11px rgba(255,180,20,.65));
        }

        .brand-subtitle {
          margin: 6px 0 0;
          font-size: clamp(12px, 1.7vw, 17px);
          font-weight: 800;
          line-height: 1.1;
          text-shadow: 0 2px 8px rgba(0,0,0,.65);
        }

        .brand-subtitle b { color: #ffe12f; }

        .auth-card {
          position: relative;
          z-index: 4;
          width: min(100%, 450px);
          margin-top: clamp(9px, 1.5vh, 16px);
          padding: 16px 17px 16px;
          border-radius: 23px;
          background: linear-gradient(145deg, rgba(4,25,23,.98), rgba(3,22,19,.96));
          border: 2px solid rgba(0,226,207,.56);
          animation: cardGlow 4s ease-in-out infinite;
          flex: 0 0 auto;
        }

        .tabs {
          height: 55px;
          display: flex;
          gap: 3px;
          padding: 3px;
          border: 2px solid rgba(190,205,200,.27);
          border-radius: 17px;
          background: rgba(255,255,255,.035);
          margin-bottom: 14px;
        }

        .tab {
          flex: 1;
          border: 0;
          border-radius: 13px;
          background: transparent;
          color: rgb(255, 255, 255);
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: .2s ease;
        }

        .tab.active {
          color: #141414;
          background: linear-gradient(180deg, #ffc43d 0%, #ff9d20 48%, #f07915 100%);
          box-shadow: 0 0 19px rgba(255,177,25,.6), inset 0 2px 0 rgba(255,255,255,.38);
        }

        .field { margin-bottom: 11px; }

        .field-label {
          display: block;
          margin: 10px  5px 10px;
          color: rgba(244, 241, 51, 0.99);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .8px;
          text-transform: uppercase;
        }

        .input-box {
          height: 49px;
          width: 100%;
          display: flex;
          align-items: center;
          overflow: hidden;
          border: 2px solid rgba(0,220,207,.72);
          border-radius: 14px;
          background: rgba(0,100,92,.18);
          transition: .2s ease;
        }

        .input-box:focus-within {
          border-color: #00f0d9;
          box-shadow: 0 0 0 3px rgba(0,240,215,.08), 0 0 17px rgba(0,240,215,.12);
        }

        .input-icon {
          width: 43px;
          height: 100%;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          background: rgba(0,220,195,.09);
          font-size: 17px;
        }

        .prefix {
          padding: 0 5px;
          color: #00e8dc;
          font-size: 14px;
          font-weight: 900;
        }

        .input-box input {
          min-width: 0;
          flex: 1;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #00e8dc;
          font-size: 15px;
          font-weight: 800;
          padding: 0 8px;
          caret-color: #ffe02c;
        }

        .input-box input::placeholder { color: rgba(255,255,255,.25); }

        .eye {
          width: 42px;
          height: 100%;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,.65);
          cursor: pointer;
          font-size: 17px;
        }

        .error-box {
          margin: 0 0 10px;
          padding: 8px 11px;
          border-left: 3px solid #ff4455;
          border-radius: 7px;
          background: rgba(255,23,68,.10);
          color: #ff7180;
          font-size: 11px;
          font-weight: 700;
        }

        .gold-btn {
          position: relative;
          overflow: hidden;
          width: 100%;
          min-height: 58px;
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 3px solid #ffd52c;
          border-radius: 36px;
          background: linear-gradient(180deg, #ffc43a 0%, #ff9d20 52%, #ec7015 100%);
          color: #111;
          cursor: pointer;
          box-shadow:
            0 0 0 4px rgba(35,255,150,.30),
            0 0 25px rgba(255,180,25,.72),
            inset 0 3px 0 rgba(255,255,255,.42);
          transition: transform .15s, filter .15s;
        }

        .gold-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -130%;
          width: 55%;
          height: 100%;
          transform: skewX(-20deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.58), transparent);
          animation: goldShine 2.4s ease-in-out infinite;
        }

        .gold-btn:hover { transform: translateY(-2px) scale(1.01); filter: brightness(1.08); }
        .gold-btn:active { transform: scale(.98); }

        .gold-main {
          position: relative;
          z-index: 2;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 1px;
          line-height: 1.1;
        }

        .gold-sub {
          position: relative;
          z-index: 2;
          margin-top: 2px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.1px;
          line-height: 1;
        }

        .forgot-link {
          display: block;
          width: max-content;
          margin: 10px auto 0;
          color: #00e8d2;
          font-size: 12px;
          font-weight: 800;
          text-decoration: underline;
          cursor: pointer;
        }

        .forgot-link:hover { color: #ffe02c; }

        .footer-note {
          position: relative;
          z-index: 3;
          margin: 7px 0 0;
          color: rgb(242, 237, 237);
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          flex: 0 0 auto;
        }

        .forgot-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0,10,5,.88);
          backdrop-filter: blur(7px);
        }

        .forgot-modal {
          width: min(100%, 370px);
          padding: 22px;
          border-radius: 21px;
          background: linear-gradient(145deg, #061f17, #0a3020);
          border: 1.5px solid rgba(255,205,30,.35);
          box-shadow: 0 0 45px rgba(0,200,120,.18);
        }

        .modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .modal-title { color: #ffd42b; font-size: 17px; font-weight: 900; }

        .modal-close {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,215,0,.3);
          border-radius: 8px;
          background: rgba(255,215,0,.08);
          color: #ffd42b;
          cursor: pointer;
        }

        .modal-help {
          margin: 0 0 15px;
          color: rgba(255,255,255,.52);
          font-size: 12px;
          line-height: 1.5;
          font-weight: 600;
        }

        .modal-label {
          display: block;
          margin: 0 0 6px;
          color: #ffd42b;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .modal-input {
          height: 47px;
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          padding: 0 11px;
          border: 1.5px solid rgba(0,220,140,.35);
          border-radius: 11px;
          background: rgba(0,0,0,.27);
        }

        .modal-input input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #fff;
          padding: 0 10px;
          font-size: 13px;
          font-weight: 600;
        }

        .modal-prefix { color: #00e8a0; font-size: 13px; font-weight: 900; padding-left: 7px; }
        .modal-eye { border: 0; background: transparent; cursor: pointer; font-size: 16px; }

        .modal-gold-btn {
          width: 100%;
          border: 0;
          border-radius: 40px;
          padding: 13px;
          color: #f70303;
          background: linear-gradient(90deg, #b8740a, #f0a020, #b8740a);
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .reset-success { text-align: center; padding: 8px 0 2px; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .success-title { color: #00e676; font-size: 17px; font-weight: 900; margin-bottom: 7px; }
        .success-text { color: rgba(255,255,255,.5); font-size: 12px; font-weight: 600; margin-bottom: 20px; }

        @media (max-width: 600px) {
          .yono-shell { width: 100vw; padding: 3px 8px 5px; }
          .logo-wrap { height: 180px; }
          .yono-logo { width: 250px; height: 175px; }
          .logo-ring { width: 250px; height: 250px; }
          .logo-ring.small { width: 190px; height: 190px; }
          .brand-title { font-size: 31px; letter-spacing: 1px; }
          .brand-subtitle { font-size: 11px; margin-top: 4px; }
          .hero-divider { width: 92%; height: 28px; }
          .divider-gem { width: 21px; height: 21px; }
          .auth-card { width: min(100%, 430px); margin-top: 8px; padding: 13px 12px 13px; }
          .tabs { height: 51px; margin-bottom: 11px; }
          .tab { font-size: 13px; }
          .field { margin-bottom: 8px; }
          .field-label { font-size: 9px; margin-bottom: 4px; }
          .input-box { height: 45px; }
          .gold-btn { min-height: 54px; }
          .gold-main { font-size: 14px; }
          .gold-sub { font-size: 9px; }
          .forgot-link { margin-top: 8px; font-size: 11px; }
          .footer-note { display: none; }
        }

        @media (max-height: 700px) {
          .logo-wrap { height: 145px; }
          .yono-logo { width: 215px; height: 140px; }
          .logo-ring { width: 210px; height: 210px; }
          .logo-ring.small { width: 160px; height: 160px; }
          .hero-divider { height: 24px; }
          .divider-gem { width: 18px; height: 18px; }
          .brand-title { font-size: 27px; }
          .brand-subtitle { font-size: 10px; }
          .auth-card { margin-top: 5px; padding: 10px 11px 10px; }
          .tabs { height: 45px; margin-bottom: 8px; }
          .field { margin-bottom: 6px; }
          .input-box { height: 40px; }
          .gold-btn { min-height: 48px; }
          .forgot-link { margin-top: 6px; }
        }

      `}</style>

      <div className="yono-shell">

        <div className="page-glow" />

        {sparks.map(
          ([top, left, size], i) => (
            <span
              key={i}
              className="spark"
              style={{
                top,
                left,
                width: size,
                height: size,
                animationDelay: `${i * .16}s`,
              }}
            />
          )
        )}

        {/* LOGO */}
        <div className="logo-wrap">
          <div className="logo-ring" />
          <div className="logo-ring small" />
          <div className="logo-glow" />
          <img
            className="yono-logo"
            src="/yono.png"
            alt="YONO MATKA"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* GOLD DECORATIVE LINE */}
        <div className="hero-divider" aria-hidden="true">
          <span className="divider-gem" />
          <span className="divider-spark left" />
          <span className="divider-spark right" />
        </div>

        {/* BRAND */}
        <div className="brand">
          <h1 className="brand-title">{siteName}</h1>
          <p className="brand-subtitle">
            India's <b>#1</b> Premium Matka Platform
          </p>
        </div>

        {/* FORGOT PASSWORD */}
        {showForgot && (
          <ForgotPasswordModal
            onClose={() => setShowForgot(false)}
          />
        )}

        {/* AUTH CARD */}
        <div className="auth-card">

          <div className="tabs">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                className={`tab ${tab === t ? 'active' : ''}`}
                onClick={() => switchTab(t)}
              >
                {t === 'login' ? '🔐 LOGIN' : '📝 REGISTER'}
              </button>
            ))}
          </div>

          {/* REGISTER NAME */}
          {tab === 'register' && (
            <div className="field">
              <label className="field-label">Full Name</label>
              <div className="input-box">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="PLEASE ENTER YOUR NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* MOBILE */}
          <div className="field">
            <label className="field-label">Mobile Number</label>
            <div className="input-box">
              <span className="input-icon">📱</span>
              <span className="prefix">+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile"
                maxLength={10}
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ''))
                }
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="field">
            <label className="field-label">Password</label>
            <div className="input-box">
              <span className="input-icon">🔒</span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && go()}
              />
              <button
                className="eye"
                onClick={() => setShowPass((p) => !p)}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* REFERRAL */}
          {tab === 'register' && (
            <div className="field">
              <label className="field-label">
                Referral Code{' '}
                <span style={{ opacity: .35, textTransform: 'none' }}>
                  (Optional)
                </span>
              </label>
              <div className="input-box">
                <span className="input-icon">🎁</span>
                <input
                  type="text"
                  placeholder="ENTER REFERRAL CODE"
                  maxLength={10}
                  value={referralCode}
                  onChange={(e) =>
                    setReferralCode(e.target.value.toUpperCase())
                  }
                />
              </div>
            </div>
          )}

          {/* ERROR */}
          {err && (
            <div className="error-box">⚠️ {err}</div>
          )}

          {/* LOGIN BUTTON */}
          <button className="gold-btn" onClick={go} disabled={loading}>
            <span className="gold-main">
              {loading
                ? '⏳ PROCESSING...'
                : tab === 'login'
                ? '🚀 SECURE LOGIN'
                : '✨ CREATE ACCOUNT'}
            </span>
            {!loading && (
              <span className="gold-sub">PLAY SMART, WIN BIG</span>
            )}
          </button>

          {/* FORGOT */}
          {tab === 'login' && (
            <div
              className="forgot-link"
              onClick={() => setShowForgot(true)}
            >
              🔑 Forgot Password?
            </div>
          )}

          {/* WHATSAPP & TELEGRAM BUTTONS */}
          {(waNumber || tgUsername) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {waNumber && (
                <a
                  href={`https://wa.me/91${waNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '11px 0',
                    borderRadius: 12,
                   
                    fontWeight: 800,
                    fontSize: 13,
                    textDecoration: 'none',
                  }}
                >
                  
                </a>
              )}
              {tgUsername && (
                <a
                  href={`https://t.me/${tgUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '11px 0',
                    borderRadius: 12,
                    background: 'rgba(0,136,204,0.12)',
                    border: '1.5px solid rgba(0,136,204,0.35)',
                    color: '#29B6F6',
                    fontWeight: 800,
                    fontSize: 13,
                    textDecoration: 'none',
                  }}
                >
                  ✈️ Telegram
                </a>
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <p className="footer-note">
          18+ Only · Play Responsibly · © 2026 {siteName}
        </p>

      </div>

    </div>
  );
}