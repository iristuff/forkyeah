import { Outlet } from 'react-router';
import { TabBar } from './TabBar';
import { InstallPrompt } from './InstallPrompt';
import { Celebration } from './Celebration';
import styles from './Layout.module.css';

// Tab screens: content + bottom tab bar
export function Layout() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <InstallPrompt />
      <Celebration />
      <TabBar />
    </div>
  );
}

// Full-screen flows (cooking a dish): no tab bar, so nothing competes with the step
export function FocusLayout() {
  return (
    <div className={styles.shell}>
      <main className={styles.focus}>
        <Outlet />
      </main>
      <Celebration />
    </div>
  );
}
