import { useEffect, useRef } from 'react';

export default function useDialog() {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
      else {
        const parent = Array.from(document.querySelectorAll('dialog[open]')).at(-1);
        const target = parent?.querySelector('button, input, select, textarea, [tabindex]') || parent || document.getElementById('main-content');
        target?.focus();
      }
    };
  }, []);
  return ref;
}
