'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    PageHeader, Button, Alert, LoadingState, EmptyState,
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
    Modal, ModalFooter, Input, Badge, IconButton
} from '@/components/ui';

import { Minus, Plus } from 'lucide-react';
export default function TemplatesPage() {
    const { authFetch } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', tasks: [''] });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await authFetch('/api/templates');
            const data = await res.json();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const filteredTasks = formData.tasks.filter((t) => t.trim() !== '');

        if (filteredTasks?.length === 0) {
            setError('At least one task is required');
            setSubmitting(false);
            return;
        }

        try {
            const res = await authFetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    tasks: filteredTasks,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create template');
            }

            setTemplates([data, ...templates]);
            setShowModal(false);
            setFormData({ name: '', description: '', tasks: [''] });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const addTask = () => setFormData({ ...formData, tasks: [...formData.tasks, ''] });

    const removeTask = (index) => {
        if (formData.tasks.length > 1) {
            setFormData({ ...formData, tasks: formData.tasks.filter((_, i) => i !== index) });
        }
    };

    const updateTask = (index, value) => {
        const newTasks = [...formData.tasks];
        newTasks[index] = value;
        setFormData({ ...formData, tasks: newTasks });
    };

    if (loading) {
        return <LoadingState message="Loading templates..." />;
    }

    return (
        <div>
            <PageHeader
                title="Templates"
                description="Create reusable task templates for your projects"
                action={
                    <Button onClick={() => setShowModal(true)}>
                        <Plus className="w-5 h-5" />
                        Create Template
                    </Button>
                }
            />

            {templates?.length === 0 ? (
                <EmptyState
                    title="No templates found"
                    description="Create your first template to get started!"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    {templates?.map((template) => (
                        <Card key={template?._id}>
                            <CardHeader>
                                <div>
                                    <CardTitle>{template?.name}</CardTitle>
                                    <CardDescription>{template?.description || 'No description'}</CardDescription>
                                </div>
                                <Badge variant="primary">{template?.tasks?.length} tasks</Badge>
                            </CardHeader>

                            <CardContent className="space-y-2">
                                {template?.tasks?.slice(0, 4).map((task, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <span className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center text-xs text-muted">
                                            {index + 1}
                                        </span>
                                        <span className="text-foreground">{task}</span>
                                    </div>
                                ))}
                                {template?.tasks?.length > 4 && (
                                    <p className="text-muted text-sm ml-8">+{template?.tasks?.length - 4} more tasks</p>
                                )}
                            </CardContent>

                            <CardFooter className="text-xs text-muted">
                                Created: {new Date(template?.createdAt).toLocaleDateString()}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Template" size="lg">
                {error && <Alert variant="error" className="mb-4">{error}</Alert>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Template Name"
                        placeholder="e.g., Website Launch Checklist"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Description"
                        placeholder="Brief description of this template"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div>
                        <label className="label">Tasks</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {formData.tasks.map((task, index) => (
                                <div key={index} className="flex gap-2">
                                    <span className="flex items-center justify-center w-8 h-10 text-sm text-muted">
                                        {index + 1}.
                                    </span>
                                    <input
                                        type="text"
                                        className="input flex-1"
                                        placeholder={`Task ${index + 1}`}
                                        value={task}
                                        onChange={(e) => updateTask(index, e.target.value)}
                                    />
                                    {formData.tasks.length > 1 && (
                                        <IconButton
                                            onClick={() => removeTask(index)}
                                            className="text-danger hover:bg-danger/10"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </IconButton>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addTask}
                            className="mt-2 text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add another task
                        </button>
                    </div>

                    <ModalFooter>
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" loading={submitting}>
                            Create Template
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
}
