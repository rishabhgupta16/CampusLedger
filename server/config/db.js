import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGO_URI from environment variables.
 *
 * Intentionally does NOT exit the process on failure: the health endpoint
 * and any DB-independent routes should stay reachable so the API can be
 * verified even before a real MongoDB connection string is configured.
 * Routes that need the database will simply fail per-request until a
 * successful connection is established.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('[DB] MONGO_URI is not set — skipping MongoDB connection. Set it in server/.env.');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log(`[DB] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[DB] MongoDB connection failed: ${error.message}`);
    return false;
  }
}

export function getDbStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return stateMap[mongoose.connection.readyState] || 'unknown';
}
