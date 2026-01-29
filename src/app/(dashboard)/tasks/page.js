'use client';

import { useState, useEffect } from 'react';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('instance'); // 'instance' or 'user'

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group tasks by instance or user
    const groupedTasks = tasks.reduce((acc, task) => {
        const key = groupBy === 'instance'
            ? task.instanceName
            : task.assignee?.name || 'Unassigned';

        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(task);
        return acc;
    }, {});

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
                    <p className="text-muted mt-1">View all tasks across all instances</p>
                </div>

                {/* Group by toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Group by:</span>
                    <div className="flex rounded-xl bg-card border border-border overflow-hidden">
                        <button
                            onClick={() => setGroupBy('instance')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${groupBy === 'instance'
                                    ? 'bg-primary text-white'
                                    : 'text-muted hover:text-foreground'
                                }`}
                        >
                            Instance
                        </button>
                        <button
                            onClick={() => setGroupBy('user')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${groupBy === 'user'
                                    ? 'bg-primary text-white'
                                    : 'text-muted hover:text-foreground'
                                }`}
                        >
                            User
                        </button>
                    </div>
                </div>
            </div>

            {/* Tasks */}
            {loading ? (
                <div className="text-center py-12 text-muted">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-muted">No tasks found. Create an instance from a template to generate tasks.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                        <div key={groupName}>
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-lg font-semibold text-foreground">{groupName}</h2>
                                <span className="badge bg-muted/20 text-muted">{groupTasks.length} tasks</span>
                            </div>

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="w-16">#</th>
                                            <th>Task Name</th>
                                            {groupBy === 'instance' && <th>Assigned To</th>}
                                            {groupBy === 'user' && <th>Instance</th>}
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupTasks
                                            .sort((a, b) => a.order - b.order)
                                            .map((task) => (
                                                <tr key={task._id}>
                                                    <td>
                                                        <span className="task-order">{task.order}</span>
                                                    </td>
                                                    <td className="font-medium">{task.name}</td>
                                                    {groupBy === 'instance' && (
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary font-medium">
                                                                    {task.assignee?.name?.charAt(0) || '?'}
                                                                </div>
                                                                <span className="text-foreground">{task.assignee?.name || 'Unassigned'}</span>
                                                            </div>
                                                        </td>
                                                    )}
                                                    {groupBy === 'user' && (
                                                        <td className="text-muted">{task.instanceName}</td>
                                                    )}
                                                    <td className="text-muted">
                                                        {new Date(task.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {!loading && tasks.length > 0 && (
                <div className="mt-8 card bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-foreground font-medium">Total Tasks</p>
                            <p className="text-muted text-sm">Across all instances</p>
                        </div>
                        <span className="text-4xl font-bold text-primary">{tasks.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
