import { NavLink } from 'react-router';
import { Icon, type IconName } from './Icon';
import styles from './TabBar.module.css';

const TABS: { to: string; icon: IconName; label: string }[] = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/passport', icon: 'passport', label: 'Passport' },
  { to: '/ranks', icon: 'ranks', label: 'Ranks' },
  { to: '/chef', icon: 'chef', label: 'Sous Chef' },
  { to: '/profile', icon: 'profile', label: 'Profile' },
];

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
          <span className={styles.pill}>
            <Icon name={tab.icon} />
          </span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
