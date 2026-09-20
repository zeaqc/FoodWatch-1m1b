import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import Countdown from '../components/shared/Countdown';
import { useAuth } from '../context/AuthContext';
import { getFoodImage, getDonorInfo } from '../utils/foodDisplayHelpers';

export default function DonationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [imgSrc, setImgSrc] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['donation', id],
    queryFn:  () => api.get(`/donations/${id}`).then(r => r.data),
    refetchInterval: 30_000
  });

  if (isLoading) return <div className="loading-screen" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading food details…</div>;
  if (error)     return <div className="page container"><div className="alert alert-error">Donation not found.</div></div>;

  const d = data.donation;
  const donorInfo = getDonorInfo(d);
  const currentImg = imgSrc || getFoodImage(d);

  return (
    <div className="page container" style={{ maxWidth: 760, paddingBottom: '4rem' }}>
      <Link to="/browse" className="btn btn-cream-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        &larr; Back to Available Donations
      </Link>

      <div style={{
        backgroundColor: '#FCFAF5',
        border: '1px solid var(--cream-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-subtle)',
        padding: '2rem'
      }}>

        <div style={{
          width: '100%',
          height: '320px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--cream-surface)'
        }}>
          <img
            src={currentImg}
            alt={d.foodName}
            onError={() => setImgSrc(getFoodImage({ category: d.category }))}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.75rem' }}>
          {d.foodName}
        </h1>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <span className={`badge badge-${d.status}`}>{d.status}</span>
          {(d.sdgTags || []).map(tag => <span key={tag} className="badge-editorial">{tag}</span>)}
        </div>

        <Countdown expiresAt={d.expiresAt} />

        <div style={{
          marginTop: '1.75rem',
          borderTop: '1px solid var(--cream-border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem'
        }}>
          <Row label="Donated By"    value={`${donorInfo.name} (${donorInfo.type} • ${donorInfo.badge})`} />
          <Row label="Category"      value={d.category?.replace('_', ' ').toUpperCase()} />
          <Row label="Quantity"      value={`${d.quantity} ${d.quantityUnit}`} />
          <Row label="Prepared at"   value={new Date(d.preparedAt).toLocaleString('en-IN')} />
          <Row label="Expires at"    value={new Date(d.expiresAt).toLocaleString('en-IN')} />
          <Row label="Pickup window" value={`${new Date(d.pickupWindowStart).toLocaleString('en-IN')} → ${new Date(d.pickupWindowEnd).toLocaleString('en-IN')}`} />
          <Row label="Pickup address" value={[d.pickupAddress?.line1, d.pickupAddress?.area, d.pickupAddress?.city, d.pickupAddress?.state].filter(Boolean).join(', ')} />
          <Row label="Contact Phone" value={d.contactPhone} />
          {d.ingredients        && <Row label="Ingredients"         value={d.ingredients} />}
          {d.allergens?.length > 0 && <Row label="⚠️ Allergens"   value={d.allergens.join(', ')} />}
          {d.storageInstructions && <Row label="Storage"            value={d.storageInstructions} />}
          {d.description         && <Row label="Notes"              value={d.description} />}
        </div>

        {user?.role === 'receiver' && d.status === 'available' && (
          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--cream-border-subtle)', paddingTop: '1.5rem' }}>
            <Link to="/browse" className="btn btn-forest" style={{ padding: '0.8rem 2rem' }}>
              Claim Food on Browse Page &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: '1rem', fontSize: '.9rem' }}>
      <span style={{ color: 'var(--muted)', minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
