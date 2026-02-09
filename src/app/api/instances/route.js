import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Instance from '@/models/Instance';
import Template from '@/models/Template';
import Task from '@/models/Task';
import User from '@/models/User';

// GET - List all instances with their tasks
export async function GET(request) {
    const role = request.headers.get('x-user-role');
    if (role !== 'Admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        await connectDB();

        const instances = await Instance.find({})
            .populate('template', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Optimized: Fetch all tasks for these instances in one query
        const instanceIds = instances.map(i => i._id);

        const allTasks = await Task.find({ instance: { $in: instanceIds } })
            .populate('assignee', 'name email')
            .sort({ order: 1 })
            .lean();

        // Group tasks by instance ID for O(1) lookup during map
        const tasksByInstance = {};
        allTasks.forEach(task => {
            const instanceId = task.instance.toString();
            if (!tasksByInstance[instanceId]) {
                tasksByInstance[instanceId] = [];
            }
            tasksByInstance[instanceId].push(task);
        });

        // Attach tasks to instances
        const enrichedInstances = instances.map(instance => ({
            ...instance,
            templateName: instance.template?.name || 'Unknown',
            tasks: tasksByInstance[instance._id.toString()] || [],
        }));

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
    const role = request.headers.get('x-user-role');
    if (role !== 'Admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { name, templateId, assignees } = await request.json();

        // assignees is expected to be an object: { "Marketer": "userId1", "Reviewer": "userId2", ... }

        if (!name || !templateId || !assignees) {
            return NextResponse.json(
                { error: 'Name, template, and assignees are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Validate that all roles required by the template are provided in assignees
        const requiredRoles = [...new Set(template.tasks.map(t => t.role))];
        const missingRoles = requiredRoles.filter(role => !assignees[role]);

        if (missingRoles.length > 0) {
            return NextResponse.json(
                { error: `Missing assignees for roles: ${missingRoles.join(', ')}` },
                { status: 400 }
            );
        }

        // Create instance
        const instance = await Instance.create({
            name,
            template: templateId,
        });

        // Create tasks from template
        const tasksToCreate = template.tasks.map((templateTask, index) => {
            const assigneeId = assignees[templateTask.role];

            // First task is Assigned, others are Pending
            const initialStatus = index === 0 ? 'Assigned' : 'Pending';

            return {
                name: templateTask.name,
                order: templateTask.order,
                instance: instance._id,
                assignee: assigneeId,
                status: initialStatus
            };
        });

        await Task.insertMany(tasksToCreate);

        return NextResponse.json({
            _id: instance._id,
            name: instance.name,
            templateName: template.name,
            tasksCreated: tasksToCreate.length,
            assignees,
            createdAt: instance.createdAt,
        }, { status: 201 });
    } catch (error) {
        console.error('Create instance error:', error);
        return NextResponse.json(
            { error: 'Failed to create instance' },
            { status: 500 }
        );
    }
}
