import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

// GET - List all users
// GET - List all users
export async function GET(request) {
    // Allow any authenticated user to fetch users (needed for assigning reviewers)
    // Middleware adds x-user-id header if authenticated
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await connectDB();

        const users = await User.find({})
            .sort({ createdAt: -1 })
            .lean();

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
    const roleHeader = request.headers.get('x-user-role');
    if (roleHeader !== 'Admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { name, email, role, password } = await request.json();

        if (!name || !email || !role) {
            return NextResponse.json(
                { error: 'Name, email, and role are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if email already exists
        const existingUser = await User.findOne({ email });
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
            password: await hashPassword(password),
        };

        // Only hash password if provided (for admin users)
        if (password && role === 'Admin') {
            userData.password = await hashPassword(password);
        }
        const user = await User.create(userData);

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
