import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET - List all templates
export async function GET() {
    try {
        const db = await getDb();
        const templatesCollection = db.collection('templates');

        const templates = await templatesCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

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

        const db = await getDb();
        const templatesCollection = db.collection('templates');

        const templateData = {
            name,
            description: description || '',
            tasks, // Array of task names in order
            createdAt: new Date(),
        };

        const result = await templatesCollection.insertOne(templateData);

        return NextResponse.json({
            _id: result.insertedId,
            ...templateData,
        }, { status: 201 });
    } catch (error) {
        console.error('Create template error:', error);
        return NextResponse.json(
            { error: 'Failed to create template' },
            { status: 500 }
        );
    }
}
