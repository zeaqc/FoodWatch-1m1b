import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/shared/DonationCard';
import toast from 'react-hot-toast';
import { getFoodImage, getDonorInfo, getDonationCoordinates } from '../utils/foodDisplayHelpers';

const CATEGORIES = ['all','veg','non_veg','vegan','packaged','cooked','raw_produce','dairy','bakery','other'];
const PAGE_SIZE  = 16;

// Custom animated Leaflet Map Pin
const customPinIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div class="pin-marker">
      <span class="pin-pulse"></span>
      <span class="pin-dot"></span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18]
});

// Helper component to handle smooth flyTo and size invalidation in Leaflet
function MapController({ targetCoords }) {
  const map = useMap();

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 14, { duration: 1.2 });
    }
  }, [targetCoords, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function BrowsePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [view, setView]               = useState('grid');  // 'grid' | 'map'
  const [gridColumns, setGridColumns] = useState('standard'); // 'standard' (3 cols) | 'wide' (4-5 cols)
  const [category, setCategory]       = useState('');
  const [city, setCity]               = useState('');
  const [area, setArea]               = useState('');
  const [page, setPage]               = useState(1);
  const [claiming, setClaiming]       = useState(null);
  const [focusedCoords, setFocusedCoords] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['donations', category, city, area, page],
    queryFn: () => api.get('/donations', {
      params: { status: 'available', category: category || undefined, city: city || undefined, area: area || undefined, page, limit: PAGE_SIZE }
    }).then(r => r.data),
    refetchInterval: 30_000
  });

  const donations = data?.donations || [];
  const totalPages = data?.pages || 1;

  // Auto-center map on first donation with valid coordinates if not manually focused
  useEffect(() => {
    if (donations.length > 0 && !focusedCoords) {
      const firstCoords = getDonationCoordinates(donations[0]);
      setFocusedCoords(firstCoords);
    }
  }, [donations, focusedCoords]);

  const handleClaim = async (donation) => {
    if (!user) { toast.error('Sign in to claim'); return; }
    if (user.role !== 'receiver') { toast.error('Only receivers can claim food'); return; }
    if (!user.phoneVerified) {
      toast.error('Please verify your phone via OTP to claim food');
      navigate('/verify-otp');
      return;
    }
    if (!window.confirm(`Claim "${donation.foodName}"? This is first-come, first-served.`)) return;

    setClaiming(donation._id);
    try {
      await api.post(`/claims/${donation._id}`);
      toast.success('✅ Donation claimed! Check your dashboard for pickup details.');
      qc.invalidateQueries({ queryKey: ['donations'] });
      qc.invalidateQueries({ queryKey: ['my-claims'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Claim failed');
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="page container" style={{ paddingBottom: '5rem' }}>
      
      {/* Editorial Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1.5rem',
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
            SDG 2 Zero Hunger &bull; Verified Surplus Network
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--forest-dark)', lineHeight: 1.15 }}>
            Available Food Donations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            {isLoading ? 'Scanning active kitchen listings…' : `${data?.total || 0} active food donations ready for immediate rescue`}
            {isFetching && !isLoading && ' &bull; Updating live radar…'}
          </p>
        </div>

        {user?.role === 'donor' && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="/donor?action=donate"
              className="btn btn-forest"
              style={{ fontSize: '0.88rem', padding: '0.7rem 1.5rem', textDecoration: 'none' }}
            >
              + List a Food Donation
            </a>
          </div>
        )}
      </div>

      {/* Control Bar: Filters & View Switcher */}
      <div style={{
        backgroundColor: '#FCFAF5',
        border: '1px solid var(--cream-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '2.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.25rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        
        {/* Left: Category & Location Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <div style={{ minWidth: 160 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--forest-dark)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Category
            </label>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value === 'all' ? '' : e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--cream-border)',
                backgroundColor: '#ffffff',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem'
              }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c === 'all' ? '' : c}>
                  {c === 'all' ? 'All Categories' : c.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--forest-dark)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={e => { setCity(e.target.value); setPage(1); }}
              placeholder="Delhi, Mumbai…"
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--cream-border)',
                backgroundColor: '#ffffff',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--forest-dark)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Area / Locality
            </label>
            <input
              type="text"
              value={area}
              onChange={e => { setArea(e.target.value); setPage(1); }}
              placeholder="Koramangala, Juhu…"
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--cream-border)',
                backgroundColor: '#ffffff',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem'
              }}
            />
          </div>

        </div>

        {/* Right: View Toggle (Grid vs Map) & Grid Density */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          
          {view === 'grid' && (
            <div style={{ display: 'flex', gap: '0.35rem', borderRight: '1px solid var(--cream-border-subtle)', paddingRight: '0.75rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${gridColumns === 'standard' ? 'btn-forest' : 'btn-cream-outline'}`}
                onClick={() => setGridColumns('standard')}
                title="Standard 3-Column Grid"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                3 Cols
              </button>
              <button
                type="button"
                className={`btn btn-sm ${gridColumns === 'wide' ? 'btn-forest' : 'btn-cream-outline'}`}
                onClick={() => setGridColumns('wide')}
                title="Expanded Wide Grid (4-5 columns)"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                Expanded Grid
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              id="btn-view-grid"
              className={`btn btn-sm ${view === 'grid' ? 'btn-forest' : 'btn-cream-outline'}`}
              onClick={() => setView('grid')}
              style={{
                fontSize: '0.88rem',
                padding: '0.55rem 1.25rem',
                fontWeight: 700
              }}
            >
              ⊞ Grid View
            </button>
            
            <button
              type="button"
              id="btn-view-map"
              className={`btn btn-sm ${view === 'map' ? 'btn-forest' : 'btn-cream-outline'}`}
              onClick={() => setView('map')}
              style={{
                fontSize: '0.88rem',
                padding: '0.55rem 1.25rem',
                fontWeight: 700
              }}
            >
              🗺️ Map View
            </button>
          </div>

        </div>

      </div>

      {/* ── VIEW A: INTERACTIVE MAP VIEW ───────────────────────────── */}
      {view === 'map' && (
        <div>
          <div className="map-wrap">
            <MapContainer
              center={focusedCoords || [20.5937, 78.9629]}
              zoom={focusedCoords ? 12 : 5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <MapController targetCoords={focusedCoords} />
              
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; FoodWatch'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {donations.map(d => {
                const coords = getDonationCoordinates(d);
                const donorInfo = getDonorInfo(d);
                const foodImg = getFoodImage(d);

                return (
                  <Marker
                    key={d._id}
                    position={coords}
                    icon={customPinIcon}
                  >
                    <Popup>
                      <div style={{ width: 250, overflow: 'hidden', borderRadius: '10px' }}>
                        <img
                          src={foodImg}
                          alt={d.foodName}
                          style={{ width: '100%', height: 115, objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ padding: '0.85rem' }}>
                          <div style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: 'var(--forest-olive)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.2rem'
                          }}>
                            {d.category.replace('_', ' ')} &bull; {d.quantity} {d.quantityUnit}
                          </div>

                          <div style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: 'var(--forest-dark)',
                            marginBottom: '0.35rem',
                            lineHeight: 1.2
                          }}>
                            {d.foodName}
                          </div>

                          <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--forest-dark)',
                            fontWeight: 600,
                            marginBottom: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <span>👨‍🍳</span> {donorInfo.name}
                          </div>

                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.75rem'
                          }}>
                            📍 {d.pickupAddress?.area ? `${d.pickupAddress.area}, ${d.pickupAddress.city}` : d.pickupAddress?.city}
                          </div>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <a
                              href={`/donations/${d._id}`}
                              className="btn btn-cream-outline btn-sm"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', flex: 1, textAlign: 'center' }}
                            >
                              Details
                            </a>

                            {user?.role === 'receiver' && d.status === 'available' && (
                              <button
                                onClick={() => handleClaim(d)}
                                className="btn btn-forest btn-sm"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', flex: 1 }}
                              >
                                Claim
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Map Location Carousel / Fast-Jump Cards */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--forest-dark)',
              marginBottom: '1rem'
            }}>
              Active Locations On Radar (Click to Zoom)
            </h3>

            <div style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '1rem',
              scrollSnapType: 'x mandatory'
            }}>
              {donations.map(d => {
                const coords = getDonationCoordinates(d);
                const donorInfo = getDonorInfo(d);
                const foodImg = getFoodImage(d);

                return (
                  <div
                    key={d._id}
                    onClick={() => setFocusedCoords(coords)}
                    style={{
                      minWidth: 260,
                      maxWidth: 260,
                      backgroundColor: '#FCFAF5',
                      border: '1px solid var(--cream-border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      scrollSnapAlign: 'start',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--forest-olive)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-border)'}
                  >
                    <img
                      src={foodImg}
                      alt={d.foodName}
                      style={{ width: '100%', height: 110, objectFit: 'cover' }}
                    />
                    <div style={{ padding: '0.85rem' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--forest-olive)', textTransform: 'uppercase' }}>
                        {d.pickupAddress?.city || 'Local Hub'} &bull; {d.quantity} {d.quantityUnit}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.98rem',
                        fontWeight: 700,
                        color: 'var(--forest-dark)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '0.2rem'
                      }}>
                        {d.foodName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        👨‍🍳 {donorInfo.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW B: EXPANDED GRID VIEW ─────────────────────────────── */}
      {view === 'grid' && (
        <div>
          {isLoading && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem 0', fontSize: '1.1rem' }}>
              Loading fresh food donations…
            </p>
          )}

          {!isLoading && donations.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: '#FCFAF5',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--cream-border)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍱</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--forest-dark)', marginBottom: '0.5rem' }}>
                No active food donations found
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 1.5rem' }}>
                No donations match your current filters. Try changing category, area, or clearing search filters.
              </p>
              {user?.role === 'donor' && (
                <a href="/donor?action=donate" className="btn btn-forest" style={{ textDecoration: 'none' }}>
                  + List a Food Donation
                </a>
              )}
            </div>
          )}

          <div className={gridColumns === 'wide' ? 'card-grid card-grid-wide' : 'card-grid'}>
            {donations.map(d => (
              <div key={d._id} style={{ opacity: claiming === d._id ? 0.6 : 1 }}>
                <DonationCard
                  donation={d}
                  showClaimBtn={user?.role === 'receiver'}
                  onClaim={handleClaim}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2.5rem' }}>
              <button
                className="btn btn-cream-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                &larr; Previous
              </button>

              <span style={{ alignSelf: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, padding: '0 0.5rem' }}>
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-cream-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

