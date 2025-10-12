// pages/api/events.ts
import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const events = await db.collection('event_log').find({}).sort({ timestamp: -1 }).toArray();
  return NextResponse.json(events);
}