import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DONOR_TYPES    = ['individual','restaurant','caterer','event_host','ngo','other'];
const RECEIVER_TYPES = ['individual','ngo','shelter','community_kitchen','other'];

export default function RegisterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();
  const initialRole = searchParams.get('role') === 'receiver' ? 'receiver' : 'donor';
  const [role, setRole]       = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState([]);

  // Keep role in sync if URL query changes
  React.useEffect(() => {
    const qRole = searchParams.get('role');
    if (qRole && (qRole === 'donor' || qRole === 'receiver') && qRole !== role) {
      setRole(qRole);
    }
  }, [searchParams, role]);

  const handleRoleToggle = (newRole) => {
    setRole(newRole);
    navigate(`/register?role=${newRole}`, { replace: true });
  };

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    donorType: 'restaurant', orgName: '', fssaiNumber: '',
    receiverType: 'shelter', ngoRegNumber: '',
    'address.area': '', 'address.city': '', 'address.state': ''
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    if (form.password !== form.confirmPassword) {
      return setErrors([{ msg: 'Passwords do not match' }]);
    }

    const cleanPhone = form.phone.replace(/^(\+91|0)/, '').replace(/\D/g, '');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: cleanPhone,
      password: form.password,
      address: {
        area:  form['address.area'].trim(),
        city:  form['address.city'].trim(),
        state: form['address.state'].trim()
      }
    };

    if (role === 'donor') {
      Object.assign(payload, {
        donorType:   form.donorType,
        orgName:     form.orgName.trim(),
        fssaiNumber: form.fssaiNumber.trim()
      });
    } else {
      Object.assign(payload, {
        receiverType: form.receiverType,
        ngoRegNumber: form.ngoRegNumber.trim()
      });
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/register/${role}`, payload);
      setAuth(data.user, data.token);
      toast.success('Account created! Please verify your phone number via OTP.');
      if (role === 'donor') {
        navigate('/verify-otp?next=donate');
      } else {
        navigate('/verify-otp');
      }
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs && Array.isArray(errs) && errs.length > 0) {
        setErrors(errs);
      } else {
        setErrors([{ msg: err.response?.data?.message || 'Registration failed. Please check the form.' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        
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
            SDG 2 Zero Hunger &bull; Verified Network
          </span>

          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="auth-title">
          {role === 'donor' ? 'Register as Food Donor' : 'Register as Food Recipient'}
        </h1>
        <p className="auth-sub">
          {role === 'donor'
            ? 'Connect surplus banquets, restaurant batches, and produce to verified community shelters in real time.'
            : 'Register your shelter, community kitchen, or NGO to receive fresh surplus food within 5km radius.'}
        </p>

        {/* Dynamic Animated Role Toggle with Sliding Highlight */}
        <div className="role-toggle-bar">
          <div
            className="role-toggle-indicator"
            style={{
              transform: role === 'donor' ? 'translateX(0%)' : 'translateX(100%)'
            }}
          />
          <button
            type="button"
            className={`role-toggle-btn ${role === 'donor' ? 'active' : ''}`}
            onClick={() => handleRoleToggle('donor')}
            id="toggle-role-donor"
          >
            <span>🍱</span> Food Donor Portal
          </button>
          <button
            type="button"
            className={`role-toggle-btn ${role === 'receiver' ? 'active' : ''}`}
            onClick={() => handleRoleToggle('receiver')}
            id="toggle-role-receiver"
          >
            <span>🤲</span> Food Recipient Portal
          </button>
        </div>

        {errors.length > 0 && (
          <div style={{
            backgroundColor: '#FDF2F0',
            border: '1px solid #F5C6CB',
            color: '#721C24',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.88rem'
          }}>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              {errors.map((e, i) => <li key={i}>{e.msg}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
            <div className="form-group">
              <label>Mobile Number (10 digits) *</label>
              <input
                type="tel"
                required
                pattern="[6-9][0-9]{9}"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="98XXXXXXXX"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="contact@organisation.org"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password * (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Address / Operational Location */}
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                required
                value={form['address.city']}
                onChange={e => set('address.city', e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai, Delhi"
              />
            </div>
            <div className="form-group">
              <label>{role === 'receiver' ? 'Area / Locality *' : 'Area / Locality'}</label>
              <input
                type="text"
                required={role === 'receiver'}
                value={form['address.area']}
                onChange={e => set('address.area', e.target.value)}
                placeholder="e.g. Indiranagar, Bandra West"
              />
            </div>
          </div>

          {/* Role-Specific Fields with Smooth Dynamic Transition */}
          <div key={role} className="auth-fields-animated">
            {role === 'donor' ? (
              <div className="form-row">
                <div className="form-group">
                  <label>Donor Category *</label>
                  <select
                    value={form.donorType}
                    onChange={e => set('donorType', e.target.value)}
                  >
                    {DONOR_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t === 'event_host' ? 'Event / Banquet Host' : t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Organisation / Restaurant Name</label>
                  <input
                    type="text"
                    value={form.orgName}
                    onChange={e => set('orgName', e.target.value)}
                    placeholder="e.g. Green Leaf Kitchens"
                  />
                </div>
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label>Recipient Category *</label>
                  <select
                    value={form.receiverType}
                    onChange={e => set('receiverType', e.target.value)}
                  >
                    {RECEIVER_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t === 'community_kitchen' ? 'Community Kitchen' : t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>NGO Reg. / Shelter ID (optional)</label>
                  <input
                    type="text"
                    value={form.ngoRegNumber}
                    onChange={e => set('ngoRegNumber', e.target.value)}
                    placeholder="e.g. 12AA / CSR-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn btn-forest btn-full"
            disabled={loading}
            style={{
              marginTop: '1rem',
              fontSize: '1rem',
              padding: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.01em'
            }}
          >
            {loading ? (
              <span>Setting up your portal…</span>
            ) : role === 'donor' ? (
              <span>Complete Registration &bull; List First Food Donation &rarr;</span>
            ) : (
              <span>Complete Registration &bull; Enter Recipient Portal &rarr;</span>
            )}
          </button>
        </form>

        {/* Footer Nav */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--cream-border)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          Already have an account?{' '}
          <Link
            to={`/login?role=${role}`}
            style={{ fontWeight: 700, color: 'var(--forest-dark)', textDecoration: 'underline' }}
          >
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  );
}

