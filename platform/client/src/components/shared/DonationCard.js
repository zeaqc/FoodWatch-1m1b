import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Countdown from './Countdown';
import { getFoodImage, getDonorInfo } from '../../utils/foodDisplayHelpers';

const CATEGORY_EMOJI = {
  veg: '🥦', non_veg: '🍗', vegan: '🌱', packaged: '📦',
  cooked: '🍛', raw_produce: '🥕', dairy: '🥛', bakery: '🥐', other: '🍴'
};

export default function DonationCard({ donation, onClaim, showClaimBtn = false, showDonorActions = false, onRemove }) {
  const cat = donation.category;
  const emoji = CATEGORY_EMOJI[cat] || '🍴';
  const statusCls = `badge badge-${donation.status}`;
  const donorInfo = getDonorInfo(donation);
  const [imgSrc, setImgSrc] = useState(getFoodImage(donation));

  return (
    <div className="donation-card">
      {/* Food Image Container with Overlays */}
      <div style={{ position: 'relative', width: '100%', height: '210px', overflow: 'hidden', backgroundColor: 'var(--cream-surface)' }}>
        <img
          src={imgSrc}
          alt={donation.foodName}
          className="card-img"
          onError={() => setImgSrc(getFoodImage({ category: cat }))}
          loading="lazy"
        />
        
        {/* Category Pill Tag */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(26, 58, 43, 0.88)',
          color: 'var(--cream-bg)',
          backdropFilter: 'blur(8px)',
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
        }}>
          <span>{emoji}</span> {cat.replace('_', ' ')}
        </div>

        {/* Status Pill */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: donation.status === 'available' ? 'rgba(74, 107, 83, 0.92)' : 'rgba(103, 126, 113, 0.92)',
          color: '#ffffff',
          backdropFilter: 'blur(8px)',
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
        }}>
          {donation.status}
        </div>
      </div>

      <div className="card-body">
        
        {/* Title */}
        <h3 className="card-title" title={donation.foodName}>
          {donation.foodName}
        </h3>

        {/* Mock Donor Information */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--forest-tint)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--cream-border-subtle)',
          margin: '0.2rem 0 0.5rem'
        }}>
          <span style={{ fontSize: '1rem' }}>👨‍🍳</span>
          <div style={{ overflow: 'hidden', lineHeight: 1.25 }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--forest-dark)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {donorInfo.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--forest-olive)', fontWeight: 600 }}>
              {donorInfo.type} &bull; <span style={{ color: 'var(--forest-dark)' }}>{donorInfo.badge}</span>
            </div>
          </div>
        </div>

        {/* Location & Quantity Meta */}
        <div className="card-meta">
          <span style={{ fontWeight: 700, color: 'var(--forest-dark)' }}>
            ⚖️ {donation.quantity} {donation.quantityUnit}
          </span>
          <span>&bull;</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            📍 {donation.pickupAddress?.area ? `${donation.pickupAddress.area}, ${donation.pickupAddress.city}` : (donation.pickupAddress?.city || 'Local Kitchen')}
          </span>
        </div>

        {donation.allergens?.length > 0 && (
          <div style={{ fontSize: '0.78rem', color: '#994433', fontWeight: 600, display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            <span>⚠️</span> Allergens: {donation.allergens.join(', ')}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <Countdown expiresAt={donation.expiresAt} />
        </div>

        {donation.sdgTags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
            {donation.sdgTags.map(tag => (
              <span key={tag} className="badge-editorial" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

      </div>

      <div className="card-footer">
        <Link
          to={`/donations/${donation._id}`}
          className="btn btn-cream-outline btn-sm"
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          View Details &rarr;
        </Link>

        {showClaimBtn && donation.status === 'available' && (
          <button
            className="btn btn-forest btn-sm"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
            onClick={() => onClaim && onClaim(donation)}
          >
            Claim Food
          </button>
        )}

        {showDonorActions && donation.status === 'available' && (
          <button
            className="btn btn-cream-outline btn-sm"
            style={{ color: '#882222', borderColor: '#dca6a6' }}
            onClick={() => onRemove && onRemove(donation)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

