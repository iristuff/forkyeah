import { NavLink } from 'react-router';
import styles from './TabBar.module.css';

const TABS = [
  { to: '/', emoji: '🏠', label: 'Home' },
  { to: '/passport', emoji: '🗺️', label: 'Passport' },
  { to: '/ranks', emoji: '🏆', label: 'Ranks' },
  { to: '/chef', emoji: '🤖', label: 'Sous Chef' },
  { to: '/profile', emoji: '👤', label: 'Profile' },
] as const;

export function TabBar() {
  return (
    <nav className={styles.bar} aria-label="Main">
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => (isActive ? `${styles.tab} ${styles.active}` : styles.tab)}
        >
          <span className={styles.emoji} aria-hidden="true">{tab.emoji}</span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
