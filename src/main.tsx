import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { CharacterProvider } from './context/CharacterContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <CharacterProvider>
    <App />
  </CharacterProvider>
);

