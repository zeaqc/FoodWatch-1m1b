import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const from = location.state?.from || null;

  const searchParams = new URLSearchParams(location.search);
  const roleHint = searchParams.get('role');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (from) { navigate(from, { replace: true }); return; }
      if (user.role === 'donor')    navigate('/donor');
      else if (user.role === 'receiver') navigate('/receiver');
      else if (user.role === 'admin')    navigate('/admin');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg;
      setError(msg || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        
        {/* Top Editorial Eyebrow */}
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
            FoodWatch &bull; Secure Portal
          </span>

          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="auth-title">
          {roleHint === 'donor' ? 'Donor Sign In' : roleHint === 'receiver' ? 'Recipient Sign In' : 'Sign In to FoodWatch'}
        </h1>
        <p className="auth-sub">
          {roleHint === 'donor'
            ? 'Access your food donation dashboard and view active listings.'
            : roleHint === 'receiver'
            ? 'Access nearby surplus listings and claim donations.'
            : 'Fighting food waste and hunger together — SDG 2 Zero Hunger'}
        </p>

        {error && (
          <div style={{
            backgroundColor: '#FDF2F0',
            border: '1px solid #F5C6CB',
            color: '#721C24',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.88rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-forest btn-full"
            disabled={loading}
            style={{
              marginTop: '1rem',
              fontSize: '1rem',
              padding: '0.9rem',
              fontWeight: 700
            }}
          >
            {loading ? 'Signing in…' : 'Sign In to Portal &rarr;'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--cream-border)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          New to FoodWatch?{' '}
          <Link
            to={`/register${roleHint ? `?role=${roleHint}` : ''}`}
            style={{ fontWeight: 700, color: 'var(--forest-dark)', textDecoration: 'underline' }}
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}

