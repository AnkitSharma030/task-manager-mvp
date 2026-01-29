import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';

// GET - List all tasks with assignee and instance info
export async function GET() {
    try {
        await connectDB();

        const tasks = await Task.find({})
            .populate('assignee', 'name email')
            .populate('instance', 'name')
            .sort({ instance: 1, order: 1 })
            .lean();

        // Transform to include instanceName for frontend compatibility
        const enrichedTasks = tasks.map(task => ({
            ...task,
            instanceName: task.instance?.name || 'Unknown',
        }));

        return NextResponse.json(enrichedTasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}
