'use client';

import { useState, useEffect } from 'react';

export default function TemplatesPage() {
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
            const res = await fetch('/api/templates');
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

        // Filter out empty tasks
        const filteredTasks = formData.tasks.filter((t) => t.trim() !== '');

        if (filteredTasks.length === 0) {
            setError('At least one task is required');
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/templates', {
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

    const addTask = () => {
        setFormData({ ...formData, tasks: [...formData.tasks, ''] });
    };

    const removeTask = (index) => {
        if (formData.tasks.length > 1) {
            const newTasks = formData.tasks.filter((_, i) => i !== index);
            setFormData({ ...formData, tasks: newTasks });
        }
    };

    const updateTask = (index, value) => {
        const newTasks = [...formData.tasks];
        newTasks[index] = value;
        setFormData({ ...formData, tasks: newTasks });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Templates</h1>
                    <p className="text-muted mt-1">Create reusable task templates for your projects</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Template
                </button>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="text-center py-12 text-muted">Loading templates...</div>
            ) : templates.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-muted">No templates found. Create your first template!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template._id} className="card">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg">{template.name}</h3>
                                    <p className="text-muted text-sm mt-1">{template.description || 'No description'}</p>
                                </div>
                                <span className="badge bg-primary/20 text-primary">
                                    {template.tasks.length} tasks
                                </span>
                            </div>

                            <div className="space-y-2">
                                {template.tasks.slice(0, 4).map((task, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <span className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center text-xs text-muted">
                                            {index + 1}
                                        </span>
                                        <span className="text-foreground">{task}</span>
                                    </div>
                                ))}
                                {template.tasks.length > 4 && (
                                    <p className="text-muted text-sm ml-8">+{template.tasks.length - 4} more tasks</p>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border text-xs text-muted">
                                Created: {new Date(template.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Template Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-semibold text-foreground mb-6">Create Template</h2>

                        {error && (
                            <div className="mb-4 p-4 rounded-xl bg-danger/10 border border-danger/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Template Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Website Launch Checklist"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Description</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Brief description of this template"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

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
                                                <button
                                                    type="button"
                                                    onClick={() => removeTask(index)}
                                                    className="w-10 h-10 flex items-center justify-center text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addTask}
                                    className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add another task
                                </button>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Creating...' : 'Create Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
