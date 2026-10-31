import { Outlet } from 'react-router';
import { TabBar } from './TabBar';
import { InstallPrompt } from './InstallPrompt';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <InstallPrompt />
      <TabBar />
    </div>
  );
}
