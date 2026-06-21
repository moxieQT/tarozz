import React, { useEffect } from 'react';
import { useAppStore } from '../store';

export function GoogleTranslate() {
  const { globalLanguage } = useAppStore();

  useEffect(() => {
    // Add the google translate element div
    if (!document.getElementById('google_translate_element')) {
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
  }, []);

  useEffect(() => {
    if (globalLanguage) {
      const cookieVal = `/ru/${globalLanguage}`;
      document.cookie = `googtrans=${cookieVal}; path=/`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`;
      
      let retries = 0;
      const checkAndTrigger = () => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          if (select.value !== globalLanguage && globalLanguage !== 'ru') {
            select.value = globalLanguage;
            select.dispatchEvent(new Event('change'));
          } else if (globalLanguage === 'ru' && select.value !== '') {
            select.value = '';
            select.dispatchEvent(new Event('change'));
            
            // Revert googtrans
            document.cookie = `googtrans=/ru/ru; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `googtrans=/ru/ru; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
            
            window.location.reload();
          }
        } else {
          // If the select isn't ready
          if (retries < 20) {
            retries++;
            setTimeout(checkAndTrigger, 500);
          }
        }
      };
      
      checkAndTrigger();
    }
  }, [globalLanguage]);

  return null;
}
