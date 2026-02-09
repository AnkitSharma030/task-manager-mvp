'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    PageHeader, LoadingState, EmptyState, Card, Badge, Avatar,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button, Select
} from '@/components/ui';

export default function TasksPage() {
    const { authFetch, user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]); // Store users for dropdown
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('instance');
    const [updating, setUpdating] = useState(null);
    const [selectedReviewers, setSelectedReviewers] = useState({}); // Map taskId -> reviewerId

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchTasks(), fetchUsers()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await authFetch('/api/tasks');
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await authFetch('/api/users');
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus, needsFeedback = false, newAssigneeId = null) => {
        let feedback = '';
        if (needsFeedback) {
            feedback = window.prompt('Please provide feedback for changes:');
            if (feedback === null) return;
        }

        setUpdating(taskId);
        try {
            const payload = { status: newStatus, feedback };
            if (newAssigneeId) {
                payload.assigneeId = newAssigneeId;
            }

            const res = await authFetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // Refresh tasks to see updates (including auto-activated next tasks)
                fetchTasks();
                // Clear selection
                setSelectedReviewers(prev => {
                    const next = { ...prev };
                    delete next[taskId];
                    return next;
                });
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update task');
            }
        } catch (error) {
            console.error('Failed to update task:', error);
        } finally {
            setUpdating(null);
        }
    };

    const groupedTasks = tasks.reduce((acc, task) => {
        const key = groupBy === 'instance'
            ? task.instanceName
            : task.assignee?.name || 'Unassigned';

        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
    }, {});

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Approved': return 'success';
            case 'Submitted': return 'warning';
            case 'Changes Requested': return 'danger';
            case 'Assigned': return 'info';
            case 'In Progress': return 'info';
            default: return 'neutral';
        }
    };

    const reviewers = users.filter(u => u.role === 'Reviewer' || u.role === 'Admin');

    const renderActions = (task) => {
        if (updating === task._id) return <span className="text-sm text-muted">Updating...</span>;

        // Safe ID comparison
        const currentUserId = user?._id?.toString();
        const assigneeId = task.assignee?._id?.toString() || task.assignee?.toString();

        console.log('🔍 DEBUG renderActions:', {
            taskName: task.name,
            taskStatus: task.status,
            currentUserId,
            assigneeId,
            userRole: user?.role,
            match: currentUserId === assigneeId
        });

        const isAssignee = currentUserId && assigneeId && currentUserId === assigneeId;
        const isReviewer = user?.role === 'Reviewer' || user?.role === 'Admin';

        // PRIORITY 1: Reviewer Actions on Submitted tasks
        // This must come first to handle the Reviewer approval workflow
        if (isAssignee && isReviewer && task.status === 'Submitted') {
            return (
                <div className="flex gap-2">
                    <Button
                        size="sm" variant="success"
                        onClick={() => handleStatusUpdate(task._id, 'Approved')}
                    >
                        Approve
                    </Button>
                    <Button
                        size="sm" variant="danger"
                        onClick={() => handleStatusUpdate(task._id, 'Changes Requested', true)}
                    >
                        Request Changes
                    </Button>
                </div>
            );
        }

        // PRIORITY 2: Marketer / Designer Actions
        if (isAssignee) {
            if (task.status === 'Assigned' || task.status === 'Changes Requested') {
                return (
                    <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(task._id, 'In Progress')}
                    >
                        Start Task
                    </Button>
                );
            }
            if (task.status === 'In Progress') {
                return (
                    <div className="flex flex-col gap-2">
                        <Select
                            placeholder="Select Reviewer"
                            options={reviewers.map(r => ({ value: r._id, label: r.name }))}
                            value={selectedReviewers[task._id] || ''}
                            onChange={(e) => setSelectedReviewers(prev => ({ ...prev, [task._id]: e.target.value }))}
                            className="w-40"
                        />
                        <Button
                            size="sm"
                            disabled={!selectedReviewers[task._id]}
                            onClick={() => handleStatusUpdate(task._id, 'Submitted', false, selectedReviewers[task._id])}
                        >
                            Submit to Reviewer
                        </Button>
                    </div>
                );
            }
        }

        return null; // No actions available
    };

    if (loading) {
        return <LoadingState message="Loading tasks..." />;
    }

    return (
        <div>
            <PageHeader
                title="Tasks"
                description="Manage your assigned tasks and reviews"
                action={
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted hidden sm:inline">Group by:</span>
                        <div className="flex rounded-xl bg-card border border-border overflow-hidden">
                            <button
                                onClick={() => setGroupBy('instance')}
                                className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${groupBy === 'instance' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
                                    }`}
                            >
                                Instance
                            </button>
                            <button
                                onClick={() => setGroupBy('user')}
                                className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${groupBy === 'user' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
                                    }`}
                            >
                                User
                            </button>
                        </div>
                    </div>
                }
            />

            {tasks?.length === 0 ? (
                <EmptyState
                    title="No tasks found"
                    description="You have no pending tasks or reviews."
                />
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                        <div key={groupName}>
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-lg font-semibold text-foreground">{groupName}</h2>
                                <Badge>{groupTasks.length} tasks</Badge>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">#</TableHead>
                                        <TableHead>Task Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        {groupBy === 'instance' && <TableHead>Assigned To</TableHead>}
                                        {groupBy === 'user' && <TableHead>Instance</TableHead>}
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groupTasks
                                        .sort((a, b) => a.order - b.order)
                                        .map((task) => (
                                            <TableRow key={task._id}>
                                                <TableCell>
                                                    <span className="task-order">{task?.order}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{task?.name}</span>
                                                        {task?.feedback && (
                                                            <span className="text-xs text-danger mt-1">Feedback: {task.feedback}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(task.status)}>
                                                        {task?.status}
                                                    </Badge>
                                                </TableCell>
                                                {groupBy === 'instance' && (
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar name={task?.assignee?.name} size="sm" />
                                                            <span className="text-foreground hidden sm:inline">{task?.assignee?.name || 'Unassigned'}</span>
                                                        </div>
                                                    </TableCell>
                                                )}
                                                {groupBy === 'user' && (
                                                    <TableCell className="text-muted">{task?.instanceName}</TableCell>
                                                )}
                                                <TableCell>
                                                    {renderActions(task)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
