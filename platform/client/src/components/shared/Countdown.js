import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, isPast } from 'date-fns';

export default function Countdown({ expiresAt }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  const exp = new Date(expiresAt);
  if (isPast(exp)) return <span className="countdown urgent">Expired</span>;

  const msLeft = exp - now;
  const minsLeft = Math.floor(msLeft / 60000);
  const cls = minsLeft < 30 ? 'urgent' : minsLeft < 120 ? 'soon' : 'ok';
  const label = formatDistanceToNow(exp, { addSuffix: true });

  return <span className={`countdown ${cls}`}>⏰ Expires {label}</span>;
}
