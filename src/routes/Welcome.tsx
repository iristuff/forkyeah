import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAccount } from '../store/accountStore';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import styles from './Welcome.module.css';

type View = 'choose' | 'email';
type Mode = 'sign-in' | 'sign-up';

// Sign in to save progress to the cloud, or stay a guest. Shown once after the
// first launch, and from Profile. Also finishes an email link opened on another device.
export default function Welcome() {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const account = useAccount();
  const { status, busy, error, clearError } = account;
  const [view, setView] = useState<View>('choose');
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  const back = from === '/welcome' ? '/' : from;
  const leave = () => navigate(back, { replace: true });

  useEffect(() => {
    if (status === 'signed-in') navigate(back, { replace: true });
  }, [status, back, navigate]);

  if (status === 'disabled') return <Navigate to="/" replace />;

  const go = (next: View) => {
    clearError();
    setView(next);
  };
  const edit = (set: (v: string) => void) => (v: string) => {
    if (error || account.resetSentTo) clearError();
    set(v);
  };
  const stayGuest = () => {
    account.finishWelcome();
    leave();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (status === 'needs-email') void account.completeEmailLink(email);
    else if (mode === 'sign-up') void account.signUpWithEmail(email, password);
    else void account.signInWithEmail(email, password);
  };
  const sendLink = async () => {
    await account.sendEmailLink(email);
    if (!useAccount.getState().error) setLinkSent(true);
  };

  const sentTo = linkSent ? account.emailLinkSentTo : null;
  const compact = view === 'email' || status === 'needs-email';

  return (
    <main className={styles.page}>
      <section className={`${styles.hero} ${compact ? styles.compact : ''}`}>
        <Mascot size={compact ? 92 : 156} splashTarget className={styles.mascot} />
      </section>

      <div className={styles.body}>
        {sentTo ? (
          <>
            <h1>Check your inbox</h1>
            <p className={styles.lede}>
              We sent a sign-in link to <b>{sentTo}</b>. Open it on this phone and you’re in.
            </p>
            <button className="btn btn-ghost" onClick={() => setLinkSent(false)}>
              Use a different email
            </button>
          </>
        ) : status === 'needs-email' ? (
          <form onSubmit={submit} className={styles.form}>
            <h1>Finish signing in</h1>
            <p className={styles.lede}>Enter the email you asked for the sign-in link with.</p>
            <Field label="Email" type="email" value={email} onChange={edit(setEmail)} autoComplete="email" />
            <Problem error={error} />
            <button className="btn" disabled={busy || !email.trim()}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <button type="button" className={styles.textBtn} onClick={account.cancelEmailLink}>
              Cancel
            </button>
          </form>
        ) : view === 'choose' ? (
          <>
            <h1>Save your progress</h1>
            <p className={styles.lede}>Sign in to keep your XP, streak and passport stamps safe, and carry on from any phone.</p>
            <Problem error={error} />
            <div className={styles.choices}>
              <button className="btn btn-ghost" disabled={busy} onClick={() => void account.signInWithGoogle()}>
                <GoogleLogo />
                {busy ? 'Opening Google…' : 'Continue with Google'}
              </button>
              <button className="btn btn-ghost" disabled={busy} onClick={() => go('email')}>
                <Icon name="mail" size={20} />
                Continue with email
              </button>
            </div>
            <div className={styles.later}>
              <button className={styles.textBtn} onClick={stayGuest}>
                Maybe later
              </button>
              <p className="dim">Your progress stays on this phone.</p>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className={styles.form}>
            <div className={styles.titleRow}>
              <button type="button" className="icon-btn" onClick={() => go('choose')} aria-label="Back">
                <Icon name="back" />
              </button>
              <h1>{mode === 'sign-in' ? 'Welcome back' : 'New here?'}</h1>
            </div>
            <div className={styles.segments} role="radiogroup" aria-label="Account">
              {(['sign-in', 'sign-up'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  className={mode === m ? styles.on : undefined}
                  onClick={() => {
                    clearError();
                    setMode(m);
                  }}
                >
                  {m === 'sign-in' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
            <Field label="Email" type="email" value={email} onChange={edit(setEmail)} autoComplete="email" />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={edit(setPassword)}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              hint={mode === 'sign-up' ? 'At least 6 characters' : undefined}
            />
            <Problem error={error} />
            {account.resetSentTo && (
              <p className={styles.notice} role="status">
                <Icon name="check" size={18} strokeWidth={3} /> Reset link sent to {account.resetSentTo}.
              </p>
            )}
            <button className="btn" disabled={busy || !email.trim() || !password}>
              {busy ? 'One moment…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
            <div className={styles.links}>
              {mode === 'sign-in' && (
                <button type="button" className={styles.textBtn} disabled={busy || !email.trim()} onClick={() => void account.sendPasswordReset(email)}>
                  Forgot password?
                </button>
              )}
              <button type="button" className={styles.textBtn} disabled={busy || !email.trim()} onClick={() => void sendLink()}>
                Email me a link instead
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

interface FieldProps {
  label: string;
  type: 'email' | 'password';
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  hint?: string;
}

function Field({ label, type, value, onChange, autoComplete, hint }: FieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={type === 'email' ? 'email' : undefined}
        autoCapitalize="off"
        spellCheck={false}
        required
      />
      {hint && <small className="dim">{hint}</small>}
    </label>
  );
}

function Problem({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className={styles.error} role="alert">
      {error}
    </p>
  );
}

// Google's "G", in its own colours as Google's sign-in branding asks
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FBBC05" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#EA4335" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#34A853" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#4285F4" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}
