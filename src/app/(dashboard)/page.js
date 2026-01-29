'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, PageHeader, Button, LoadingState } from '@/components/ui';

export default function DashboardPage() {
    const { authFetch } = useAuth();
    const [stats, setStats] = useState({
        users: 0,
        templates: 0,
        instances: 0,
        tasks: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [usersRes, templatesRes, instancesRes, tasksRes] = await Promise.all([
                    authFetch('/api/users'),
                    authFetch('/api/templates'),
                    authFetch('/api/instances'),
                    authFetch('/api/tasks'),
                ]);

                const [users, templates, instances, tasks] = await Promise.all([
                    usersRes.json(),
                    templatesRes.json(),
                    instancesRes.json(),
                    tasksRes.json(),
                ]);

                setStats({
                    users: Array.isArray(users) ? users.length : 0,
                    templates: Array.isArray(templates) ? templates.length : 0,
                    instances: Array.isArray(instances) ? instances.length : 0,
                    tasks: Array.isArray(tasks) ? tasks.length : 0,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [authFetch]);

    const statsCards = [
        {
            label: 'Total Users',
            value: stats.users,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'from-blue-500 to-blue-600',
        },
        {
            label: 'Templates',
            value: stats.templates,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            ),
            color: 'from-purple-500 to-purple-600',
        },
        {
            label: 'Instances',
            value: stats.instances,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            color: 'from-green-500 to-green-600',
        },
        {
            label: 'Total Tasks',
            value: stats.tasks,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            color: 'from-orange-500 to-orange-600',
        },
    ];

    if (loading) {
        return <LoadingState message="Loading dashboard..." />;
    }

    return (
        <div>
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's an overview of your task management system."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {statsCards.map((card) => (
                    <div key={card.label} className="stats-card">
                        <div className={`icon bg-gradient-to-br ${card.color} text-white`}>
                            {card.icon}
                        </div>
                        <div className="value">{card.value}</div>
                        <div className="label">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button variant="secondary" className="justify-start" onClick={() => window.location.href = '/users'}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Add New User
                        </Button>
                        <Button variant="secondary" className="justify-start" onClick={() => window.location.href = '/templates'}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Template
                        </Button>
                        <Button variant="secondary" className="justify-start" onClick={() => window.location.href = '/instances'}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Instance
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
