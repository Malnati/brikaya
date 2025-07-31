// src/App.tsx
import React from 'react';
import Game from './components/Game';

export default function App() {
  return (
    <div className="app-container">
      <h1>Breakout</h1>
      <Game />
    </div>
  );
}
