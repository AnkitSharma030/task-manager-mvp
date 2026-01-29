'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, PageHeader, Button, LoadingState } from '@/components/ui';
import { CheckSquare, FilePlus, Layers, LayersPlus, LayoutTemplate, User, UserPlus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { authFetch } = useAuth();
    const router = useRouter();
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
            icon: <Users className="w-6 h-6" />,
            color: 'from-blue-500 to-blue-600',
        },
        {
            label: 'Templates',
            value: stats.templates,
            icon: <LayoutTemplate className="w-6 h-6" />,
            color: 'from-purple-500 to-purple-600',
        },
        {
            label: 'Instances',
            value: stats.instances,
            icon: <Layers className="w-6 h-6" />,
            color: 'from-green-500 to-green-600',
        },
        {
            label: 'Total Tasks',
            value: stats.tasks,
            icon: <CheckSquare className="w-6 h-6" />,
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
                        <Button
                            variant="secondary"
                            className="justify-start gap-2"
                            onClick={() => router.push('/users')}
                        >
                            <UserPlus className="w-5 h-5" />
                            Add New User
                        </Button>

                        <Button
                            variant="secondary"
                            className="justify-start gap-2"
                            onClick={() => router.push('/templates')}
                        >
                            <FilePlus className="w-5 h-5" />
                            Create Template
                        </Button>

                        <Button
                            variant="secondary"
                            className="justify-start gap-2"
                            onClick={() => router.push('/instances')}
                        >
                            <LayersPlus className="w-5 h-5" />
                            Create Instance
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
