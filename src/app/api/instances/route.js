import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Instance from '@/models/Instance';
import Template from '@/models/Template';
import Task from '@/models/Task';
import User from '@/models/User';

// GET - List all instances with their tasks
export async function GET() {
    try {
        await connectDB();

        const instances = await Instance.find({})
            .populate('template', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Get tasks for each instance
        const enrichedInstances = await Promise.all(
            instances.map(async (instance) => {
                const tasks = await Task.find({ instance: instance._id })
                    .populate('assignee', 'name email')
                    .sort({ order: 1 })
                    .lean();

                return {
                    ...instance,
                    templateName: instance.template?.name || 'Unknown',
                    tasks,
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

        await connectDB();

        // Verify template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Verify assignee exists
        const assignee = await User.findById(assigneeId);
        if (!assignee) {
            return NextResponse.json(
                { error: 'Assignee not found' },
                { status: 404 }
            );
        }

        // Create instance
        const instance = await Instance.create({
            name,
            template: templateId,
        });

        // Create tasks from template
        const tasksToCreate = template.tasks.map((taskName, index) => ({
            name: taskName,
            order: index + 1,
            instance: instance._id,
            assignee: assigneeId,
        }));

        await Task.insertMany(tasksToCreate);

        return NextResponse.json({
            _id: instance._id,
            name: instance.name,
            templateName: template.name,
            tasksCreated: tasksToCreate.length,
            assigneeName: assignee.name,
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
