import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db();

  const url = new URL(req.url);
  const deviceIDs = url.searchParams.getAll('deviceIDs');
  const timestamps = url.searchParams.getAll('timestamps');
  const N = Number(url.searchParams.get('N')) || 50;

  // Build pipelines
  const facets = deviceIDs.reduce((acc, id, idx) => {
    acc[id] = [
      { $match: {
          deviceID: id,
          timestamp: { $gt: timestamps[idx] }
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: N }
    ];
    return acc;
  }, {} as Record<string, any[]>);

  const results = await db.collection('data').aggregate([
    { $facet: facets }
  ]).toArray();

  // Format for frontend
  const output = Object.entries(results[0]).map(([deviceID, latestEntries]) => ({
    deviceID,
    latestEntries
  }));

  return NextResponse.json(output);
}


export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db();
  try {
    const data = await req.json(); // get req body
    await db.collection('data').insertOne(data);
    await db.collection('data_log').insertOne({ type: 'Data received', timestamp: new Date(), details: data });
    return NextResponse.json({ message: 'Data stored successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to store data.' }, { status: 500 });
  }
}