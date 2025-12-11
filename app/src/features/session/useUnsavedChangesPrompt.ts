import { useEffect } from 'react';

export function useUnsavedChangesPrompt(active: boolean) {
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!active) return;
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [active]);

  const confirmNavigation = () => {
    if (!active) return true;
    return window.confirm('You have unsaved changes. Leave without saving?');
  };

  return { confirmNavigation };
}

