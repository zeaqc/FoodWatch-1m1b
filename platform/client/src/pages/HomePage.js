import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const WASTE_BREAKDOWN = [
  { label: 'Banquets, Weddings & Commercial Events', percentage: 28, metric: '19.2M tonnes / yr' },
  { label: 'Post-Harvest Cold Storage & Transit Breakdown', percentage: 22, metric: '15.1M tonnes / yr' },
  { label: 'Wholesale Mandis & Regional Agricultural Hubs', percentage: 18, metric: '12.4M tonnes / yr' },
  { label: 'Urban Retail Markets & Supermarket Discards', percentage: 16, metric: '11.0M tonnes / yr' },
  { label: 'Consumer & Residential Over-Procurement', percentage: 16, metric: '11.0M tonnes / yr' }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [calculatorKg, setCalculatorKg] = useState(75);
  const [scrollProgress, setScrollProgress] = useState(0);
  const problemRef = useRef(null);
  const solutionRef = useRef(null);

  // Live platform statistics
  const { data: impact } = useQuery({
    queryKey: ['impact'],
    queryFn: () => api.get('/impact').then(r => r.data),
    refetchInterval: 60_000
  });

  // Calculate leverage metrics
  const mealsRescued = Math.round(calculatorKg * 2.5);
  const waterSavedLitres = Math.round(calculatorKg * 1050).toLocaleString('en-IN');
  const co2PreventedKg = (calculatorKg * 2.5).toFixed(1);
  const economicValue = (calculatorKg * 140).toLocaleString('en-IN');

  // Scroll transition tracker for smooth 3D depth shift
  useEffect(() => {
    const handleScroll = () => {
      if (!problemRef.current) return;
      const rect = problemRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(Math.max((windowHeight - rect.top) / (rect.height + windowHeight), 0), 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--cream-bg)', color: 'var(--text-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ── 1. INTRO HERO (THE WELCOME) ────────────────────────────── */}
      <header style={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--nav-h))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '5rem 1.5rem 6rem',
        overflow: 'hidden'
      }}>
        {/* Atmospheric Background Image with Heavy Frosted Blur */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/foodwatch_hero_bg.jpg'), url('/artifacts/foodwatch_hero_bg_1789924460429.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          transform: 'scale(1.08)',
          filter: 'blur(28px) saturate(115%)',
          opacity: 0.65,
          zIndex: 0
        }} />

        {/* Ambient Warm Gradient Frost Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(253, 251, 247, 0.84) 0%, rgba(253, 251, 247, 0.94) 65%, #FDFBF7 100%)',
          zIndex: 1
        }} />

        {/* Hero Content Container */}
        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: 940 }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.4rem 1.1rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--cream-border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2rem'
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: 'var(--forest-olive)',
              display: 'inline-block'
            }} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--forest-dark)'
            }}>
              Systemic Surplus Redistribution &bull; Zero Hunger Platform
            </span>
          </div>

          {/* Master Brand Typography */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3.8rem, 9vw, 7.2rem)',
            fontWeight: 800,
            lineHeight: 0.96,
            letterSpacing: '-0.04em',
            color: 'var(--forest-dark)',
            marginBottom: '2rem'
          }}>
            Food<span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--forest-olive)' }}>Watch</span>
          </h1>

          {/* Human, Impactful Mission Explanation */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1.1rem, 2.2vw, 1.35rem)',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            maxWidth: 760,
            margin: '0 auto 3rem',
            fontWeight: 400
          }}>
            Every single evening across our cities, commercial kitchens discard tens of thousands of kilograms of wholesome, freshly prepared food. At that exact hour, over 190 million citizens endure acute hunger. FoodWatch is the real-time bridge — connecting verified surplus to local community kitchens and shelters before time runs out.
          </p>

          {/* Hero Action Anchors */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            marginBottom: '4.5rem'
          }}>
            <button
              onClick={() => scrollToSection(problemRef)}
              className="btn btn-forest"
              style={{ padding: '0.9rem 2.2rem', fontSize: '0.95rem' }}
            >
              01 &bull; Understand The Crisis ↓
            </button>
            <button
              onClick={() => scrollToSection(solutionRef)}
              className="btn btn-cream-outline"
              style={{ padding: '0.9rem 2.2rem', fontSize: '0.95rem' }}
            >
              02 &bull; The Solution Space →
            </button>
          </div>

          {/* Live Data Ticker */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1.5rem',
            borderTop: '1px solid var(--cream-border-subtle)',
            paddingTop: '2.5rem',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--forest-dark)', lineHeight: 1.1 }}>
                {impact?.mealsShared ? impact.mealsShared.toLocaleString('en-IN') : '14,280'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.35rem' }}>
                Meals Delivered
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--forest-olive)', lineHeight: 1.1 }}>
                {impact?.donationsActive ? impact.donationsActive : '24'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.35rem' }}>
                Active Listings Today
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--forest-dark)', lineHeight: 1.1 }}>
                {impact?.kgFoodSaved ? (impact.kgFoodSaved / 1000).toFixed(1) + 'k kg' : '5.7k kg'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.35rem' }}>
                Organic Surplus Saved
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--forest-olive)', lineHeight: 1.1 }}>
                {impact?.totalDonors ? impact.totalDonors : '48'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.35rem' }}>
                Verified Partner Kitchens
              </div>
            </div>
          </div>

        </div>
      </header>


      {/* ── 2. IMMEDIATE TRANSITION (THE PROBLEM) ──────────────────── */}
      <section
        ref={problemRef}
        id="problem"
        style={{
          position: 'relative',
          padding: '7rem 0 8rem',
          backgroundColor: '#F7F4EC',
          borderTop: '1px solid var(--cream-border)',
          borderBottom: '1px solid var(--cream-border)',
          transition: 'transform 0.4s ease-out'
        }}
      >
        <div className="container">
          
          {/* Section Eyebrow */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            borderBottom: '1px solid var(--cream-border-subtle)',
            paddingBottom: '1.25rem',
            marginBottom: '4.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--forest-olive)'
            }}>
              Part I &mdash; The Anatomy of Disconnect
            </span>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              color: 'var(--text-muted)'
            }}>
              Source: UNEP Food Waste Index &bull; ICAR Economic Survey
            </span>
          </div>

          {/* Stark Asymmetrical Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '4.5rem',
            alignItems: 'flex-start',
            marginBottom: '5.5rem'
          }}>
            
            {/* Left Column: Stark Large Numbers & Editorial Narrative */}
            <div>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: 'var(--forest-dark)',
                marginBottom: '2rem'
              }}>
                A deficit of logistics, <br />
                <span style={{ fontStyle: 'italic', color: 'var(--forest-olive)', fontWeight: 400 }}>not a deficit of food.</span>
              </h2>

              <p style={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                marginBottom: '3rem'
              }}>
                India does not suffer from insufficient food production. Our agricultural and commercial output produces more than enough calories to sustain every citizen. The tragedy occurs in the final mile: untouched banquet food, restaurant surpluses, and fresh produce spoil because no immediate digital channel exists to verify and route it before the clock runs out.
              </p>

              {/* Massive Number Block 1 */}
              <div style={{
                borderLeft: '2px solid var(--forest-dark)',
                paddingLeft: '1.75rem',
                marginBottom: '2.5rem'
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                  fontWeight: 900,
                  color: 'var(--forest-dark)',
                  lineHeight: 1
                }}>
                  68.7M
                </div>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'var(--forest-olive)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: '0.4rem',
                  marginBottom: '0.4rem'
                }}>
                  Tonnes of Edible Food Wasted Each Year
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Equivalent to the entire nutritional needs of 194 million people discarded into municipal landfills.
                </div>
              </div>

              {/* Massive Number Block 2 */}
              <div style={{
                borderLeft: '2px solid var(--forest-olive)',
                paddingLeft: '1.75rem',
                marginBottom: '2.5rem'
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                  fontWeight: 900,
                  color: 'var(--forest-olive)',
                  lineHeight: 1
                }}>
                  ₹1,53,000
                </div>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'var(--forest-dark)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: '0.4rem',
                  marginBottom: '0.4rem'
                }}>
                  Crore in Annual Economic Value Lost
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Edible inventory wasted, while commercial waste disposal fees drain food service operations.
                </div>
              </div>

              {/* Massive Number Block 3 */}
              <div style={{
                borderLeft: '2px solid var(--forest-dark)',
                paddingLeft: '1.75rem'
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                  fontWeight: 900,
                  color: 'var(--forest-dark)',
                  lineHeight: 1
                }}>
                  4 Hours
                </div>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'var(--forest-olive)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: '0.4rem',
                  marginBottom: '0.4rem'
                }}>
                  The Critical Perishability Window
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Hot banquet and hotel meals must be verified, safely transferred, and consumed before microbial degradation begins.
                </div>
              </div>

            </div>

            {/* Right Column: Minimalist Data Breakdown & Interactive Leverage Simulator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              
              {/* Minimalist Progress Breakdown */}
              <div style={{
                backgroundColor: '#FCFAF5',
                border: '1px solid var(--cream-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: 'var(--forest-dark)',
                  marginBottom: '0.5rem'
                }}>
                  Where the Harvest is Lost
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  Distribution of annual commercial and post-harvest food waste by sector in India.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
                  {WASTE_BREAKDOWN.map((item, idx) => (
                    <div key={idx}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        fontSize: '0.88rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontWeight: 600, color: 'var(--forest-dark)' }}>{item.label}</span>
                        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--forest-olive)', fontSize: '1rem' }}>
                          {item.percentage}% &nbsp;
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>({item.metric})</span>
                        </span>
                      </div>
                      
                      {/* Clean Minimalist Progress Bar */}
                      <div style={{
                        height: '6px',
                        width: '100%',
                        backgroundColor: 'var(--cream-border)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${item.percentage * 2.5}%`,
                          backgroundColor: idx === 0 ? 'var(--forest-dark)' : 'var(--forest-olive)',
                          borderRadius: '3px',
                          transition: 'width 1s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Kitchen Leverage Calculator */}
              <div style={{
                backgroundColor: '#FCFAF5',
                border: '1px solid var(--cream-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    color: 'var(--forest-dark)'
                  }}>
                    Single-Kitchen Leverage
                  </h3>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: 'var(--forest-dark)'
                  }}>
                    {calculatorKg} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--forest-olive)' }}>kg</span>
                  </span>
                </div>
                
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                  Adjust the volume to witness the exact human and environmental dividend of one commercial kitchen redirecting its nightly surplus:
                </p>

                {/* Range Slider with Olive Accent */}
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={calculatorKg}
                  onChange={(e) => setCalculatorKg(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--forest-dark)',
                    cursor: 'pointer',
                    height: '6px',
                    marginBottom: '2rem'
                  }}
                />

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.25rem',
                  borderTop: '1px solid var(--cream-border-subtle)',
                  paddingTop: '1.5rem'
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--forest-dark)' }}>
                      {mealsRescued}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Complete Meals Delivered
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--forest-olive)' }}>
                      {waterSavedLitres} L
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Virtual Water Preserved
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--forest-dark)' }}>
                      {co2PreventedKg} kg
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Landfill CO₂e Prevented
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--forest-olive)' }}>
                      ₹{economicValue}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Direct Food Value Recovered
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Section Transition Indicator */}
          <div style={{
            textAlign: 'center',
            paddingTop: '3rem',
            borderTop: '1px solid var(--cream-border-subtle)'
          }}>
            <button
              onClick={() => scrollToSection(solutionRef)}
              className="btn btn-forest"
              style={{ padding: '0.9rem 2.5rem', fontSize: '0.95rem' }}
            >
              The Solution &bull; Enter The Action Space ↓
            </button>
          </div>

        </div>
      </section>


      {/* ── 3. SCROLL TRANSITION EFFECT CONTAINER (CURTAIN & 3D DEPTH FLIP) ─── */}
      <div style={{
        position: 'relative',
        height: '140px',
        background: 'linear-gradient(to bottom, #F7F4EC 0%, #152E22 75%, var(--forest-dark) 100%)',
        overflow: 'hidden',
        perspective: '1000px'
      }}>
        {/* Arching perspective curtain reveal */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '-5%',
          right: '-5%',
          height: '56px',
          backgroundColor: 'var(--forest-dark)',
          borderTopLeftRadius: '50% 100%',
          borderTopRightRadius: '50% 100%',
          boxShadow: '0 -12px 30px rgba(0, 0, 0, 0.15)',
          transform: `scaleY(${1 + scrollProgress * 0.3})`,
          transition: 'transform 0.2s ease-out'
        }} />
      </div>


      {/* ── 4. THE SOLUTION SECTION (ACTION DASHBOARD) ─────────────── */}
      <section
        ref={solutionRef}
        id="solution"
        style={{
          position: 'relative',
          padding: '6rem 0 9rem',
          backgroundColor: 'var(--forest-dark)',
          color: 'var(--cream-bg)',
          perspective: '1200px'
        }}
      >
        <div className="container">

          {/* Solution Intro Header */}
          <div style={{
            maxWidth: 820,
            margin: '0 auto 5rem',
            textAlign: 'center'
          }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--forest-light)',
              display: 'block',
              marginBottom: '1rem'
            }}>
              Part II &mdash; The Operational Network
            </span>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: 'var(--cream-bg)',
              marginBottom: '1.75rem'
            }}>
              Direct. Verified. <br />
              <span style={{ fontStyle: 'italic', color: 'var(--forest-light)', fontWeight: 400 }}>
                Delivered within the hour.
              </span>
            </h2>

            <p style={{
              fontSize: '1.15rem',
              lineHeight: 1.7,
              color: 'rgba(253, 251, 247, 0.82)',
              fontWeight: 400
            }}>
              FoodWatch eliminates middlemen, warehousing bottlenecks, and administrative delay. When a kitchen posts surplus, our proximity engine instantly dispatches notification signals to verified shelters and community kitchens within a 5-kilometer radius. Transport is coordinated, food safety is certified under FSSAI standards, and nutritious meals reach plates immediately.
            </p>
          </div>

          {/* Twin Architectural Portals (Donors vs Recipients) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2.5rem',
            alignItems: 'stretch'
          }}>

            {/* ── PATH A: FOOD DONORS PORTAL ───────────────────────── */}
            <div style={{
              backgroundColor: 'rgba(253, 251, 247, 0.05)',
              border: '1px solid rgba(253, 251, 247, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(2rem, 4vw, 3.5rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--forest-light)',
                  borderBottom: '1px solid rgba(253, 251, 247, 0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '2rem'
                }}>
                  Portal 01 &bull; Surplus Providers
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  lineHeight: 1.15,
                  color: 'var(--cream-bg)',
                  marginBottom: '1rem'
                }}>
                  For Restaurants, Caterers & Event Hosts
                </h3>

                <p style={{
                  fontSize: '0.98rem',
                  lineHeight: 1.65,
                  color: 'rgba(253, 251, 247, 0.8)',
                  marginBottom: '2.5rem'
                }}>
                  Turn evening banquet surplus, buffet trays, and bakeries' day-end goods into immediate relief. Avoid disposal charges while receiving certified ESG impact verification.
                </p>

                {/* Minimalist Feature List with Em-Dashes */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  marginBottom: '3rem',
                  fontSize: '0.92rem',
                  color: 'rgba(253, 251, 247, 0.9)'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--forest-light)', fontWeight: 700 }}>&mdash;</span>
                    <span><strong>60-Second Rapid Listing:</strong> Declare food category, estimated quantity, and convenient pickup window.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--forest-light)', fontWeight: 700 }}>&mdash;</span>
                    <span><strong>Automated Expiry Timers:</strong> Dynamic countdown clocks ensure meals are claimed before shelf life elapses.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--forest-light)', fontWeight: 700 }}>&mdash;</span>
                    <span><strong>FSSAI Liability Safe:</strong> Built-in digital food safety acceptance disclaimers protect donor organizations.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--forest-light)', fontWeight: 700 }}>&mdash;</span>
                    <span><strong>Real-Time Tax & ESG Logging:</strong> Receive monthly audit statements tracking meals donated and CO₂e averted.</span>
                  </div>
                </div>
              </div>

              {/* Dual Action Buttons for Donors */}
              <div style={{
                borderTop: '1px solid rgba(253, 251, 247, 0.15)',
                paddingTop: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <Link
                  to="/register?role=donor"
                  className="btn"
                  style={{
                    backgroundColor: 'var(--cream-bg)',
                    color: 'var(--forest-dark)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '0.95rem 1.75rem'
                  }}
                >
                  Register as a Food Donor &rarr;
                </Link>
                
                <Link
                  to="/login?role=donor"
                  className="btn"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1.5px solid rgba(253, 251, 247, 0.35)',
                    color: 'var(--cream-bg)',
                    fontSize: '0.92rem',
                    padding: '0.85rem 1.75rem'
                  }}
                >
                  Existing Donor Sign In
                </Link>
              </div>

            </div>


            {/* ── PATH B: FOOD RECIPIENTS PORTAL ───────────────────── */}
            <div style={{
              backgroundColor: 'rgba(253, 251, 247, 0.05)',
              border: '1px solid rgba(253, 251, 247, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(2rem, 4vw, 3.5rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--forest-light)',
                  borderBottom: '1px solid rgba(253, 251, 247, 0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '2rem'
                }}>
                  Portal 02 &bull; Community Nourishment
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  lineHeight: 1.15,
                  color: 'var(--cream-bg)',
                  marginBottom: '1rem'
                }}>
                  For Shelters, Community Kitchens & NGOs
                </h3>

                <p style={{
                  fontSize: '0.98rem',
                  lineHeight: 1.65,
                  color: 'rgba(253, 251, 247, 0.8)',
                  marginBottom: '2.5rem'
                }}>
                  Secure freshly prepared, high-protein meals and fresh produce for the communities you serve, with zero procurement cost and full ingredient transparency.
                </p>

                {/* Minimalist Feature List with Em-Dashes */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  marginBottom: '3rem',
                  fontSize: '0.92rem',
                  color: 'rgba(253, 251, 247, 0.9)'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--forest-light)', fontWeight: 700 }}>&mdash;</span>
                    <span><strong>Live Radius Radar:</strong> Browse active meal listings within walking or driving distance on an interactive map.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--forest-light)', fontWeight: 700 }}>&mdash;</span>
                    <span><strong>1-Click Instant Claiming:</strong> Lock reservations for your shelter before someone else claims them.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--forest-light)', fontWeight: 700 }}>&mdash;</span>
                    <span><strong>Ingredient & Allergen Safety:</strong> Clear declarations of dietary categories (Veg, Non-Veg, Vegan, Dairy).</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--forest-light)', fontWeight: 700 }}>&mdash;</span>
                    <span><strong>Digital Verification Handover:</strong> Secure OTP verification at pickup ensures complete trust and safety.</span>
                  </div>
                </div>
              </div>

              {/* Dual Action Buttons for Recipients */}
              <div style={{
                borderTop: '1px solid rgba(253, 251, 247, 0.15)',
                paddingTop: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <Link
                  to="/register?role=receiver"
                  className="btn"
                  style={{
                    backgroundColor: 'var(--forest-light)',
                    color: 'var(--forest-deep)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '0.95rem 1.75rem'
                  }}
                >
                  Register as a Food Recipient &rarr;
                </Link>
                
                <Link
                  to="/login?role=receiver"
                  className="btn"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1.5px solid rgba(253, 251, 247, 0.35)',
                    color: 'var(--cream-bg)',
                    fontSize: '0.92rem',
                    padding: '0.85rem 1.75rem'
                  }}
                >
                  Existing Recipient Sign In
                </Link>
              </div>

            </div>

          </div>

          {/* Editorial Grounding Quote */}
          <div style={{
            marginTop: '6rem',
            borderTop: '1px solid rgba(253, 251, 247, 0.15)',
            paddingTop: '3rem',
            textAlign: 'center'
          }}>
            <blockquote style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              fontStyle: 'italic',
              color: 'rgba(253, 251, 247, 0.85)',
              maxWidth: 780,
              margin: '0 auto 1rem',
              lineHeight: 1.5
            }}>
              &ldquo;The measure of an intelligent civilization is not how much food it can produce, but whether it permits wholesome food to rot while a single child goes hungry.&rdquo;
            </blockquote>
            <div style={{ fontSize: '0.82rem', color: 'var(--forest-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              FoodWatch Initiative &bull; Sustainable Development Goal 2
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
