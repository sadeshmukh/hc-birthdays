import { defineMiddleware } from 'astro:middleware';
import { initDb } from './lib/db';

let dbInitialized = false;

export const onRequest = defineMiddleware(async (context, next) => {
  if (!dbInitialized) {
    try {
      await initDb();
      dbInitialized = true;
      console.log('Database initialized');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
  return next();
});
