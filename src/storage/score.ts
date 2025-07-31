// src/storage/score.ts
import { openDB } from 'idb';

const DB_NAME = 'breakout';
const STORE_NAME = 'scores';

export async function saveScore(score: number) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(database) {
      database.createObjectStore(STORE_NAME, { autoIncrement: true });
    }
  });
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.add(score);
  await tx.done;
}

export async function getTotalScore(): Promise<number> {
  const db = await openDB(DB_NAME, 1);
  const tx = db.transaction(STORE_NAME, 'readonly');
  const all = await tx.store.getAll();
  return all.reduce((acc, val) => acc + val, 0);
}

export async function resetScores() {
  const db = await openDB(DB_NAME, 1);
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
}

