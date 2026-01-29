'use client';

import { useState, useEffect } from 'react';

export default function InstancesPage() {
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
                fetch('/api/instances'),
                fetch('/api/templates'),
                fetch('/api/users'),
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
            const res = await fetch('/api/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create instance');
            }

            setSuccessMessage(`Instance created successfully! ${data.tasksCreated} tasks assigned to ${data.assigneeName}.`);

            // Refresh instances list
            const instancesRes = await fetch('/api/instances');
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

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Instances</h1>
                    <p className="text-muted mt-1">Create project instances from templates</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    disabled={templates.length === 0 || users.length === 0}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Instance
                </button>
            </div>

            {/* Warning if no templates or users */}
            {!loading && (templates.length === 0 || users.length === 0) && (
                <div className="card mb-6 border-warning/30 bg-warning/5">
                    <p className="text-warning">
                        {templates.length === 0 && "You need to create a template first. "}
                        {users.length === 0 && "You need to create users first."}
                    </p>
                </div>
            )}

            {/* Instances List */}
            {loading ? (
                <div className="text-center py-12 text-muted">Loading instances...</div>
            ) : instances.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-muted">No instances found. Create your first instance from a template!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {instances.map((instance) => (
                        <div key={instance._id} className="card">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg">{instance.name}</h3>
                                    <p className="text-muted text-sm">Template: {instance.templateName}</p>
                                </div>
                                <span className="badge bg-success/20 text-success">
                                    {instance.tasks?.length || 0} tasks
                                </span>
                            </div>

                            {/* Tasks list */}
                            <div className="space-y-2">
                                {instance.tasks?.map((task, index) => (
                                    <div key={task._id} className="task-item">
                                        <span className="task-order">{task.order}</span>
                                        <div className="flex-1">
                                            <span className="text-foreground">{task.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary font-medium">
                                                {task.assignee?.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-muted text-sm">{task.assignee?.name || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border text-xs text-muted">
                                Created: {new Date(instance.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Instance Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-semibold text-foreground mb-6">Create Instance</h2>

                        {error && (
                            <div className="mb-4 p-4 rounded-xl bg-danger/10 border border-danger/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/30 text-green-400 text-sm">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Instance Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Company Website v1"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Select Template</label>
                                <select
                                    className="select"
                                    value={formData.templateId}
                                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a template...</option>
                                    {templates.map((template) => (
                                        <option key={template._id} value={template._id}>
                                            {template.name} ({template.tasks.length} tasks)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Show template tasks preview */}
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
                                <label className="label">Assign To (Doer)</label>
                                <select
                                    className="select"
                                    value={formData.assigneeId}
                                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a user...</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted mt-1">All tasks will be assigned to this user</p>
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
                                    {submitting ? 'Creating...' : 'Create Instance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
