import React, { useEffect } from 'react';
import { useAppStore } from '../store';

// Inject the (heavy, third-party) Google Translate widget on demand. Idempotent.
function injectGoogleTranslate() {
  if (document.getElementById('google_translate_element')) return;

  const div = document.createElement('div');
  div.id = 'google_translate_element';
  document.body.appendChild(div);

  (window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement(
      { pageLanguage: 'ru', autoDisplay: false },
      'google_translate_element'
    );
  };

  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
}

function clearTranslateCookie() {
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
}

export function GoogleTranslate() {
  const { globalLanguage } = useAppStore();

  useEffect(() => {
    if (!globalLanguage) return;

    // Default language: don't load the external widget at all. Only when an
    // active translation needs to be reverted do we clear it and reload.
    if (globalLanguage === 'ru') {
      const translationActive =
        (document.cookie.includes('googtrans=') &&
          !document.cookie.includes('googtrans=/ru/ru')) ||
        !!document.querySelector('.goog-te-combo');
      if (translationActive) {
        clearTranslateCookie();
        window.location.reload();
      }
      return;
    }

    // Non-default language → pull in the widget and switch.
    injectGoogleTranslate();

    const cookieVal = `/ru/${globalLanguage}`;
    document.cookie = `googtrans=${cookieVal}; path=/`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`;

    let retries = 0;
    let timer: number | undefined;
    const checkAndTrigger = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        if (select.value !== globalLanguage) {
          select.value = globalLanguage;
          select.dispatchEvent(new Event('change'));
        }
      } else if (retries < 20) {
        retries++;
        timer = window.setTimeout(checkAndTrigger, 500);
      }
    };
    checkAndTrigger();

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [globalLanguage]);

  return null;
}
