import React, { useState, useEffect } from 'react';
import { Routes, Route, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/shared/DonationCard';
import DonationForm from '../components/donor/DonationForm';
import toast from 'react-hot-toast';

const STATUSES = ['all','available','claimed','collected','expired'];

export default function DonorDashboard() {
  return (
    <Routes>
      <Route index element={<DonorHome />} />
    </Routes>
  );
}

function DonorHome() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewScope, setViewScope] = useState('my'); // 'my' | 'all'
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-open donation form if redirected from registration (e.g. ?action=donate)
  useEffect(() => {
    if (searchParams.get('action') === 'donate' || searchParams.get('add') === 'true') {
      if (!user?.phoneVerified) {
        toast.error('Please verify your phone number via OTP first');
        navigate('/verify-otp?next=donate', { replace: true });
        return;
      }
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, user?.phoneVerified, navigate]);

  const statusFilter = activeTab === 'all' ? undefined : activeTab;

  const { data: myData, isLoading: isMyLoading } = useQuery({
    queryKey: ['my-donations', statusFilter],
    queryFn:  () => api.get('/donations/my', { params: { status: statusFilter, limit: 50 } }).then(r => r.data),
    refetchInterval: 30_000
  });

  const { data: allData, isLoading: isAllLoading } = useQuery({
    queryKey: ['all-donations', statusFilter],
    queryFn:  () => api.get('/donations', { params: { status: statusFilter, limit: 50 } }).then(r => r.data),
    refetchInterval: 30_000
  });

  const myDonations = myData?.donations || [];
  const allDonations = allData?.donations || [];
  const donations = viewScope === 'my' ? myDonations : allDonations;
  const isLoading = viewScope === 'my' ? isMyLoading : isAllLoading;

  const handleRemove = async (d) => {
    if (!window.confirm(`Remove "${d.foodName}"?`)) return;
    try {
      await api.delete(`/donations/${d._id}`, { data: { reason: 'Removed by donor' } });
      toast.success('Donation removed');
      qc.invalidateQueries({ queryKey: ['my-donations'] });
      qc.invalidateQueries({ queryKey: ['all-donations'] });
      qc.invalidateQueries({ queryKey: ['donations'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const stats = {
    available: myDonations.filter(d => d.status === 'available').length,
    claimed:   myDonations.filter(d => d.status === 'claimed').length,
    collected: myDonations.filter(d => d.status === 'collected').length,
    expired:   myDonations.filter(d => d.status === 'expired').length,
  };

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-dark)' }}>
            Welcome, {user?.name} 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>
            {user?.orgName || user?.donorType} · {user?.isVerified ? '✅ Verified' : '⏳ Pending verification'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-green" onClick={() => {
            if (!user?.phoneVerified) {
              toast.error('Please verify your phone number via OTP before listing donations');
              navigate('/verify-otp?next=donate');
              return;
            }
            setShowForm(true);
          }}>
            + Add Donation
          </button>
        </div>
      </div>

      {!user?.phoneVerified && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>⚠️ <strong>Donor Phone Verification:</strong> Verify your phone number via OTP to list and manage food donations.</span>
          <Link to="/verify-otp?next=donate" className="btn btn-cream-outline btn-sm" style={{ textDecoration: 'none' }}>
            Verify Phone via OTP &rarr;
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="stat-row">
        <div className="stat-box">
          <span className="num">{stats.available}</span>
          <span className="lbl">Active</span>
        </div>
        <div className="stat-box">
          <span className="num">{stats.claimed}</span>
          <span className="lbl">Claimed</span>
        </div>
        <div className="stat-box">
          <span className="num">{stats.collected}</span>
          <span className="lbl">Completed</span>
        </div>
        <div className="stat-box">
          <span className="num">{stats.expired}</span>
          <span className="lbl">Expired</span>
        </div>
        <div className="stat-box">
          <span className="num">{user?.totalDonated || 0}</span>
          <span className="lbl">Total Donated</span>
        </div>
      </div>

      {/* View Scope Toggle: My Donations vs All Donated Items */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '1.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--cream-border)',
        paddingBottom: '0.75rem'
      }}>
        <div style={{ display: 'inline-flex', background: 'var(--cream-surface)', borderRadius: 'var(--radius-pill)', padding: '0.25rem', border: '1px solid var(--cream-border)' }}>
          <button
            type="button"
            className={`btn-sm ${viewScope === 'my' ? 'btn btn-forest' : 'btn btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-pill)', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setViewScope('my')}
          >
            📦 My Donations ({myDonations.length})
          </button>
          <button
            type="button"
            className={`btn-sm ${viewScope === 'all' ? 'btn btn-forest' : 'btn btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-pill)', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setViewScope('all')}
          >
            🌐 All Donated Items ({allDonations.length})
          </button>
        </div>

        {/* Status Tabs */}
        <div className="tabs" style={{ margin: 0 }}>
          {STATUSES.map(s => (
            <button key={s} className={`tab-btn ${activeTab === s ? 'active' : ''}`}
              onClick={() => setActiveTab(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p style={{ color: 'var(--muted)' }}>Loading donations…</p>}

      {!isLoading && donations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '3rem' }}>🍴</p>
          <p>
            {viewScope === 'my'
              ? <span>You haven't listed any donations in this category yet. Click <strong>+ Add Donation</strong> to start.</span>
              : <span>No donations found in this category.</span>}
          </p>
        </div>
      )}

      <div className="card-grid">
        {donations.map(d => {
          const isOwn = d.donor?._id === user?._id || d.donor === user?._id || viewScope === 'my';
          return (
            <DonationCard
              key={d._id}
              donation={d}
              showDonorActions={isOwn}
              onRemove={handleRemove}
            />
          );
        })}
      </div>

      {showForm && (
        <DonationForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ['my-donations'] });
            qc.invalidateQueries({ queryKey: ['all-donations'] });
            qc.invalidateQueries({ queryKey: ['donations'] });
          }}
        />
      )}
    </div>
  );
}
