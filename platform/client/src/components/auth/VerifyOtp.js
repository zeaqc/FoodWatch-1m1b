import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function VerifyOtp() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [resent,  setResent]  = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { otp });
      const user = await refreshUser();
      toast.success('Phone verified! Welcome to FoodWatch 🎉');
      if (user.role === 'donor')    navigate('/donor');
      else if (user.role === 'receiver') navigate('/receiver');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp');
      setResent(true);
      toast.success('New OTP sent to your mobile');
    } catch (err) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <h1 className="auth-title">Verify Your Phone</h1>
        <p className="auth-sub">We sent a 6-digit OTP to your registered mobile number.</p>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456" autoFocus
              style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.4rem' }}
            />
          </div>
          <button type="submit" className="btn btn-green btn-full" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.85rem', color: 'var(--muted)' }}>
          Didn't receive it?{' '}
          <button onClick={handleResend} disabled={resent}
            style={{ background: 'none', border: 'none', color: 'var(--green-mid)', cursor: 'pointer', fontWeight: 700 }}>
            {resent ? 'OTP resent ✓' : 'Resend OTP'}
          </button>
        </p>
      </div>
      <style>{`
        .auth-wrap { display:flex; justify-content:center; align-items:center; min-height:calc(100vh - 64px); padding:2rem; }
        .auth-card { width:100%; max-width:400px; }
        .auth-title{ font-size:1.5rem; font-weight:800; color:var(--green-dark); margin-bottom:.3rem; }
        .auth-sub  { color:var(--muted); font-size:.88rem; margin-bottom:1.5rem; }
      `}</style>
    </div>
  );
}
