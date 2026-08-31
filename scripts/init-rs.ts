import { MongoClient } from 'mongodb';

async function initReplicaSet() {
  const client = new MongoClient('mongodb://127.0.0.1:27018/?directConnection=true');
  try {
    await client.connect();
    console.log('Connected to local MongoDB instance on port 27018.');
    const adminDb = client.db('admin');
    const result = await adminDb.command({ replSetInitiate: {} });
    console.log('✅ Replica set rs0 initiated successfully:', result);
  } catch (err: any) {
    if (err?.message?.includes('already initialized')) {
      console.log('✅ Replica set rs0 is already initialized.');
    } else {
      console.error('Replica set initiation notice:', err?.message || err);
    }
  } finally {
    await client.close();
  }
}

initReplicaSet();
