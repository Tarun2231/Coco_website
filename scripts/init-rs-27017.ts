import { MongoClient } from 'mongodb';

async function initReplicaSet27017() {
  const client = new MongoClient('mongodb://127.0.0.1:27017/?directConnection=true');
  try {
    await client.connect();
    console.log('Connected to local MongoDB service on port 27017.');
    const adminDb = client.db('admin');
    const result = await adminDb.command({ replSetInitiate: {} });
    console.log('✅ Replica set rs0 initiated successfully on port 27017:', result);
  } catch (err: any) {
    if (err?.message?.includes('already initialized')) {
      console.log('✅ Replica set rs0 is already initialized on port 27017.');
    } else {
      console.error('Replica set initiation notice:', err?.message || err);
    }
  } finally {
    await client.close();
  }
}

initReplicaSet27017();
