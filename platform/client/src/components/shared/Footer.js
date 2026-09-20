import React from 'react';
import { Link } from 'react-router-dom';

const SDG_COLORS = {
  SDG1:'#e5243b', SDG2:'#dda63a', SDG3:'#4c9f38',
  SDG11:'#fd9d24', SDG12:'#bf8b2e', SDG17:'#19486a'
};
const SDG_NAMES = {
  SDG1:'No Poverty', SDG2:'Zero Hunger', SDG3:'Good Health',
  SDG11:'Sustainable Cities', SDG12:'Responsible Consumption', SDG17:'Partnerships'
};

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--cream-surface)',
      borderTop: '1px solid var(--cream-border)',
      color: 'var(--text-secondary)',
      padding: '3.5rem 2rem 2.5rem',
      marginTop: '4rem'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{
              color: 'var(--forest-dark)',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              fontWeight: 800,
              marginBottom: '.75rem',
              letterSpacing: '-0.02em'
            }}>
              🌾 FoodWatch
            </h3>
            <p style={{ fontSize: '.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              A food donation platform aligned with the UN Sustainable Development Goals. Connecting surplus food with verified community shelters and people in need.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--forest-dark)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
              <li>
                <Link to="/browse" style={{ color: 'var(--text-secondary)', fontSize: '.88rem', fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = 'var(--forest-dark)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  Browse Donations
                </Link>
              </li>
              <li>
                <Link to="/impact" style={{ color: 'var(--text-secondary)', fontSize: '.88rem', fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = 'var(--forest-dark)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link to="/register?role=donor" style={{ color: 'var(--text-secondary)', fontSize: '.88rem', fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = 'var(--forest-dark)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  Donate Surplus Food
                </Link>
              </li>
              <li>
                <Link to="/privacy" style={{ color: 'var(--text-secondary)', fontSize: '.88rem', fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = 'var(--forest-dark)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  Privacy & Data Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--forest-dark)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
              SDG Alignment
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
              {Object.entries(SDG_NAMES).map(([tag, name]) => (
                <span
                  key={tag}
                  style={{
                    background: '#FFFFFF',
                    color: 'var(--forest-dark)',
                    border: '1px solid var(--cream-border)',
                    padding: '.25rem .65rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '.75rem',
                    fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(26, 58, 43, 0.04)'
                  }}
                >
                  {tag}: {name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid var(--cream-border)',
          paddingTop: '1.5rem',
          fontSize: '.82rem',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <p>© 2024 FoodWatch Initiative · Data: ICAR, FAO, MoFPI, NITI Aayog · Built with IBM Bob AI</p>
          <p style={{ marginTop: '.4rem', opacity: '.85', fontSize: '0.78rem' }}>
            FSSAI compliant · India DPDP Act 2023 compliant · Not liable for food quality post-collection
          </p>
        </div>
      </div>
    </footer>
  );
}
