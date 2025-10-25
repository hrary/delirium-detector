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
    const data = await req.json(); // get req body
    console.log('Received id:', data.deviceId);
    const deviceActivity = await db.collection('assignments').findOne({ deviceId: data.deviceId });
    if (!deviceActivity) {
      await db.collection('assignments').insertOne(data);
      await db.collection('event_log').insertOne({ type: 'Patient assigned', timestamp: new Date(), details: data });
      return NextResponse.json({ message: 'Patient assigned successfully' });
    }
    return NextResponse.json({ error: `Device is currently assigned to another patient (ID: ${deviceActivity.patientId})` }, { status: 409 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to store data.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const client = await clientPromise;
  const db = client.db();
  try {
    const { patientId } = await req.json();
    const deleteResult = await db.collection('assignments').deleteOne({
      patientId: patientId
    });
    if (deleteResult.deletedCount === 1) {
      await db.collection('event_log').insertOne({ type: 'Patient deassigned', timestamp: new Date(), details: { patientId } });
      return NextResponse.json({ message: 'Patient deleted successfully' });
    }
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient.' }, { status: 500 });
  }
}
