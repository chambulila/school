import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { askConfirmation } from '../../utils/sweetAlerts';

export default function RolesIndex() {
    const { props } = usePage();
    const { auth, roles, modules } = props;
    const errors = props.errors || {};
    const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || '');
    const [newRoleName, setNewRoleName] = useState('');
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const { data, setData, put, processing } = useForm({ permission_ids: [] });

    const selectedRole = roles.find(role => role.id === selectedRoleId) || {};

    useEffect(() => {
        const allPerms = Object.values(modules || {}).flat();
        const nameToId = new Map(allPerms.map(p => [p.name, p.id]));
        const initial = (selectedRole.permissions || [])
            .map(p => p.id ?? nameToId.get(p.name))
            .filter(Boolean);
        setSelectedIds(initial);
    }, [selectedRole, modules]);

    const togglePermission = (id, isChecked) => {
        setSelectedIds(prev => {
            const exists = prev.includes(id);
            if (isChecked && !exists) return [...prev, id];
            if (!isChecked && exists) return prev.filter(x => x !== id);
            return prev;
        });
    };

    const handleAddRole = async () => {
        const isConfirmed = await askConfirmation('Are you sure you want to add this role?');
        if (!isConfirmed) return;
        router.post('/admin/roles', {
            role_name: newRoleName,
        });
    };

    const handleSavePermissions = async () => {
        const isConfirmed = await askConfirmation('Are you sure that you want to update permissions to this role?')
        if (isConfirmed) {
            router.put(`/admin/permissions/${selectedRoleId}`, {
                preserveState: true,
                preserveScroll: true,
                permission_ids: selectedIds
            });
        }
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Roles & Permissions</h2>}
        >
            <Head title="Roles & Permissions" />
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 bg-white border-b border-gray-200 space-y-6">
                    <b className='text-xl'>Roles & Permissions Management</b>
                    {/* Role Selection and Add New Role */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                        <div className="w-full sm:w-auto">
                            <label className="block text-sm font-medium mb-1">Select Role</label>
                            <Select
                                value={selectedRoleId}
                                onValueChange={(value) => setSelectedRoleId(value)}
                                disabled={isAddingRole}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name || role.role_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {!isAddingRole && (
                            <Button onClick={() => setIsAddingRole(true)}>
                                Add New Role
                            </Button>
                        )}

                        {isAddingRole && (
                            <div className="flex gap-2 items-end w-full sm:w-auto">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">New Role Name</label>
                                    <Input
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        placeholder="Enter role name"
                                    />
                                    {errors.role_name && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.role_name}
                                        </div>
                                    )}
                                </div>
                                <Button onClick={handleAddRole} disabled={!newRoleName.trim() || processing}>
                                    Save
                                </Button>
                                <Button variant="outline"
                                    onClick={() => {
                                        setIsAddingRole(false);
                                        setNewRoleName('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Permissions Table */}
                    {selectedRoleId && (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left">
                                        <th className="p-2">Module</th>
                                        <th className="p-2">Permissions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(modules || {}).map(([moduleName, perms]) => (
                                        <tr key={moduleName} className="border-t">
                                            <td className="p-2 font-medium capitalize">
                                                {(() => {
                                                    const ids = perms.map(p => p.id);
                                                    const allSelected = ids.every(id => selectedIds.includes(id));
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={allSelected}
                                                                onCheckedChange={(v) => {
                                                                    const check = !!v;
                                                                    setSelectedIds(prev => {
                                                                        const set = new Set(prev);
                                                                        if (check) ids.forEach(id => set.add(id));
                                                                        else ids.forEach(id => set.delete(id));
                                                                        return Array.from(set);
                                                                    });
                                                                }}
                                                            />
                                                            <span>{moduleName}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex flex-wrap gap-4">
                                                    {perms.map((permission) => {
                                                        const hasPermission = selectedIds.includes(permission.id);
                                                        return (
                                                            <div key={permission.id} className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id={`perm-${permission.id}`}
                                                                    checked={hasPermission}
                                                                    onCheckedChange={(checked) => togglePermission(permission.id, checked)}
                                                                />
                                                                <label htmlFor={`perm-${permission.id}`} className="text-sm">
                                                                    {permission.name}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                    <Button
                        onClick={() => handleSavePermissions()}
                        disabled={processing || !selectedRoleId}
                    >
                        {processing ? 'Saving…' : 'Save'}
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
