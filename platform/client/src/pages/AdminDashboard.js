import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TABS = ['Overview','Users','Donations','Reports'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="page container">
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-dark)', marginBottom: '1.25rem' }}>
        🔐 Admin Panel
      </h1>
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'Overview'   && <AdminOverview />}
      {tab === 'Users'      && <AdminUsers />}
      {tab === 'Donations'  && <AdminDonations />}
      {tab === 'Reports'    && <AdminReports />}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────
function AdminOverview() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => api.get('/admin/stats').then(r => r.data),
    refetchInterval: 60_000
  });
  if (!data) return <p style={{ color: 'var(--muted)' }}>Loading…</p>;

  const { users, donations, safety } = data;
  return (
    <div>
      <h2 style={{ margin: '1.25rem 0 .75rem', fontSize: '1rem', fontWeight: 700 }}>Platform Stats</h2>
      <div className="stat-row">
        <div className="stat-box"><span className="num">{users.totalDonors}</span><span className="lbl">Donors</span></div>
        <div className="stat-box"><span className="num">{users.totalReceivers}</span><span className="lbl">Receivers</span></div>
        <div className="stat-box"><span className="num">{donations.activeDonations}</span><span className="lbl">Active Listings</span></div>
        <div className="stat-box"><span className="num">{donations.totalCollected}</span><span className="lbl">Meals Shared</span></div>
        <div className="stat-box"><span className="num">{safety.pendingReports}</span><span className="lbl" style={{ color: 'var(--red)' }}>Pending Reports</span></div>
      </div>
      <div className="stat-row">
        <div className="stat-box"><span className="num">{users.unverifiedDonors}</span><span className="lbl">Unverified Donors</span></div>
        <div className="stat-box"><span className="num">{users.unverifiedReceivers}</span><span className="lbl">Unverified Receivers</span></div>
        <div className="stat-box"><span className="num">{donations.totalExpired}</span><span className="lbl">Expired</span></div>
      </div>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────
function AdminUsers() {
  const qc = useQueryClient();
  const [role, setRole]   = useState('');
  const [verif, setVerif] = useState('');
  const [q,     setQ]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', role, verif, q],
    queryFn:  () => api.get('/admin/users', { params: { role: role || undefined, isVerified: verif || undefined, q: q || undefined, limit: 50 } }).then(r => r.data)
  });

  const handleVerify = async (userId, name) => {
    if (!window.confirm(`Verify user "${name}"?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/verify`);
      toast.success(`${name} verified`);
      qc.invalidateQueries(['admin-users']);
    } catch (err) { toast.error('Error'); }
  };

  const handleDisable = async (userId, name) => {
    if (!window.confirm(`Disable "${name}"? They will lose platform access.`)) return;
    try {
      await api.patch(`/admin/users/${userId}/disable`);
      toast.success(`${name} disabled`);
      qc.invalidateQueries(['admin-users']);
    } catch (err) { toast.error('Error'); }
  };

  const users = data?.users || [];

  return (
    <div>
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '.4rem .7rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '.85rem' }}>
          <option value="">All roles</option>
          <option value="donor">Donor</option>
          <option value="receiver">Receiver</option>
        </select>
        <select value={verif} onChange={e => setVerif(e.target.value)} style={{ padding: '.4rem .7rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '.85rem' }}>
          <option value="">All verification</option>
          <option value="false">Unverified</option>
          <option value="true">Verified</option>
        </select>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Search name…"
          style={{ padding: '.4rem .7rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '.85rem', width: 180 }} />
      </div>

      {isLoading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Email</th><th>Phone ✓</th><th>Verified</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name} {u.orgName && <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>({u.orgName})</span>}</td>
                <td><span className="badge" style={{ background: u.role === 'donor' ? 'var(--green-light)' : 'var(--blue-light)', color: 'var(--text)' }}>{u.role}</span></td>
                <td style={{ fontSize: '.82rem' }}>{u.email}</td>
                <td>{u.phoneVerified ? '✅' : '❌'}</td>
                <td>{u.isVerified  ? '✅' : <span style={{ color: 'var(--amber)' }}>Pending</span>}</td>
                <td style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '.4rem' }}>
                    {!u.isVerified && (
                      <button className="btn btn-green btn-sm" onClick={() => handleVerify(u._id, u.name)}>Verify</button>
                    )}
                    <button className="btn btn-red btn-sm" onClick={() => handleDisable(u._id, u.name)}>Disable</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Donations ─────────────────────────────────────────────────────
function AdminDonations() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-donations', status],
    queryFn:  () => api.get('/admin/donations', { params: { status: status || undefined, limit: 50 } }).then(r => r.data)
  });

  const handleRemove = async (id, name) => {
    const reason = window.prompt(`Reason for removing "${name}"?`);
    if (!reason) return;
    try {
      await api.patch(`/admin/donations/${id}/remove`, { reason });
      toast.success('Donation removed');
      qc.invalidateQueries(['admin-donations']);
    } catch (err) { toast.error('Error'); }
  };

  const donations = data?.donations || [];

  return (
    <div>
      <div style={{ margin: '1rem 0' }}>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '.4rem .7rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '.85rem' }}>
          <option value="">All statuses</option>
          {['available','claimed','collected','expired','removed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {isLoading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr><th>Food</th><th>Donor</th><th>City</th><th>Status</th><th>Expires</th><th>Reports</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {donations.map(d => (
              <tr key={d._id}>
                <td>{d.foodName}</td>
                <td style={{ fontSize: '.82rem' }}>{d.donor?.name}</td>
                <td style={{ fontSize: '.82rem' }}>{d.pickupAddress?.city}</td>
                <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                <td style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{new Date(d.expiresAt).toLocaleString('en-IN')}</td>
                <td style={{ color: d.reportCount > 0 ? 'var(--red)' : 'inherit', fontWeight: d.reportCount > 0 ? 700 : 400 }}>{d.reportCount}</td>
                <td>
                  {d.status !== 'removed' && (
                    <button className="btn btn-red btn-sm" onClick={() => handleRemove(d._id, d.foodName)}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────
function AdminReports() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn:  () => api.get('/admin/reports').then(r => r.data),
    refetchInterval: 60_000
  });

  const handleRemove = async (id, name) => {
    try {
      await api.patch(`/admin/donations/${id}/remove`, { reason: 'Removed after safety report' });
      toast.success('Donation removed');
      qc.invalidateQueries(['admin-reports']);
    } catch (err) { toast.error('Error'); }
  };

  const reported = data?.reported || [];

  return (
    <div>
      {isLoading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {!isLoading && reported.length === 0 && (
        <div className="alert alert-success">No safety reports to review ✅</div>
      )}
      {reported.map(d => (
        <div key={d._id} className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
            <strong>{d.foodName}</strong>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>{d.reportCount} report(s)</span>
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '.5rem' }}>
            Donor: {d.donor?.name} · {d.donor?.email} · City: {d.pickupAddress?.city}
          </div>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '.82rem', marginBottom: '.75rem' }}>
            {d.reports.map((r, i) => (
              <li key={i} style={{ color: 'var(--red)', marginBottom: '.2rem' }}>
                "{r.reason}" — {new Date(r.reportedAt).toLocaleString('en-IN')}
              </li>
            ))}
          </ul>
          <button className="btn btn-red btn-sm" onClick={() => handleRemove(d._id, d.foodName)}>
            Remove Listing
          </button>
        </div>
      ))}
    </div>
  );
}
