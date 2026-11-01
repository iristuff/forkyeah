import { Navigate, Outlet, useLocation } from 'react-router';
import { needsWelcome, useAccount } from '../store/accountStore';
import { TabBar } from './TabBar';
import { InstallPrompt } from './InstallPrompt';
import { Celebration } from './Celebration';
import styles from './Layout.module.css';

// Tab screens: content + bottom tab bar
export function Layout() {
  const location = useLocation();
  const welcome = useAccount(needsWelcome);
  if (welcome) return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;
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
