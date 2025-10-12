import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const assignment_data = await db.collection('assignments').find({}).sort({ timestamp: -1 }).toArray();
  return NextResponse.json(assignment_data);
}

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db();
  try {
    const data = await req.json(); // Modern way to get request body
    const deviceActivity = await db.collection('assignments').findOne({ deviceID: data.deviceID });
    if (!deviceActivity) {
        await db.collection('assignments').insertOne(data);
        await db.collection('event_log').insertOne({ type: 'Patient registered', timestamp: new Date(), details: data });
        return NextResponse.json({ message: 'Patient registered successfully' });
    }
    return NextResponse.json({ error: `Device is currently assigned to another patient (ID: ${deviceActivity.patientId})` }, { status: 409 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to store data.' }, { status: 500 });
  }
}