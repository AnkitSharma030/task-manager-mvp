import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Template from '@/models/Template';

// GET - List all templates
export async function GET() {
    try {
        await connectDB();

        const templates = await Template.find({})
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Get templates error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}

// POST - Create new template
export async function POST(request) {
    try {
        const { name, description, tasks } = await request.json();

        if (!name || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return NextResponse.json(
                { error: 'Name and at least one task are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const template = await Template.create({
            name,
            description: description || '',
            tasks,
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error('Create template error:', error);
        return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
        );
    }
}
