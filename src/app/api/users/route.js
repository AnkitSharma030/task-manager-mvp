import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET - List all users
export async function GET() {
    try {
        const db = await getDb();
        const usersCollection = db.collection('users');

        const users = await usersCollection
            .find({}, { projection: { password: 0 } })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST - Create new user
export async function POST(request) {
    try {
        const { name, email, role, password } = await request.json();

        if (!name || !email || !role) {
            return NextResponse.json(
                { error: 'Name, email, and role are required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const usersCollection = db.collection('users');

        // Check if email already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        const userData = {
            name,
            email,
            role,
            createdAt: new Date(),
        };

        // Only hash password if provided (for admin users)
        if (password && role === 'Admin') {
            userData.password = await hashPassword(password);
        }

        const result = await usersCollection.insertOne(userData);

        return NextResponse.json({
            _id: result.insertedId,
            ...userData,
            password: undefined,
        }, { status: 201 });
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
