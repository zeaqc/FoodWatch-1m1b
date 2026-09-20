import React from 'react';
import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div style={{ fontSize: '4rem' }}>🍴</div>
      <h1 style={{ fontSize: '2rem', color: 'var(--green-dark)', margin: '1rem 0 .5rem' }}>Page Not Found</h1>
      <p style={{ color: 'var(--muted)' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-green" style={{ marginTop: '1.5rem', display: 'inline-block' }}>← Back to Home</Link>
    </div>
  );
}
