import { Navigate, Outlet, useLocation } from 'react-router';
import { needsWelcome, useAccount } from '../store/accountStore';
import { TabBar } from './TabBar';
import { InstallPrompt } from './InstallPrompt';
import { Celebration } from './Celebration';
import styles from './Layout.module.css';

// First launch as a guest (or finishing an email link): the sign-in welcome comes first
export function WelcomeGate() {
  const { pathname } = useLocation();
  const welcome = useAccount(needsWelcome);
  return welcome ? <Navigate to="/welcome" replace state={{ from: pathname }} /> : <Outlet />;
}

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
