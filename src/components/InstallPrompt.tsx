import { useEffect, useState } from 'react';
import { isIOS, isStandalone, readFlag, writeFlag } from '../lib/platform';
import styles from './InstallPrompt.module.css';

// Chrome/Android fire this before showing their own install UI
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'forkyeah:install-dismissed';

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || readFlag(DISMISSED_KEY)) return;

    // iOS has no install API — explain the Share → Add to Home Screen flow instead
    if (isIOS()) {
      setShowIOSHint(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    writeFlag(DISMISSED_KEY);
    setDeferred(null);
    setShowIOSHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  if (!deferred && !showIOSHint) return null;

  return (
    <aside className={styles.banner} role="dialog" aria-label="Install Fork Yeah">
      <img className={styles.icon} src="/icons/icon-192.png" alt="" width={40} height={40} />
      <div className={styles.text}>
        <strong>Add Fork Yeah to your home screen</strong>
        {showIOSHint ? (
          <span>
            Tap <ShareIcon /> Share, then “Add to Home Screen”. Your progress lives in the app, so install before you start cooking.
          </span>
        ) : (
          <span>Full screen, works offline, keeps your progress safe.</span>
        )}
      </div>
      <div className={styles.actions}>
        {deferred && (
          <button className={styles.primary} onClick={install}>
            Install
          </button>
        )}
        <button className={styles.close} onClick={dismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </aside>
  );
}

function ShareIcon() {
  return (
    <svg className={styles.share} viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M12 3v12M7 8l5-5 5 5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
