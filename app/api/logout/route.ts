import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { cookies } from "next/headers";

// For App Router (Next.js 13+)
export async function POST() {
  const response = NextResponse.json({ success: true });
  // Set the auth-token cookie to expire immediately
  const client = await clientPromise;
  const db = client.db();
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;
  response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
  await db.collection('event_log').insertOne({ type: 'User logout', timestamp: new Date(), details: { username } });
  return response;
}