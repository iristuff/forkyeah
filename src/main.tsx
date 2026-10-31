import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { requestPersistentStorage } from './lib/platform';
import '@fontsource-variable/baloo-2';
import '@fontsource-variable/rethink-sans';
import './styles/global.css';

// Progress is stored on-device, so ask the browser not to evict it
void requestPersistentStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
