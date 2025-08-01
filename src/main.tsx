// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './registerServiceWorker';
import './styles/index.css';
import { ROOT_ELEMENT_ID } from './constants/game';

console.log('🚦 main.tsx carregado');
window.mainTsxLoaded = true;
alert('MAIN.TSX ESTÁ SENDO EXECUTADO!');

// Importar gameLogger
import { gameLogger } from './storage/gameLogger';
console.log('🚦 gameLogger importado:', gameLogger);

ReactDOM.createRoot(document.getElementById(ROOT_ELEMENT_ID)!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
