import React from 'react';
import { useTheme } from '../context/ThemeContext';

const GearSVG = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

interface GearButtonProps {
  variant?: 'corner' | 'header' | 'fixed';
}

export function GearButton({ variant = 'corner' }: GearButtonProps) {
  const { isDark, toggleTheme } = useTheme();

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 'none',
    padding: '0',
    background: isDark ? 'rgba(18,37,26,0.82)' : 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: `1px solid ${isDark ? '#33523D' : '#DFDDD7'}`,
    color: isDark ? '#9FC0AA' : '#5C5854',
    boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
    transition: 'background .25s, border-color .25s, color .25s',
    flexShrink: 0,
  };

  if (variant === 'corner') {
    return (
      <button
        onClick={toggleTheme}
        title="Сменить тему"
        style={{ ...baseStyle, position: 'absolute', top: '14px', right: '14px', width: '38px', height: '38px', zIndex: 70 }}
      >
        <GearSVG size={18} />
      </button>
    );
  }

  if (variant === 'fixed') {
    return (
      <button
        onClick={toggleTheme}
        title="Сменить тему"
        style={{ ...baseStyle, position: 'fixed', top: '16px', right: '16px', width: '42px', height: '42px', zIndex: 100 }}
      >
        <GearSVG size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title="Сменить тему"
      style={{ ...baseStyle, position: 'static', width: '34px', height: '34px' }}
    >
      <GearSVG size={16} />
    </button>
  );
}
