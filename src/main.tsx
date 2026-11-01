import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { requestPersistentStorage } from './lib/platform';
import { useAccount } from './store/accountStore';
import { playSplash } from './components/splash';
import '@fontsource-variable/baloo-2';
import '@fontsource-variable/rethink-sans';
import './styles/global.css';

// Progress is stored on-device, so ask the browser not to evict it
void requestPersistentStorage();
// Signed-in players: restore the session and sync. Guests: does nothing (no Firebase download).
useAccount.getState().start();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
void playSplash();
