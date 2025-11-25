import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    const { username, password, role } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ username });

    if (user) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({ username, password: hashedPassword, role });

    const response = NextResponse.json({ message: 'User creation successful.' });
    await db.collection('event_log').insertOne({ type: 'User created', timestamp: new Date(), details: { username, role } });
    return response;
}

export async function GET() {
    const client = await clientPromise;
    const db = client.db();
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    return NextResponse.json(users);
}

export async function DELETE(req: Request) {
    const client = await clientPromise;
    const db = client.db();
    try {
        const { username } = await req.json();
        const deleteResult = await db.collection('users').deleteOne({
            username: username
        });
        if (deleteResult.deletedCount === 1) {
            await db.collection('event_log').insertOne({ type: 'User deleted', timestamp: new Date(), details: { username } });
            return NextResponse.json({ message: 'User deleted successfully' });
        }
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
    }
}