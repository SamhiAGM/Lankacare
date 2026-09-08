import app from '../src/app';
import { connectDB } from '../src/config/database';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure the database is connected before handling the request
  await connectDB();
  
  // Forward the request to the Express app
  return app(req as any, res as any);
}
