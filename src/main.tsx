import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { CharacterProvider } from './context/CharacterContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <CharacterProvider>
    <App />
  </CharacterProvider>
);

// Register service worker for fullscreen PWA support
if ('serviceWorker' in navigator && !window.location.host.includes('localhost:3000')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

