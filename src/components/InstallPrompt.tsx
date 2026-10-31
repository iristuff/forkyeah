import { useEffect, useState } from 'react';
import { isIOS, isStandalone, readFlag, writeFlag } from '../lib/platform';
import { Icon } from './Icon';
import { Mascot } from './Mascot';
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
      <span className={styles.icon}>
        <Mascot size={44} />
      </span>
      <div className={styles.text}>
        <strong>Add Fork Yeah to your home screen</strong>
        {showIOSHint ? (
          <span>
            Tap <Icon name="share" size={14} className={styles.share} /> Share, then “Add to Home Screen”. Your progress lives in the app, so install before you start cooking.
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
          <Icon name="close" size={20} />
        </button>
      </div>
    </aside>
  );
}
