// Reacts to the last game action. Small wins (a step) get a quick "+XP" pop;
// big wins (dish, stamp, level, quest) get the full-screen hooray.
import { useEffect, type CSSProperties } from 'react';
import { useGame } from '../store/gameStore';
import { getCuisine, getDish } from '../content/cuisines';
import { getQuest } from '../content/quests';
import type { GameEvent } from '../types';
import { Mascot } from './Mascot';
import styles from './Celebration.module.css';

interface Headline {
  title: string;
  detail: string;
}

function headline(events: GameEvent[]): Headline | null {
  for (const e of events) {
    if (e.type === 'stamp') {
      const c = getCuisine(e.cuisineId);
      return { title: `${c?.flag ?? ''} ${c?.name ?? 'New'} stamp!`.trim(), detail: 'You cooked every dish. It’s in your passport now.' };
    }
  }
  const dish = events.find(e => e.type === 'dish-complete');
  const dishName = dish?.type === 'dish-complete' ? getDish(dish.dishId)?.name : undefined;
  for (const e of events) {
    if (e.type === 'level-up') {
      const now = `You’re now a ${e.title}.`;
      return { title: `Level ${e.level}!`, detail: dishName ? `${dishName} is done, and ${now.charAt(0).toLowerCase()}${now.slice(1)}` : now };
    }
  }
  for (const e of events) {
    if (e.type === 'dish-complete') return { title: 'Hooray, dish done!', detail: `${getDish(e.dishId)?.name ?? 'That dish'} is in the bag.` };
  }
  for (const e of events) {
    if (e.type === 'quest-complete') return { title: 'Quest complete!', detail: getQuest(e.questId)?.name ?? '' };
  }
  return null;
}

const CONFETTI = Array.from({ length: 18 }, (_, i) => i);

export function Celebration() {
  const events = useGame(s => s.lastEvents);
  const clearEvents = useGame(s => s.clearEvents);

  const big = headline(events);
  const xp = events.reduce((sum, e) => (e.type === 'xp' ? sum + e.amount : sum), 0);

  // Small wins dismiss themselves
  useEffect(() => {
    if (big || xp === 0) return;
    const t = setTimeout(clearEvents, 1600);
    return () => clearTimeout(t);
  }, [big, xp, clearEvents]);

  if (big) {
    return (
      <div className={styles.scrim} role="dialog" aria-modal="true" aria-labelledby="celebrate-title">
        <div className={styles.confetti} aria-hidden="true">
          {CONFETTI.map(i => (
            <i key={i} style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
        <div className={styles.sheet}>
          <Mascot size={200} party className={styles.mascot} />
          <h2 id="celebrate-title" className={styles.title}>
            {big.title}
          </h2>
          <p className={styles.detail}>{big.detail}</p>
          {xp > 0 && <p className={`xp ${styles.total}`}>+{xp.toLocaleString()} XP</p>}
          <button className="btn" onClick={clearEvents} autoFocus>
            Fork yeah!
          </button>
        </div>
      </div>
    );
  }

  if (xp > 0) {
    return (
      <div className={styles.toast} role="status">
        <Mascot size={28} />
        <span className="xp">+{xp} XP</span>
      </div>
    );
  }

  return null;
}
