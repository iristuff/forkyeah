import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAccount } from '../store/accountStore';
import { useGame } from '../store/gameStore';
import { useLevel, useProgress, useQuests, useStreak } from '../store/hooks';
import { localDay } from '../lib/dates';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import styles from './Profile.module.css';

const BADGE_COLORS = ['var(--green)', 'var(--red)', 'var(--blue)', 'var(--pink)', 'var(--gold)'];

export default function Profile() {
  const progress = useProgress();
  const level = useLevel();
  const streak = useStreak();
  const quests = useQuests();
  const updateProfile = useGame(s => s.updateProfile);
  const exportBackup = useGame(s => s.exportBackup);
  const importBackup = useGame(s => s.importBackup);
  const fileInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const canSignIn = useAccount(s => s.status === 'signed-out');
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const dishesCooked = Object.values(progress.dishes).filter(d => d.completedAt).length;
  const stamps = Object.keys(progress.stamps).length;

  const saveBackup = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forkyeah-backup-${localDay(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice({ ok: true, text: 'Backup saved. Keep it somewhere safe.' });
  };

  const restore = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const result = importBackup(await file.text());
    setNotice(result.ok ? { ok: true, text: 'Progress restored. Welcome back!' } : { ok: false, text: result.error });
  };

  return (
    <div>
      <header className={styles.hero}>
        <span className={styles.mascot}>
          <Mascot size={112} party />
        </span>
        <label className="visually-hidden" htmlFor="profile-name">
          Your name
        </label>
        <input
          id="profile-name"
          className={styles.name}
          defaultValue={progress.profile.name}
          maxLength={24}
          onBlur={e => {
            const name = e.target.value.trim();
            if (name && name !== progress.profile.name) updateProfile({ name });
            else e.target.value = progress.profile.name;
          }}
        />
        <p className="dim">
          Level {level.level} · {level.title}
        </p>
      </header>

      <dl className={styles.stats}>
        <div>
          <dt>XP</dt>
          <dd className="num">{level.xp.toLocaleString()}</dd>
        </div>
        <div>
          <dt>day streak</dt>
          <dd className="num">{streak}</dd>
        </div>
        <div>
          <dt>{stamps === 1 ? 'stamp' : 'stamps'}</dt>
          <dd className="num">{stamps}</dd>
        </div>
        <div>
          <dt>dishes</dt>
          <dd className="num">{dishesCooked}</dd>
        </div>
      </dl>

      <h2 className={styles.h2}>Badges</h2>
      <ul className={styles.badges}>
        {quests.map(({ quest, claimed }, i) => (
          <li key={quest.id} className={claimed ? styles.earned : undefined}>
            <span style={claimed ? { background: BADGE_COLORS[i % BADGE_COLORS.length] } : undefined}>
              <Icon name={claimed ? 'trophy' : 'lock'} size={22} />
            </span>
            {quest.name}
          </li>
        ))}
      </ul>

      <h2 className={styles.h2}>Your progress</h2>
      <div className={styles.list}>
        {canSignIn && (
          <button onClick={() => navigate('/welcome', { state: { from: '/profile' } })}>
            <Icon name="profile" size={20} />
            <span>Sign in to save your progress</span>
            <Icon name="chevron" size={18} />
          </button>
        )}
        <button onClick={saveBackup}>
          <Icon name="download" size={20} />
          <span>Save a backup file</span>
          <Icon name="chevron" size={18} />
        </button>
        <button onClick={() => fileInput.current?.click()}>
          <Icon name="upload" size={20} />
          <span>Restore from backup</span>
          <Icon name="chevron" size={18} />
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={restore} />
      </div>
      {notice && (
        <p className={notice.ok ? styles.ok : styles.bad} role="status">
          {notice.text}
        </p>
      )}
      <p className={styles.note}>Your progress lives on this phone. Back it up before switching devices.</p>
    </div>
  );
}
