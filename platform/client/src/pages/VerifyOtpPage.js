import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyOtpPage() {
  const { user, refreshUser, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextAction = searchParams.get('next');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [showEditPhone, setShowEditPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const inputRefs = useRef([]);

  // Send OTP on mount if user is logged in and not verified
  useEffect(() => {
    if (user && !user.phoneVerified) {
      handleSendOtp();
    }
  }, [user?.phone, user?.phoneVerified]);

  // Keep newPhone in sync with user.phone
  useEffect(() => {
    if (user?.phone) {
      setNewPhone(user.phone);
    }
  }, [user?.phone]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (phoneOverride) => {
    setSending(true);
    setError('');
    const targetPhone = phoneOverride || user?.phone;
    try {
      const res = await api.post('/auth/send-otp', { phone: targetPhone });
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setCountdown(30);
      toast.success(res.data?.message || 'OTP sent to your phone!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Try entering 123456 in dev mode.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    const cleanPhone = newPhone.replace(/^(\+91|0)/, '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      return;
    }

    setUpdatingPhone(true);
    setError('');
    try {
      const { data } = await api.put('/auth/profile', { phone: cleanPhone });
      setUser(data.user);
      setShowEditPhone(false);
      toast.success(`Phone updated to +91 ${cleanPhone}! Sending new OTP…`);
      await handleSendOtp(cleanPhone);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update phone number');
      toast.error('Failed to update phone number');
    } finally {
      setUpdatingPhone(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', {
        otp: fullOtp,
        phone: user?.phone
      });

      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        await refreshUser();
      }

      toast.success('Phone verified successfully! 🎉');

      // Navigate to destination depending on role & next parameter
      if (nextAction === 'donate' || (user?.role === 'donor' && nextAction !== 'home')) {
        navigate(nextAction === 'donate' ? '/donor?action=donate' : '/donor', { replace: true });
      } else if (user?.role === 'receiver') {
        navigate('/receiver', { replace: true });
      } else {
        navigate('/browse', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDevOtp = (code) => {
    const digits = String(code).split('').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
  };

  const maskedPhone = user?.phone
    ? `${user.phone.slice(0, 2)}******${user.phone.slice(-2)}`
    : 'your mobile number';

  const roleLabel = user?.role === 'donor' ? '🍱 Donor Account Verification' : '🤲 Recipient Account Verification';

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 490 }}>
        
        {/* Eyebrow */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.74rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--forest-olive)',
            backgroundColor: 'var(--cream-surface)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--cream-border)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--forest-olive)', display: 'inline-block' }} />
            {roleLabel}
          </span>

          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            &larr; Home
          </Link>
        </div>

        {user?.phoneVerified ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--forest-dark)', marginBottom: '0.5rem' }}>
              Phone Already Verified
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.92rem' }}>
              Your mobile number <strong>{user.phone}</strong> is verified. You have full access to {user.role === 'donor' ? 'list donations' : 'claim food'}.
            </p>
            <Link
              to={user.role === 'donor' ? '/donor' : user.role === 'receiver' ? '/receiver' : '/browse'}
              className="btn btn-forest"
              style={{ textDecoration: 'none', display: 'inline-block', padding: '0.8rem 2rem' }}
            >
              Go to Dashboard &rarr;
            </Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Verify Your Mobile Number</h1>
            <p className="auth-sub">
              {user?.role === 'donor'
                ? 'To ensure safe food donations and coordination with community shelters, please verify your phone via OTP.'
                : 'To claim surplus food and coordinate pickups with food donors, please verify your phone via OTP.'}
            </p>

            {/* Phone Info & Change Phone Toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--cream-surface)',
              border: '1px solid var(--cream-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.88rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Registered Phone: </span>
                <strong>+91 {user?.phone || maskedPhone}</strong>
              </div>
              <button
                type="button"
                onClick={() => setShowEditPhone(p => !p)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--forest-olive)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {showEditPhone ? 'Cancel' : 'Change'}
              </button>
            </div>

            {/* Edit Phone Form */}
            {showEditPhone && (
              <form onSubmit={handleUpdatePhone} style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px dashed var(--forest-olive)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--forest-dark)', marginBottom: '0.4rem' }}>
                  Update Mobile Number:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="10-digit mobile (e.g. 98XXXXXXXX)"
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--cream-border)',
                      fontSize: '0.88rem'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-forest btn-sm"
                    disabled={updatingPhone}
                    style={{ padding: '0.55rem 1rem' }}
                  >
                    {updatingPhone ? 'Saving…' : 'Save & Send OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Dev helper card */}
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.1rem',
              marginBottom: '1.25rem',
              fontSize: '0.86rem',
              color: '#1E40AF'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong>💡 Development Mode:</strong>
                  <div>
                    Active OTP: <strong>{devOtp || '123456'}</strong> (or enter <strong>123456</strong>)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fillDevOtp(devOtp || '123456')}
                  style={{
                    backgroundColor: '#DBEAFE',
                    border: '1px solid #93C5FD',
                    color: '#1D4ED8',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Auto-fill
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#FDF2F0',
                border: '1px solid #F5C6CB',
                color: '#721C24',
                borderRadius: 'var(--radius-md)',
                padding: '0.8rem 1.25rem',
                marginBottom: '1.25rem',
                fontSize: '0.88rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.6rem',
                margin: '1.5rem 0'
              }} onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    style={{
                      width: '48px',
                      height: '56px',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      borderRadius: 'var(--radius-md)',
                      border: digit ? '2px solid var(--forest-olive)' : '1.5px solid var(--cream-border)',
                      backgroundColor: digit ? '#FFFFFF' : '#FCFAF5',
                      color: 'var(--forest-dark)',
                      outline: 'none',
                      transition: 'border-color 0.2s, transform 0.1s'
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-forest btn-full"
                disabled={loading || otp.join('').length < 6}
                style={{
                  fontSize: '1rem',
                  padding: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em'
                }}
              >
                {loading ? 'Verifying…' : 'Verify & Continue &rarr;'}
              </button>
            </form>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--cream-border)',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)'
            }}>
              <span>Didn't receive the code?</span>
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={countdown > 0 || sending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: countdown > 0 ? 'var(--text-muted)' : 'var(--forest-olive)',
                  fontWeight: 700,
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  padding: 0,
                  textDecoration: countdown > 0 ? 'none' : 'underline'
                }}
              >
                {sending ? 'Sending…' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
