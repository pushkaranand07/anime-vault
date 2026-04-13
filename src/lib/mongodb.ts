import { MongoClient, Db, Collection } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

// In serverless environments, we must cache the client across hot reloads
// to avoid exhausting the connection pool.
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so the client is preserved across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each cold start (it will be reused within the instance)
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('anivault');
}

export async function getAnimeCollection(userId: string): Promise<Collection> {
  const db = await getDatabase();
  return db.collection('anime');
}
