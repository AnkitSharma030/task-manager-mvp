'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    PageHeader, Button, Alert, LoadingState, EmptyState,
    Card, CardHeader, CardTitle, CardContent, CardFooter,
    Modal, ModalFooter, Input, Select, Badge, Avatar
} from '@/components/ui';
import { Plus } from 'lucide-react';

export default function InstancesPage() {
    const { authFetch } = useAuth();
    const [instances, setInstances] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    // Updated formData to hold assignees map instead of single assigneeId
    const [formData, setFormData] = useState({ name: '', templateId: '', assignees: {} });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [instancesRes, templatesRes, usersRes] = await Promise.all([
                authFetch('/api/instances'),
                authFetch('/api/templates'),
                authFetch('/api/users'),
            ]);

            const [instancesData, templatesData, usersData] = await Promise.all([
                instancesRes.json(),
                templatesRes.json(),
                usersRes.json(),
            ]);

            setInstances(Array.isArray(instancesData) ? instancesData : []);
            setTemplates(Array.isArray(templatesData) ? templatesData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setSubmitting(true);

        try {
            const res = await authFetch('/api/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create instance');
            }

            setSuccessMessage(`Instance created! ${data.tasksCreated} tasks created.`);

            // Optimistic update
            setInstances(prev => [data, ...prev]);

            setTimeout(() => {
                setShowModal(false);
                setFormData({ name: '', templateId: '', assignees: {} });
                setSuccessMessage('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedTemplate = templates.find((t) => t._id === formData.templateId);

    // Derived state: Get unique roles required by the selected template
    const requiredRoles = selectedTemplate
        ? [...new Set(selectedTemplate.tasks.map(t => t.role))]
        : [];

    const handleAssigneeChange = (role, userId) => {
        setFormData(prev => ({
            ...prev,
            assignees: {
                ...prev.assignees,
                [role]: userId
            }
        }));
    };

    if (loading) {
        return <LoadingState message="Loading instances..." />;
    }

    const canCreate = templates.length > 0 && users.length > 0;

    return (
        <div>
            <PageHeader
                title="Instances"
                description="Create project instances from templates"
                action={
                    <Button onClick={() => setShowModal(true)} disabled={!canCreate}>
                        <Plus className="w-5 h-5" />
                        Create Instance
                    </Button>
                }
            />

            {!canCreate && (
                <Alert variant="warning" className="mb-6">
                    {templates.length === 0 && "You need to create a template first. "}
                    {users.length === 0 && "You need to create users first."}
                </Alert>
            )}

            {instances.length === 0 ? (
                <EmptyState
                    title="No instances found"
                    description="Create your first instance from a template!"
                />
            ) : (
                <div className="space-y-6">
                    {instances?.map((instance) => (
                        <Card key={instance?._id}>
                            <CardHeader>
                                <div>
                                    <CardTitle>{instance?.name}</CardTitle>
                                    <p className="text-muted text-sm">Template: {instance?.templateName}</p>
                                </div>
                                <Badge variant="success">{instance?.tasks?.length || 0} tasks</Badge>
                            </CardHeader>

                            <CardContent className="space-y-2">
                                {instance?.tasks?.map((task) => (
                                    <div key={task?._id} className="task-item">
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="task-order">{task?.order}</span>
                                            <div className="flex flex-col">
                                                <span className="text-foreground">{task?.name}</span>
                                                <span className="text-xs text-muted">
                                                    STATUS: <span className="font-medium text-primary">{task?.status}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Avatar name={task?.assignee?.name} size="sm" />
                                            <div className="flex flex-col items-end">
                                                <span className="text-muted text-sm">{task?.assignee?.name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>

                            <CardFooter className="text-xs text-muted">
                                Created: {new Date(instance?.createdAt).toLocaleDateString()}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Instance">
                {error && <Alert variant="error" className="mb-4">{error}</Alert>}
                {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Instance Name"
                        placeholder="e.g., Company Website v1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Select
                        label="Select Template"
                        placeholder="Choose a template..."
                        value={formData.templateId}
                        onChange={(e) => setFormData({ ...formData, templateId: e.target.value, assignees: {} })}
                        options={templates.map((t) => ({ value: t._id, label: `${t.name} (${t.tasks.length} tasks)` }))}
                        required
                    />

                    {selectedTemplate && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-muted/10 border border-border">
                                <p className="text-sm font-medium mb-3">Assign Roles</p>
                                <div className="space-y-3">
                                    {requiredRoles.map((role) => (
                                        <div key={role}>
                                            <Select
                                                label={`Assign ${role}`}
                                                placeholder={`Select a ${role}...`}
                                                value={formData.assignees[role] || ''}
                                                onChange={(e) => handleAssigneeChange(role, e.target.value)}
                                                options={
                                                    users
                                                        // Filter users by role, or show all if role is Member (generic)
                                                        // Or just show all users sorted such that matching roles come first?
                                                        // For MVP, strict filtering helps reduce error.
                                                        .filter(u => u.role === role || u.role === 'Admin' || (role === 'Member' && u.role === 'Member'))
                                                        .map((u) => ({ value: u._id, label: `${u.name} (${u.role})` }))
                                                }
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-muted/10 border border-border">
                                <p className="text-sm text-muted mb-2">Tasks Preview:</p>
                                <div className="space-y-1">
                                    {selectedTemplate.tasks.map((task, index) => (
                                        <div key={index} className="text-sm text-foreground flex items-center gap-2">
                                            <span className="text-muted">{index + 1}.</span>
                                            <span>{task.name}</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">{task.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <ModalFooter>
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" loading={submitting}>
                            Create Instance
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
}
