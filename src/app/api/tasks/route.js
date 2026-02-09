import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';

// GET - List tasks based on user role
export async function GET(request) {
    try {
        await connectDB();

        // Get user info from headers (set by middleware)
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        console.log('🔍 DEBUG - GET /api/tasks:', { userId, userRole });

        let query = {};

        if (userRole === 'Admin') {
            // Admin sees all tasks
            query = {};
        } else if (userRole === 'Reviewer') {
            // Reviewer sees submitted tasks (for review) AND tasks assigned to them (if any)
            query = {
                $or: [
                    { status: 'Submitted' },
                    { assignee: userId }
                ]
            };
        } else if (userRole === 'Designer') {
            // Designer sees all Approved tasks (regardless of assignee)
            // They pick up any approved work that needs design
            query = {
                status: 'Approved'
            };
        } else {
            // Standard Members (Marketer, etc.) see all their assigned tasks
            query = {
                assignee: userId
            };
        }

        console.log('🔍 Query:', JSON.stringify(query));

        const tasks = await Task.find(query)
            .populate('assignee', 'name email')
            .populate('instance', 'name')
            .sort({ instance: 1, order: 1 })
            .lean();

        // Transform to include instanceName for frontend compatibility
        const enrichedTasks = tasks.map(task => ({
            ...task,
            instanceName: task.instance?.name || 'Unknown',
        }));

        console.log(`✅ [${userRole}] Fetched ${enrichedTasks.length} tasks:`);
        enrichedTasks.forEach(t => {
            console.log(`   - ${t.name} | Status: ${t.status} | Assignee: ${t.assignee?.name} | Order: ${t.order}`);
        });

        return NextResponse.json(enrichedTasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}
