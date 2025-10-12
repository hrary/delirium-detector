import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db();

  const url = new URL(req.url);
  const deviceIDs = url.searchParams.getAll('deviceIDs');
  const timestamps = url.searchParams.getAll('timestamps');

  const pairs = deviceIDs.map((id, idx) => {
    return {
      deviceID: id,
      timestamp: { $gt: timestamps[idx] }
    };
  });

  const results = await db.collection('data')
    .find({ $or: pairs })
    .toArray();

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db();
  try {
    const data = await req.json(); // Modern way to get request body
    await db.collection('data').insertOne(data);
    await db.collection('event_log').insertOne({ type: 'Data received', timestamp: new Date(), details: data });
    return NextResponse.json({ message: 'Data stored successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to store data.' }, { status: 500 });
  }
}