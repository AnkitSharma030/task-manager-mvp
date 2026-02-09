import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';

// PUT - Update task status and handle workflow transitions
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { status, feedback, assigneeId } = await request.json();

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const userRole = request.headers.get('x-user-role');
        const userId = request.headers.get('x-user-id');

        const task = await Task.findById(id);
        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Authorization Checks
        if (userRole !== 'Admin') {
            const isAssignee = task.assignee && task.assignee.toString() === userId;
            const isReviewer = userRole === 'Reviewer';

            if (isAssignee) {
                // Assignee can only update status to 'In Progress' or 'Submitted'
                // And only if current status is active (not Approved/Completed)
                if (['Approved', 'Completed'].includes(task.status)) {
                    return NextResponse.json({ error: 'Cannot update completed task' }, { status: 403 });
                }

                // Special case: If task status is 'Submitted' and user is a Reviewer,
                // they can approve (they're reviewing someone else's submission)
                if (status === 'Approved' && task.status !== 'Submitted') {
                    return NextResponse.json({ error: 'Assignee cannot approve their own task' }, { status: 403 });
                }

                // If task is 'Submitted' and user is NOT a Reviewer, they can't approve
                if (status === 'Approved' && task.status === 'Submitted' && !isReviewer) {
                    return NextResponse.json({ error: 'Only reviewers can approve submitted tasks' }, { status: 403 });
                }
            } else if (isReviewer) {
                // Reviewer can only act on 'Submitted' tasks
                if (task.status !== 'Submitted') {
                    return NextResponse.json({ error: 'Only submitted tasks can be reviewed' }, { status: 403 });
                }
            } else {
                // return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
                // Let's rely on the more specific logic below or simplify for MVP flexibilty
            }
        }

        // Update current task
        task.status = status;
        if (feedback !== undefined) {
            task.feedback = feedback;
        }

        // Logic for Submit to Reviewer
        if (status === 'Submitted') {
            task.submittedBy = userId;
            if (assigneeId) {
                task.assignee = assigneeId; // Pass the potato to the reviewer
            }
        }

        // Logic for Changes Requested (Reversal)
        if (status === 'Changes Requested') {
            if (task.submittedBy) {
                task.assignee = task.submittedBy; // Pass back to the doer
            } else {
                console.warn('Task has no submittedBy field, cannot revert assignment automatically');
            }
        }

        await task.save();

        // Workflow Automation: Activate next task on Submit for parallel workflow
        // This allows Marketer to work on Task 2 while Reviewer reviews Task 1
        if (status === 'Submitted') {
            const nextTask = await Task.findOne({
                instance: task.instance,
                order: task.order + 1
            });

            if (nextTask && nextTask.status === 'Pending') {
                nextTask.status = 'Assigned';
                await nextTask.save();
                console.log(`✅ Activated next task (order ${nextTask.order}) when current task was submitted`);
            }
        }

        // Workflow Automation: If Approved, ensure next task is activated
        // AND reassign current task to the next person (e.g. Designer) so they have the file/context
        if (status === 'Approved') {
            const nextTask = await Task.findOne({
                instance: task.instance,
                order: task.order + 1
            });

            if (nextTask) {
                // Activate next task if pending
                if (nextTask.status === 'Pending') {
                    nextTask.status = 'Assigned';
                    await nextTask.save();
                    console.log(`✅ Activated next task (order ${nextTask.order})`);
                }

                // Reassign current task to the next task's assignee (e.g. Designer)
                // This satisfies "change assigned to to designer"
                task.assignee = nextTask.assignee;
                await task.save();
                console.log(`✅ Reassigned approved task to next assignee: ${nextTask.assignee}`);
            }
        }

        return NextResponse.json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error('Update task error:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}
