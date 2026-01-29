'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    PageHeader, LoadingState, EmptyState, Card, Badge, Avatar,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui';

export default function TasksPage() {
    const { authFetch } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('instance');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await authFetch('/api/tasks');
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
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

    if (loading) {
        return <LoadingState message="Loading tasks..." />;
    }

    return (
        <div>
            <PageHeader
                title="Tasks"
                description="View all tasks across all instances"
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

            {tasks.length === 0 ? (
                <EmptyState
                    title="No tasks found"
                    description="Create an instance from a template to generate tasks."
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
                                        {groupBy === 'instance' && <TableHead>Assigned To</TableHead>}
                                        {groupBy === 'user' && <TableHead>Instance</TableHead>}
                                        <TableHead className="hidden sm:table-cell">Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groupTasks
                                        .sort((a, b) => a.order - b.order)
                                        .map((task) => (
                                            <TableRow key={task._id}>
                                                <TableCell>
                                                    <span className="task-order">{task.order}</span>
                                                </TableCell>
                                                <TableCell className="font-medium">{task.name}</TableCell>
                                                {groupBy === 'instance' && (
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar name={task.assignee?.name} size="sm" />
                                                            <span className="text-foreground hidden sm:inline">{task.assignee?.name || 'Unassigned'}</span>
                                                        </div>
                                                    </TableCell>
                                                )}
                                                {groupBy === 'user' && (
                                                    <TableCell className="text-muted">{task.instanceName}</TableCell>
                                                )}
                                                <TableCell className="text-muted hidden sm:table-cell">
                                                    {new Date(task.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))}

                    {/* Summary */}
                    <Card className="bg-primary/5 border-primary/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-foreground font-medium">Total Tasks</p>
                                <p className="text-muted text-sm">Across all instances</p>
                            </div>
                            <span className="text-4xl font-bold text-primary">{tasks.length}</span>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
