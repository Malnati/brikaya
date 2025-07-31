// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './registerServiceWorker';
import './styles/index.css';
import { ROOT_ELEMENT_ID } from './constants/game';

ReactDOM.createRoot(document.getElementById(ROOT_ELEMENT_ID)!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
