import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
    try {
        const db = await getDb();
        const usersCollection = db.collection('users');

        // Check if admin already exists
        const existingAdmin = await usersCollection.findOne({ role: 'Admin' });
        if (existingAdmin) {
            return NextResponse.json(
                { message: 'Admin user already exists', email: existingAdmin.email },
                { status: 200 }
            );
        }

        // Create default admin user
        const hashedPassword = await hashPassword('admin123');
        const adminUser = {
            name: 'Admin',
            email: 'admin@taskmanager.com',
            password: hashedPassword,
            role: 'Admin',
            createdAt: new Date(),
        };

        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.insertOne(adminUser);

        return NextResponse.json({
            message: 'Admin user created successfully',
            email: adminUser.email,
            password: 'admin123',
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { error: 'Failed to seed database' },
            { status: 500 }
        );
    }
}
