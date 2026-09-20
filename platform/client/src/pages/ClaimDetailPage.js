import React from 'react';
export default function ClaimDetailPage() {
  // Receivers see full claim detail + donor contact here
  // Full implementation delegates to ReceiverDashboard claim cards
  return (
    <div className="page container" style={{ maxWidth: 600 }}>
      <h1 style={{ color: 'var(--green-dark)', marginBottom: '1rem' }}>Claim Details</h1>
      <p style={{ color: 'var(--muted)' }}>
        Please visit your <a href="/receiver">Receiver Dashboard</a> to view and manage all your claims with full pickup details.
      </p>
    </div>
  );
}
