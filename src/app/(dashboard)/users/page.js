'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    PageHeader, Button, Alert, LoadingState,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
    Modal, ModalFooter, Input, Select, Badge
} from '@/components/ui';

export default function UsersPage() {
    const { authFetch } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'Member' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await authFetch('/api/users');
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await authFetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            setUsers([data, ...users]);
            setShowModal(false);
            setFormData({ name: '', email: '', role: 'Member' });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingState message="Loading users..." />;
    }

    return (
        <div>
            <PageHeader
                title="Users"
                description="Manage system users and their roles"
                action={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add User
                    </Button>
                }
            />

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableEmpty message="No users found. Create your first user!" colSpan={4} />
                    ) : (
                        users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell className="text-muted">{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'Admin' ? 'admin' : 'member'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
                {error && <Alert variant="error" className="mb-4">{error}</Alert>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        placeholder="Enter user name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Select
                        label="Role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        options={[
                            { value: 'Member', label: 'Member' },
                            { value: 'Admin', label: 'Admin' },
                        ]}
                    />

                    <ModalFooter>
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" loading={submitting}>
                            Create User
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
}
