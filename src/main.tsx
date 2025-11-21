// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './registerServiceWorker';
import './styles/index.css';
import { ROOT_ELEMENT_ID } from './constants/game';
import { LOG } from './utils/logger';

LOG('🚦 main.tsx carregado');
declare global {
  interface Window {
    mainTsxLoaded: boolean;
  }
}
window.mainTsxLoaded = true;
alert('MAIN.TSX ESTÁ SENDO EXECUTADO!');

// Importar gameLogger
import { gameLogger } from './storage/gameLogger';
LOG('🚦 gameLogger importado:', gameLogger);

ReactDOM.createRoot(document.getElementById(ROOT_ELEMENT_ID)!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
