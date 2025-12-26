import { Head, router, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AuthenticatedLayout from '@/layouts/authenticated-layout'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { askConfirmation } from '../../utils/sweetAlerts';
import AddButton from '@/components/buttons/AddButton';
import SaveButton from '@/components/buttons/SaveButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import DeleteButton from '@/components/buttons/DeleteButton';
import Pagination from '@/components/ui/pagination';
import { cleanParams } from '@/lib/utils';
import EditButton from '@/components/buttons/EditButon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function RolesIndex() {
    const { props } = usePage();
    const { auth, roles, url } = props;

    const errors = props.errors || {};
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [queryParams, setQueryParams] = useState({
        search: '',
    });
    const prevParamsString = useRef(JSON.stringify(queryParams));
    const isMounted = useRef(false);
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

    const handleFilterChange = (e, key) => {
        setQueryParams(prev => ({
            ...prev, [key]: e.target.value,
        }))
    }

    useEffect(() => {
     const params = cleanParams(queryParams);
        Object.keys(params).forEach(key => {
            if (params[key] === 'all') delete params[key];
        });
        const paramString = JSON.stringify(params);

        if (!isMounted.current) {
            isMounted.current = true;
            prevParamsString.current = paramString;
            return;
        }

        if (paramString === prevParamsString.current) return;

        const timeout = setTimeout(() => {
            prevParamsString.current = paramString;
            router.get('/dashboard/roles', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);    }, [queryParams]);
    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Admin', href: '/admin' }, { title: 'Roles', href: '/admin/roles' }]}>
            <Head title="Roles" />
            <div className="p-6">
                         <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={queryParams.search}
                            onChange={(e) => handleFilterChange(e, 'search')}
                            placeholder="Search here.."
                        />
                    {!isAddingRole && (
                        <AddButton onClick={() => setIsAddingRole(true)}>Add New Role</AddButton>
                    )}
                    </div>

                    <Dialog open={isAddingRole} >
                        <DialogHeader>
                            <DialogTitle>Role Name</DialogTitle>
                        </DialogHeader>
                        <DialogContent>
                        <div className="flex items-end gap-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Role Name</label>
                                <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Enter role name" />
                                {errors.role_name && (
                                    <div className="text-red-500 text-sm mt-1">{errors.role_name}</div>
                                )}
                            </div>
                            <SaveButton onClick={handleAddRole} disabled={!newRoleName.trim()}>Save</SaveButton>
                            <SecondaryButton onClick={() => { setIsAddingRole(false); setNewRoleName(''); }}>Cancel</SecondaryButton>
                        </div>
                        </DialogContent>
                    </Dialog>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles?.data?.map(role => (
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
                                        <div className="flex gap-2 flex">
                                            <SaveButton  onClick={saveEditRole} />
                                            <SecondaryButton  onClick={cancelEditRole}>Cancel</SecondaryButton>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <EditButton  onClick={() => startEditRole(role)} />
                                            <DeleteButton onClick={() => deleteRole(role)} />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* {roles.links && (
                    <div className="mt-4">
                        <Pagination links={roles.links} filters={filters} />
                    </div>
                )} */}
            </div>
        </AuthenticatedLayout>
    );
}
