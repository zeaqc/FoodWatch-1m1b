import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const notifRef = useRef(null);

  // Fetch unread notifications count every 60s
  const { data: notifData } = useQuery({
    queryKey: ['notif-count'],
    queryFn:  () => api.get('/impact/notifications').then(r => r.data),
    enabled:  !!user,
    refetchInterval: 60_000
  });

  const unread = notifData?.unreadCount || 0;
  const notifs = notifData?.notifications || [];

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await api.patch('/impact/notifications/read-all');
    setShowNotif(false);
  };

  const dashboardLink = user?.role === 'donor'    ? '/donor'
                      : user?.role === 'receiver' ? '/receiver'
                      : user?.role === 'admin'    ? '/admin'
                      : '/';

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🌾 FoodWatch</Link>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <NavLink to="/browse" className={({ isActive }) => isActive ? 'active' : ''}>Browse</NavLink>
        <NavLink to="/impact" className={({ isActive }) => isActive ? 'active' : ''}>Impact</NavLink>
        <a
          href="/FoodWatch_Project_Presentation.pptx"
          download
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--forest-olive)',
            border: '1px solid var(--cream-border)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            textDecoration: 'none'
          }}
          title="Download Project Presentation (.pptx)"
        >
          📥 PPTX
        </a>

        {!user && (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Sign In</NavLink>
            <button className="btn-nav" onClick={() => navigate('/register?role=donor')}>🍱 Donate Food</button>
          </>
        )}

        {user && (
          <>
            <NavLink to={dashboardLink} className={({ isActive }) => isActive ? 'active' : ''}>
              Dashboard
            </NavLink>

            {!user.phoneVerified && (
              <NavLink
                to="/verify-otp"
                style={{
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FCD34D',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.3rem 0.8rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>⚠️</span> Verify Phone
              </NavLink>
            )}

            {/* Notification bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                className="notif-bell-btn"
                onClick={() => setShowNotif(v => !v)}
                title="Notifications"
              >
                <span style={{ fontSize: '1.25rem', display: 'inline-block', transform: unread > 0 ? 'rotate(-10deg)' : 'none' }}>🔔</span>
                {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
              </button>

              {showNotif && (
                <div className="notif-panel">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1.15rem',
                    borderBottom: '1px solid var(--cream-border)',
                    backgroundColor: 'var(--cream-surface)'
                  }}>
                    <strong style={{ fontSize: '.92rem', color: 'var(--forest-dark)', fontWeight: 800 }}>
                      Notifications {unread > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--forest-olive)' }}>({unread} new)</span>}
                    </strong>
                    {unread > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '.78rem',
                          fontWeight: 700,
                          color: 'var(--forest-olive)',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-scroll-area">
                    {notifs.length === 0 && (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>📭</p>
                        <p style={{ fontSize: '.88rem' }}>No notifications yet</p>
                      </div>
                    )}
                    {notifs.slice(0, 20).map(n => (
                      <div
                        key={n._id}
                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => { setShowNotif(false); if (n.link) navigate(n.link); }}
                      >
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-body">{n.body}</div>
                        <div className="notif-time">{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="btn-nav" onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
          </>
        )}
      </div>
    </nav>
  );
}
