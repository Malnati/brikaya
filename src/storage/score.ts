// src/storage/score.ts
import { openDB } from 'idb';

const DB_NAME = 'breakout';
const DB_VERSION = 2;
const STORE_NAME = 'scores';
const HIGH_SCORE_STORE_NAME = 'highScore';
const HIGH_SCORE_KEY = 'best';
const EMPTY_SCORE = 0;

async function initializeDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
      if (!database.objectStoreNames.contains(HIGH_SCORE_STORE_NAME)) {
        database.createObjectStore(HIGH_SCORE_STORE_NAME);
      }
    }
  });
}

export async function saveScore(score: number) {
  const db = await initializeDatabase();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.add(score);
  await tx.done;
}

export async function getTotalScore(): Promise<number> {
  const db = await initializeDatabase();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const all = await tx.store.getAll();
  return all.reduce((acc, val) => acc + val, EMPTY_SCORE);
}

export async function getHighScore(): Promise<number> {
  const db = await initializeDatabase();
  const tx = db.transaction(HIGH_SCORE_STORE_NAME, 'readonly');
  const highScore = await tx.store.get(HIGH_SCORE_KEY);
  return typeof highScore === 'number' ? highScore : EMPTY_SCORE;
}

export async function saveHighScore(score: number): Promise<void> {
  const db = await initializeDatabase();
  const tx = db.transaction(HIGH_SCORE_STORE_NAME, 'readwrite');
  await tx.store.put(score, HIGH_SCORE_KEY);
  await tx.done;
}

export async function resetScores() {
  const db = await initializeDatabase();
  const tx = db.transaction([STORE_NAME, HIGH_SCORE_STORE_NAME], 'readwrite');
  await tx.objectStore(STORE_NAME).clear();
  await tx.objectStore(HIGH_SCORE_STORE_NAME).clear();
  await tx.done;
}
