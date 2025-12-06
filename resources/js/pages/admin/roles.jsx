import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@layouts/authenticated-layout';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function RolesIndex() {
    const { props } = usePage();
    const { auth, roles, permissions } = props;
    const errors = props.errors || {};
    const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || '');
    const [newRoleName, setNewRoleName] = useState('');
    const [isAddingRole, setIsAddingRole] = useState(false);
    const { put, post, processing } = useForm();

    const selectedRole = roles.find(role => role.id === selectedRoleId) || {};

    const handlePermissionChange = (permissionName, isChecked) => {
        if (!selectedRoleId) return;

        router.put(`/admin/roles/${selectedRoleId}`, {
            permission: permissionName,
            checked: isChecked
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    };

    const handleAddRole = () => {
        router.post(route('roles.store'), {
            name: newRoleName,
        });
    };


    console.log(can('expenses.create'));
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
                                    {errors.name && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.name}
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
                                        {Object.entries(permissions || {}).map(([module, perms]) => (
                                            <tr key={module} className="border-t">
                                                <td className="p-2 font-medium capitalize">{module}</td>
                                                <td className="p-2">
                                                    <div className="flex flex-wrap gap-4">
                                                        {perms.map((permission) => {
                                                            const hasPermission = (selectedRole.permissions || [])
                                                                .some(p => p.name === permission.name);
                                                            return (
                                                                <div key={permission.id} className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        id={`perm-${permission.id}`}
                                                                        checked={hasPermission}
                                                                        onCheckedChange={(checked) =>
                                                                            handlePermissionChange(permission.name, checked)
                                                                        }
                                                                    />
                                                                    <label htmlFor={`perm-${permission.id}`} className="text-sm">
                                                                        {permission.name.split('.')[1]}
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
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
