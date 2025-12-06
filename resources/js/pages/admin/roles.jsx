import { Head, router, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthenticatedLayout from '@/layouts/authenticated-layout'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { askConfirmation } from '../../utils/sweetAlerts';

export default function RolesIndex() {
    const { props } = usePage();
    const { auth, roles } = props;
    const errors = props.errors || {};
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const handleAddRole = async () => {
        const confirmed = await askConfirmation('Add this role?');
        if (!confirmed) return;
        router.post('/admin/roles', {
            role_name: newRoleName,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const startEditRole = (role) => {
        setEditingRoleId(role.id);
        setEditName(role.role_name || role.name || '');
        setEditDescription(role.description || '');
    };

    const cancelEditRole = () => {
        setEditingRoleId(null);
        setEditName('');
        setEditDescription('');
    };

    const saveEditRole = async () => {
        if (!editingRoleId) return;
        const confirmed = await askConfirmation('Save changes to this role?');
        if (!confirmed) return;
        router.put(`/admin/roles/${editingRoleId}`, {
            role_name: editName,
            description: editDescription,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
        cancelEditRole();
    };

    const deleteRole = async (role) => {
        const confirmed = await askConfirmation('Delete this role?');
        if (!confirmed) return;
        router.delete(`/admin/roles/${role.id}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Admin', href: '/admin' }, { title: 'Roles', href: '/admin/roles' }]}>
            <Head title="Roles" />
            <div className="p-6">
                <div className="mb-6 flex items-start gap-4">
                    {!isAddingRole && (
                        <Button onClick={() => setIsAddingRole(true)}>Add New Role</Button>
                    )}
                    {isAddingRole && (
                        <div className="flex items-end gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Role Name</label>
                                <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Enter role name" />
                                {errors.role_name && (
                                    <div className="text-red-500 text-sm mt-1">{errors.role_name}</div>
                                )}
                            </div>
                            <Button onClick={handleAddRole} disabled={!newRoleName.trim()}>Save</Button>
                            <Button variant="outline" onClick={() => { setIsAddingRole(false); setNewRoleName(''); }}>Cancel</Button>
                        </div>
                    )}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map(role => (
                            <TableRow key={role.id}>
                                <TableCell>
                                    {editingRoleId === role.id ? (
                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    ) : (
                                        role.role_name || role.name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingRoleId === role.id ? (
                                        <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                    ) : (
                                        role.description || ''
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingRoleId === role.id ? (
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={saveEditRole}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEditRole}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => startEditRole(role)}>Edit</Button>
                                            <Button size="sm" variant="destructive" onClick={() => deleteRole(role)}>Delete</Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
