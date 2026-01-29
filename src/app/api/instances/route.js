import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - List all instances with their tasks
export async function GET() {
    try {
        const db = await getDb();
        const instancesCollection = db.collection('instances');
        const tasksCollection = db.collection('tasks');
        const templatesCollection = db.collection('templates');
        const usersCollection = db.collection('users');

        const instances = await instancesCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // Enrich instances with template name, tasks, and assignee
        const enrichedInstances = await Promise.all(
            instances.map(async (instance) => {
                const template = await templatesCollection.findOne({
                    _id: new ObjectId(instance.templateId),
                });

                const tasks = await tasksCollection
                    .find({ instanceId: instance._id.toString() })
                    .sort({ order: 1 })
                    .toArray();

                // Get assignee info for tasks
                const tasksWithAssignee = await Promise.all(
                    tasks.map(async (task) => {
                        const assignee = await usersCollection.findOne(
                            { _id: new ObjectId(task.assigneeId) },
                            { projection: { password: 0 } }
                        );
                        return { ...task, assignee };
                    })
                );

                return {
                    ...instance,
                    templateName: template?.name || 'Unknown',
                    tasks: tasksWithAssignee,
                };
            })
        );

        return NextResponse.json(enrichedInstances);
    } catch (error) {
        console.error('Get instances error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch instances' },
            { status: 500 }
        );
    }
}

// POST - Create new instance and generate tasks
export async function POST(request) {
    try {
        const { name, templateId, assigneeId } = await request.json();

        if (!name || !templateId || !assigneeId) {
            return NextResponse.json(
                { error: 'Name, template, and assignee are required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const templatesCollection = db.collection('templates');
        const instancesCollection = db.collection('instances');
        const tasksCollection = db.collection('tasks');
        const usersCollection = db.collection('users');

        // Verify template exists
        const template = await templatesCollection.findOne({
            _id: new ObjectId(templateId),
        });
        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Verify assignee exists
        const assignee = await usersCollection.findOne({
            _id: new ObjectId(assigneeId),
        });
        if (!assignee) {
            return NextResponse.json(
                { error: 'Assignee not found' },
                { status: 404 }
            );
        }

        // Create instance
        const instanceData = {
            name,
            templateId,
            createdAt: new Date(),
        };

        const instanceResult = await instancesCollection.insertOne(instanceData);
        const instanceId = instanceResult.insertedId.toString();

        // Create tasks from template
        const tasksToInsert = template.tasks.map((taskName, index) => ({
            name: taskName,
            order: index + 1,
            instanceId,
            assigneeId,
            createdAt: new Date(),
        }));

        await tasksCollection.insertMany(tasksToInsert);

        return NextResponse.json({
            _id: instanceResult.insertedId,
            ...instanceData,
            templateName: template.name,
            tasksCreated: tasksToInsert.length,
            assigneeName: assignee.name,
        }, { status: 201 });
    } catch (error) {
        console.error('Create instance error:', error);
        return NextResponse.json(
            { error: 'Failed to create instance' },
            { status: 500 }
        );
    }
}
