import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Countdown from '../components/shared/Countdown';
import { getFoodImage, getDonorInfo } from '../utils/foodDisplayHelpers';

const STATUS_TABS = [
  { id: 'all', label: 'All Claims', icon: '📋' },
  { id: 'pending', label: 'Pending Pickup', icon: '⏳' },
  { id: 'confirmed', label: 'Confirmed', icon: '🤝' },
  { id: 'collected', label: 'Collected', icon: '✅' },
  { id: 'cancelled', label: 'Cancelled', icon: '🚫' }
];

export default function ReceiverDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [collectingId, setCollectingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [ratedClaims, setRatedClaims] = useState({});

  // Query all claims for this receiver
  const { data, isLoading } = useQuery({
    queryKey: ['my-claims'],
    queryFn: () => api.get('/claims/my', { params: { limit: 100 } }).then(r => r.data),
    refetchInterval: 20_000
  });

  const allClaims = data?.claims || [];

  // Compute status counts
  const counts = useMemo(() => {
    return {
      all: allClaims.length,
      pending: allClaims.filter(c => c.status === 'pending').length,
      confirmed: allClaims.filter(c => c.status === 'confirmed').length,
      collected: allClaims.filter(c => c.status === 'collected').length,
      cancelled: allClaims.filter(c => c.status === 'cancelled').length
    };
  }, [allClaims]);

  // Filter and sort claims
  const filteredClaims = useMemo(() => {
    return allClaims
      .filter(c => {
        // Tab filter
        if (activeTab !== 'all' && c.status !== activeTab) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const foodName = (c.donation?.foodName || '').toLowerCase();
          const donorName = (c.donation?.donor?.name || '').toLowerCase();
          const city = (c.donation?.pickupAddress?.city || '').toLowerCase();
          const area = (c.donation?.pickupAddress?.area || '').toLowerCase();
          return foodName.includes(q) || donorName.includes(q) || city.includes(q) || area.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.claimedAt || a.createdAt).getTime();
        const timeB = new Date(b.claimedAt || b.createdAt).getTime();
        return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
      });
  }, [allClaims, activeTab, searchQuery, sortBy]);

  // Handle Mark Collected
  const handleMarkCollected = async (claim) => {
    setCollectingId(claim._id);
    try {
      await api.patch(`/claims/${claim._id}/receiver-collected`);
      toast.success("✅ Marked as collected! Check your notification bell 🔔");
      qc.invalidateQueries({ queryKey: ['my-claims'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking claim as collected');
    } finally {
      setCollectingId(null);
    }
  };

  // Handle Cancel Claim
  const handleCancel = async (claim) => {
    if (!window.confirm(`Cancel claim for "${claim.donation?.foodName || 'this food'}"? The food will be made available for other shelters.`)) {
      return;
    }
    setCancellingId(claim._id);
    try {
      await api.patch(`/claims/${claim._id}/cancel`);
      toast.success('Claim cancelled');
      qc.invalidateQueries({ queryKey: ['my-claims'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling claim');
    } finally {
      setCancellingId(null);
    }
  };

  // Handle Rating
  const handleRate = async (claim, score) => {
    try {
      await api.post('/ratings', { claimId: claim._id, score });
      setRatedClaims(prev => ({ ...prev, [claim._id]: score }));
      toast.success(`Thank you for rating ${score} ⭐!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit rating');
    }
  };

  return (
    <div className="page container" style={{ paddingBottom: '5rem' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--cream-border-subtle)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <div style={{
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
            border: '1px solid var(--cream-border)',
            marginBottom: '0.75rem'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--forest-olive)', display: 'inline-block' }} />
            Recipient Portal &bull; Zero Hunger Network
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--forest-dark)', lineHeight: 1.2 }}>
            Welcome back, {user?.name} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            {user?.receiverType?.replace('_', ' ').toUpperCase()} &bull; {user?.isVerified ? '✅ Verified Shelter' : '⏳ Pending Community Verification'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/browse" className="btn btn-forest" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
            🍱 Browse Available Food &rarr;
          </Link>
        </div>
      </div>

      {/* Phone verification banner */}
      {!user?.phoneVerified && (
        <div className="alert alert-warning" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.75rem'
        }}>
          <span>⚠️ <strong>Phone Not Verified:</strong> Verify your phone number to ensure smooth pickup coordination with donors.</span>
          <Link to="/verify-otp" className="btn btn-cream-outline btn-sm" style={{ textDecoration: 'none' }}>
            Verify Now via OTP &rarr;
          </Link>
        </div>
      )}

      {/* Interactive Metric Cards Row */}
      <div className="receiver-stat-grid">
        <div
          className={`receiver-metric-card ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          title="Show all claims"
        >
          <div className="icon-chip">📋</div>
          <div className="metric-num">{counts.all}</div>
          <div className="metric-lbl">All Claims</div>
        </div>

        <div
          className={`receiver-metric-card ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
          title="Filter pending claims"
        >
          <div className="icon-chip" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>⏳</div>
          <div className="metric-num">{counts.pending}</div>
          <div className="metric-lbl" style={{ color: '#B45309' }}>Pending Pickup</div>
        </div>

        <div
          className={`receiver-metric-card ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveTab('confirmed')}
          title="Filter confirmed claims"
        >
          <div className="icon-chip" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>🤝</div>
          <div className="metric-num">{counts.confirmed}</div>
          <div className="metric-lbl" style={{ color: '#0369A1' }}>Confirmed</div>
        </div>

        <div
          className={`receiver-metric-card ${activeTab === 'collected' ? 'active' : ''}`}
          onClick={() => setActiveTab('collected')}
          title="Filter collected claims"
        >
          <div className="icon-chip" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>✅</div>
          <div className="metric-num">{counts.collected}</div>
          <div className="metric-lbl" style={{ color: '#15803D' }}>Collected</div>
        </div>

        <div
          className={`receiver-metric-card ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
          title="Filter cancelled claims"
        >
          <div className="icon-chip" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>🚫</div>
          <div className="metric-num">{counts.cancelled}</div>
          <div className="metric-lbl">Cancelled</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FCFAF5',
        border: '1px solid var(--cream-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {STATUS_TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`btn-sm ${activeTab === t.id ? 'btn btn-forest' : 'btn btn-ghost'}`}
              style={{
                borderRadius: 'var(--radius-pill)',
                padding: '0.45rem 1rem',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span style={{
                fontSize: '0.75rem',
                opacity: 0.85,
                background: activeTab === t.id ? 'rgba(255,255,255,0.25)' : 'var(--cream-border)',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px'
              }}>
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flex: '1', minWidth: '240px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by food, donor, city…"
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.2rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--cream-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.85rem'
              }}
            />
            <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem'
                }}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--cream-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            <option value="newest">🕒 Newest First</option>
            <option value="oldest">⌛ Oldest First</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</p>
          <p>Loading your food claims…</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClaims.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4.5rem 1.5rem',
          backgroundColor: '#FCFAF5',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--cream-border)',
          maxWidth: 640,
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🤲</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--forest-dark)', marginBottom: '0.5rem' }}>
            {activeTab === 'all'
              ? 'No Food Claims Yet'
              : `No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Claims`}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
            {activeTab === 'all'
              ? 'Explore freshly listed surplus meals and produce from restaurants, banquets, and stores in your area.'
              : `You currently do not have any claims marked as ${activeTab}.`}
          </p>
          <Link to="/browse" className="btn btn-forest" style={{ padding: '0.8rem 2rem' }}>
            🍱 Browse Available Food &rarr;
          </Link>
        </div>
      )}

      {/* Interactive Cards Grid */}
      {!isLoading && filteredClaims.length > 0 && (
        <div className="card-grid">
          {filteredClaims.map(claim => {
            const d = claim.donation || {};
            const donorInfo = getDonorInfo(d);
            const foodImg = getFoodImage(d);
            const addressStr = [d.pickupAddress?.line1, d.pickupAddress?.area, d.pickupAddress?.city].filter(Boolean).join(', ');
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr || d.pickupAddress?.city || 'India')}`;
            const contactPhone = d.contactPhone || d.donor?.phone;

            // Determine active progress step: 1 (Claimed), 2 (Ready/Confirmed), 3 (Collected)
            const progressStep = claim.status === 'collected' ? 3
              : (claim.status === 'confirmed' || claim.donorConfirmed) ? 2
              : claim.status === 'cancelled' ? 0
              : 1;

            return (
              <div key={claim._id} className="interactive-claim-card">
                
                {/* Card Image Header */}
                <div style={{ position: 'relative', height: '190px', overflow: 'hidden', backgroundColor: 'var(--cream-surface)' }}>
                  <img
                    src={foodImg}
                    alt={d.foodName || 'Food donation'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />

                  {/* Status Badge Over Image */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                    <span className={`badge-status ${claim.status}`}>
                      <span className="status-pulse-dot" />
                      {claim.status === 'pending' ? 'Pending Pickup'
                        : claim.status === 'confirmed' ? 'Confirmed by Donor'
                        : claim.status === 'collected' ? 'Collected'
                        : 'Cancelled'}
                    </span>
                  </div>

                  {/* Category Pill Over Image */}
                  {d.category && (
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 2 }}>
                      <span style={{
                        backgroundColor: 'rgba(26, 58, 43, 0.85)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-pill)'
                      }}>
                        {d.category.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: '1', gap: '0.85rem' }}>
                  
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--forest-dark)',
                      marginBottom: '0.3rem',
                      lineHeight: 1.3
                    }}>
                      {d.foodName || 'Surplus Food Donation'}
                    </h3>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--forest-olive)' }}>
                      {d.quantity} {d.quantityUnit} &bull; {donorInfo.name}
                    </div>
                  </div>

                  {/* 3-Step Lifecycle Progress Tracker */}
                  {claim.status !== 'cancelled' ? (
                    <div className="claim-progress-track">
                      <div className={`claim-step-item ${progressStep >= 1 ? 'done' : ''}`}>
                        <div className="claim-step-dot">{progressStep > 1 ? '✓' : '1'}</div>
                        <span>Claimed</span>
                      </div>
                      <div style={{ flex: 1, height: '2px', background: progressStep >= 2 ? 'var(--forest-dark)' : 'var(--cream-border)', margin: '0 0.4rem' }} />
                      <div className={`claim-step-item ${progressStep >= 2 ? (progressStep === 2 ? 'active' : 'done') : ''}`}>
                        <div className="claim-step-dot">{progressStep > 2 ? '✓' : '2'}</div>
                        <span>Ready</span>
                      </div>
                      <div style={{ flex: 1, height: '2px', background: progressStep >= 3 ? 'var(--forest-dark)' : 'var(--cream-border)', margin: '0 0.4rem' }} />
                      <div className={`claim-step-item ${progressStep >= 3 ? 'done' : ''}`}>
                        <div className="claim-step-dot">{progressStep >= 3 ? '✓' : '3'}</div>
                        <span>Collected</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}>
                      🚫 Claim Cancelled
                    </div>
                  )}

                  {/* Countdown for active claims */}
                  {d.expiresAt && ['pending', 'confirmed'].includes(claim.status) && (
                    <div style={{ marginBottom: '0.2rem' }}>
                      <Countdown expiresAt={d.expiresAt} />
                    </div>
                  )}

                  {/* Pickup & Contact Details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--cream-surface)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--cream-border-subtle)'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1rem' }}>📍</span>
                      <div>
                        <strong>Pickup:</strong> {addressStr || 'Address provided by donor'}
                        <div>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--forest-olive)', textDecoration: 'underline' }}
                          >
                            Open in Google Maps &rarr;
                          </a>
                        </div>
                      </div>
                    </div>

                    {contactPhone && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '1rem' }}>📞</span>
                        <div>
                          <strong>Phone:</strong>{' '}
                          <a href={`tel:${contactPhone}`} style={{ color: 'var(--forest-dark)', fontWeight: 700, textDecoration: 'underline' }}>
                            {contactPhone}
                          </a>
                        </div>
                      </div>
                    )}

                    {d.storageInstructions && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--forest-moss)', marginTop: '0.2rem' }}>
                        🌡️ <em>{d.storageInstructions}</em>
                      </div>
                    )}
                  </div>

                  {/* Timestamp details */}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Claimed on: {new Date(claim.claimedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    {claim.collectedAt && (
                      <div>Collected on: {new Date(claim.collectedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--cream-border-subtle)' }}>
                    
                    {/* Active: Pending or Confirmed */}
                    {['pending', 'confirmed'].includes(claim.status) && (
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-forest btn-sm"
                          style={{ flex: 2, padding: '0.65rem 1rem', fontWeight: 700 }}
                          disabled={collectingId === claim._id}
                          onClick={() => handleMarkCollected(claim)}
                        >
                          {collectingId === claim._id ? 'Saving…' : '✅ I’ve Collected'}
                        </button>

                        <button
                          type="button"
                          className="btn btn-cream-outline btn-sm"
                          style={{ flex: 1, padding: '0.65rem 0.8rem' }}
                          disabled={cancellingId === claim._id}
                          onClick={() => handleCancel(claim)}
                        >
                          {cancellingId === claim._id ? '…' : 'Cancel'}
                        </button>
                      </div>
                    )}

                    {/* Completed: Collected */}
                    {claim.status === 'collected' && (
                      <div style={{
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: '0.4rem' }}>
                          🎉 Food Collection Complete!
                        </div>

                        {/* Interactive Rating */}
                        {ratedClaims[claim._id] ? (
                          <div style={{ fontSize: '0.82rem', color: 'var(--forest-olive)', fontWeight: 600 }}>
                            You rated: {'⭐'.repeat(ratedClaims[claim._id])} ({ratedClaims[claim._id]}/5)
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                              Rate donor experience:
                            </span>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleRate(claim, star)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    transition: 'transform 0.15s'
                                  }}
                                  onMouseEnter={e => e.target.style.transform = 'scale(1.25)'}
                                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                  title={`Rate ${star} star`}
                                >
                                  ⭐
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cancelled */}
                    {claim.status === 'cancelled' && (
                      <div style={{ textAlign: 'center' }}>
                        <Link to="/browse" className="btn btn-cream-outline btn-sm btn-full" style={{ padding: '0.6rem' }}>
                          Find Replacement Food &rarr;
                        </Link>
                      </div>
                    )}

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
