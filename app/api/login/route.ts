import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection('users').findOne({ username});

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  // Issue cookie/token for authentication
  const response = NextResponse.json({ message: 'Login successful.' });
  response.cookies.set('auth-token', 'SOME_GENERATED_TOKEN', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
  response.cookies.set('username', username, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
  await db.collection('event_log').insertOne({ type: 'User login', timestamp: new Date(), details: { username } });
  return response;
}
