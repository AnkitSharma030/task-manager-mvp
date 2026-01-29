import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - List all tasks with assignee and instance info
export async function GET() {
    try {
        const db = await getDb();
        const tasksCollection = db.collection('tasks');
        const usersCollection = db.collection('users');
        const instancesCollection = db.collection('instances');

        const tasks = await tasksCollection
            .find({})
            .sort({ instanceId: 1, order: 1 })
            .toArray();

        // Enrich tasks with assignee and instance info
        const enrichedTasks = await Promise.all(
            tasks.map(async (task) => {
                const assignee = await usersCollection.findOne(
                    { _id: new ObjectId(task.assigneeId) },
                    { projection: { password: 0 } }
                );

                const instance = await instancesCollection.findOne({
                    _id: new ObjectId(task.instanceId),
                });

                return {
                    ...task,
                    assignee,
                    instanceName: instance?.name || 'Unknown',
                };
            })
        );

        return NextResponse.json(enrichedTasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}
