import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import styles from './StepTimer.module.css';

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Countdown for steps that need one. Buzzes (where supported) when time is up.
export function StepTimer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + left * 1000;
    const id = setInterval(() => {
      const next = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(next);
      if (next === 0) {
        setRunning(false);
        navigator.vibrate?.([200, 100, 200]);
      }
    }, 250);
    return () => clearInterval(id);
    // `left` is only read when (re)starting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const finished = left === 0;

  return (
    <div className={finished ? `${styles.timer} ${styles.finished}` : styles.timer}>
      <span className={styles.time} role="timer" aria-live={finished ? 'assertive' : 'off'}>
        {finished ? 'Time’s up!' : fmt(left)}
      </span>
      {finished ? (
        <button className="btn btn-ghost" onClick={() => setLeft(seconds)}>
          <Icon name="reset" size={16} /> Reset
        </button>
      ) : (
        <button className="btn btn-ghost" onClick={() => setRunning(r => !r)}>
          <Icon name={running ? 'pause' : 'play'} size={16} /> {running ? 'Pause' : left < seconds ? 'Resume' : 'Start timer'}
        </button>
      )}
    </div>
  );
}
