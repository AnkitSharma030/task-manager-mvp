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
    const [formData, setFormData] = useState({ name: '', templateId: '', assigneeId: '' });
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

            setSuccessMessage(`Instance created! ${data.tasksCreated} tasks assigned to ${data.assigneeName}.`);

            const instancesRes = await authFetch('/api/instances');
            const instancesData = await instancesRes.json();
            setInstances(Array.isArray(instancesData) ? instancesData : []);

            setTimeout(() => {
                setShowModal(false);
                setFormData({ name: '', templateId: '', assigneeId: '' });
                setSuccessMessage('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedTemplate = templates.find((t) => t._id === formData.templateId);

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
                                        <span className="task-order">{task?.order}</span>
                                        <div className="flex-1">
                                            <span className="text-foreground">{task?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Avatar name={task?.assignee?.name} size="sm" />
                                            <span className="text-muted text-sm">{Ztask?.assignee?.name || 'Unassigned'}</span>
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
                        onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                        options={templates.map((t) => ({ value: t._id, label: `${t.name} (${t.tasks.length} tasks)` }))}
                        required
                    />

                    {selectedTemplate && (
                        <div className="p-4 rounded-xl bg-muted/10 border border-border">
                            <p className="text-sm text-muted mb-2">Tasks that will be created:</p>
                            <div className="space-y-1">
                                {selectedTemplate.tasks.map((task, index) => (
                                    <div key={index} className="text-sm text-foreground flex items-center gap-2">
                                        <span className="text-muted">{index + 1}.</span> {task}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <Select
                            label="Assign To (Doer)"
                            placeholder="Select a user..."
                            value={formData.assigneeId}
                            onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                            options={users.map((u) => ({ value: u._id, label: `${u.name} (${u.role})` }))}
                            required
                        />
                        <p className="text-xs text-muted mt-1">All tasks will be assigned to this user</p>
                    </div>

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
