import { useLeaderboard } from '../store/hooks';
import { Mascot } from '../components/Mascot';
import type { LeaderboardEntry } from '../types';
import styles from './Ranks.module.css';

const AVATAR_TINTS = ['#ffe27a', '#ffe3ef', '#ddf0fb', '#d7f2e3'];

export default function Ranks() {
  const board = useLeaderboard();
  const meIdx = board.findIndex(e => e.isMe);
  const me = board[meIdx];
  const ahead = meIdx > 0 ? board[meIdx - 1] : null;

  // Top 3, then a window around you
  const windowStart = Math.max(3, meIdx - 1);
  const rows: (LeaderboardEntry | 'gap')[] = [...board.slice(0, 3)];
  if (windowStart > 3) rows.push('gap');
  rows.push(...board.slice(windowStart, meIdx + 3).filter(e => e.rank > 3));

  return (
    <div>
      <h1>Ranks</h1>
      <p className="dim">Sample players until accounts arrive</p>

      <ol className={styles.board}>
        {rows.map((row, i) =>
          row === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              · · ·
            </li>
          ) : (
            <li key={row.id} className={row.isMe ? `${styles.row} ${styles.me}` : styles.row} aria-current={row.isMe ? 'true' : undefined}>
              <span className={row.rank <= 3 ? `${styles.rank} ${styles.top}` : styles.rank}>{row.rank}</span>
              <span className={styles.avatar} style={{ background: AVATAR_TINTS[row.rank % AVATAR_TINTS.length] }}>
                {row.isMe ? <Mascot size={34} /> : row.name[0]}
              </span>
              <span className={styles.who}>
                <b>{row.isMe ? 'You' : row.name}</b>
                <span>{row.subtitle}</span>
              </span>
              <span className="num">{row.xp.toLocaleString()}</span>
            </li>
          ),
        )}
      </ol>

      {me && ahead && (
        <p className={styles.chase}>
          {(ahead.xp - me.xp + 1).toLocaleString()} XP to pass {ahead.name}
        </p>
      )}
      {me && !ahead && <p className={styles.chase}>You’re number one. Fork yeah!</p>}
    </div>
  );
}
