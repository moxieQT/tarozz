import React from 'react';
import { LifeBuoy, Phone } from 'lucide-react';
import { CRISIS_CONTACTS, CRISIS_COUNTRY } from '../data/crisis';

interface CrisisResourcesProps {
  className?: string;
}

/**
 * Always-free emergency contacts block. Rendered on safety-critical screens so
 * a user in crisis can reach real help without hitting a paywall.
 */
export function CrisisResources({ className = '' }: CrisisResourcesProps) {
  return (
    <section
      aria-label="Экстренная помощь"
      className={`rounded-[20px] p-5 ${className}`}
      style={{
        background: 'var(--danger-bg)',
        border: '1px solid var(--danger-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--danger-ink)' }}>
        <LifeBuoy size={16} aria-hidden="true" />
        <h3 className="text-[12px] font-bold uppercase tracking-[0.12em]">
          Нужна срочная помощь?
        </h3>
      </div>
      <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--ink2)' }}>
        Если вам тяжело прямо сейчас, вы не одни. Помощь бесплатна и доступна
        круглосуточно ({CRISIS_COUNTRY}).
      </p>

      <ul className="flex flex-col gap-2">
        {CRISIS_CONTACTS.map((c) => (
          <li key={c.phone}>
            <a
              href={c.href}
              className="flex items-center gap-3 p-3 rounded-[14px] transition-all active:scale-[0.98]"
              style={{
                background: c.highlight ? 'var(--danger-ink)' : 'var(--surface)',
                border: '1px solid var(--danger-border)',
                color: c.highlight ? '#fff' : 'var(--ink)',
              }}
              aria-label={`Позвонить: ${c.name}, ${c.phone}`}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: c.highlight ? 'rgba(255,255,255,0.18)' : 'var(--danger-bg)',
                  color: c.highlight ? '#fff' : 'var(--danger-ink)',
                }}
              >
                <Phone size={15} aria-hidden="true" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-bold leading-tight">{c.name}</span>
                <span
                  className="block text-[11px] leading-snug"
                  style={{ color: c.highlight ? 'rgba(255,255,255,0.85)' : 'var(--ink3)' }}
                >
                  {c.note}
                </span>
              </span>
              <span className="text-[15px] font-mono font-bold tracking-tight shrink-0">
                {c.phone}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="text-[10px] leading-relaxed mt-4" style={{ color: 'var(--ink3)' }}>
        Это приложение не заменяет профессиональную медицинскую или психологическую помощь.
      </p>
    </section>
  );
}
