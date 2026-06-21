import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Crown } from 'lucide-react';
import { useAppStore } from '../store';

export function ProfileButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription, profile } = useAppStore();
  const isPremium = subscription === 'premium';

  // Hide on profile page itself
  if (location.pathname === '/profile') return null;

  return (
    <button
      onClick={() => navigate('/profile')}
      title="Личный кабинет"
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        width: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        cursor: 'pointer',
        outline: 'none',
        padding: '0',
        background: isPremium
          ? 'linear-gradient(135deg, rgba(142,111,62,0.85), rgba(196,163,90,0.85))'
          : 'var(--bar)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${isPremium ? 'rgba(196,163,90,0.4)' : 'var(--border)'}`,
        color: isPremium ? '#fff' : 'var(--ink2)',
        boxShadow: isPremium
          ? '0 4px 12px rgba(142,111,62,0.3)'
          : '0 2px 10px rgba(0,0,0,0.14)',
        transition: 'all 0.25s',
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {isPremium ? <Crown size={18} /> : <User size={18} />}
    </button>
  );
}
