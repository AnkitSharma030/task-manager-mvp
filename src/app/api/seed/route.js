import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
    try {
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'Admin' });
        if (existingAdmin) {
            return NextResponse.json(
                { message: 'Admin user already exists', email: existingAdmin.email },
                { status: 200 }
            );
        }

        // Create default admin user
        const hashedPassword = await hashPassword('admin123');
        const adminUser = await User.create({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'Admin',
        });

        return NextResponse.json({
            message: 'Admin user created successfully',
            email: adminUser.email,
            role: adminUser.role,
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { error: 'Failed to seed database' },
            { status: 500 }
        );
    }
}
