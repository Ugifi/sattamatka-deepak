import React, { useEffect, useState } from 'react';

export default function Toast({ msg, type, onClose }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Mount ke saath enter animation
    requestAnimationFrame(() => setVisible(true));

    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 400);
    }, 2800);

    return () => clearTimeout(exitTimer);
  }, [onClose]);

  const isErr = type === 'err';

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          0%   { transform: translateX(110%) scale(0.85); opacity: 0; }
          60%  { transform: translateX(-6%) scale(1.02); opacity: 1; }
          100% { transform: translateX(0%)  scale(1);    opacity: 1; }
        }
        @keyframes toastSlideOut {
          0%   { transform: translateX(0%)   scale(1);    opacity: 1; }
          100% { transform: translateX(110%) scale(0.85); opacity: 0; }
        }
        @keyframes coinSpin {
          0%   { transform: rotateY(0deg) scale(1); }
          40%  { transform: rotateY(180deg) scale(1.15); }
          100% { transform: rotateY(360deg) scale(1); }
        }
        @keyframes shimmerGold {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0px rgba(255,215,0,0); }
          50%       { box-shadow: 0 0 18px rgba(255,215,0,0.45); }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to   { width: 0%; }
        }

        .ym-toast-wrap {
          position: fixed;
          top: 64px;
          right: 12px;
          z-index: 99999;
          max-width: 320px;
          width: calc(100vw - 24px);
          font-family: 'Poppins', sans-serif;
          pointer-events: none;
        }

        .ym-toast {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          padding: 13px 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
          border: 1.5px solid;
          backdrop-filter: blur(8px);
          animation: toastSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .ym-toast.exit {
          animation: toastSlideOut 0.4s ease-in both;
        }

        /* SUCCESS */
        .ym-toast.success {
          background: linear-gradient(135deg, rgba(2,20,14,0.97) 0%, rgba(6,40,26,0.97) 100%);
          border-color: rgba(255,215,0,0.55);
          animation: toastSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both,
                     pulseGlow 2s ease-in-out 0.5s 1;
        }

        /* ERROR */
        .ym-toast.error {
          background: linear-gradient(135deg, rgba(20,2,2,0.97) 0%, rgba(40,6,6,0.97) 100%);
          border-color: rgba(255,60,60,0.5);
        }

        /* Gold shimmer bar top */
        .ym-toast-topbar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 14px 14px 0 0;
        }
        .success .ym-toast-topbar {
          background: linear-gradient(90deg, #b8860b, #FFD700, #fff8b0, #FFD700, #b8860b);
          background-size: 200% auto;
          animation: shimmerGold 2s linear infinite;
        }
        .error .ym-toast-topbar {
          background: linear-gradient(90deg, #7f0000, #ff3c3c, #ff8080, #ff3c3c, #7f0000);
          background-size: 200% auto;
          animation: shimmerGold 2s linear infinite;
        }

        /* Icon circle */
        .ym-toast-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-top: 1px;
        }
        .success .ym-toast-icon {
          background: radial-gradient(circle, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0.04) 100%);
          border: 1.5px solid rgba(255,215,0,0.45);
          animation: coinSpin 0.7s ease 0.15s 1;
        }
        .error .ym-toast-icon {
          background: radial-gradient(circle, rgba(255,60,60,0.15) 0%, rgba(255,60,60,0.04) 100%);
          border: 1.5px solid rgba(255,60,60,0.4);
        }

        /* Text area */
        .ym-toast-body { flex: 1; min-width: 0; }
        .ym-toast-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .success .ym-toast-label { color: #FFD700; }
        .error   .ym-toast-label { color: #ff6060; }

        .ym-toast-msg {
          font-size: 13.5px;
          font-weight: 700;
          line-height: 1.4;
          color: #fff;
          word-break: break-word;
        }

        /* Progress bar bottom */
        .ym-toast-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          border-radius: 0 0 14px 14px;
          animation: progressBar 2.8s linear forwards;
        }
        .success .ym-toast-progress {
          background: linear-gradient(90deg, #b8860b, #FFD700);
        }
        .error .ym-toast-progress {
          background: linear-gradient(90deg, #7f0000, #ff3c3c);
        }

        /* Corner gem */
        .ym-toast-gem {
          position: absolute;
          top: 10px; right: 10px;
          font-size: 9px;
          opacity: 0.45;
        }
      `}</style>

      <div className="ym-toast-wrap">
        <div className={`ym-toast ${isErr ? 'error' : 'success'} ${exiting ? 'exit' : ''}`}>
          <div className="ym-toast-topbar" />

          <div className="ym-toast-icon">
            {isErr ? '❌' : '🪙'}
          </div>

          <div className="ym-toast-body">
            <div className="ym-toast-label">
              {isErr ? 'Error' : 'Bid Placed!'}
            </div>
            <div className="ym-toast-msg">{msg}</div>
          </div>

          <div className="ym-toast-gem">{isErr ? '⬡' : '♦'}</div>
          <div className="ym-toast-progress" />
        </div>
      </div>
    </>
  );
}