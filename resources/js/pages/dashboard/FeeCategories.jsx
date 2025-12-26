import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Pencil, Trash } from 'lucide-react';
import { cleanParams } from '@/lib/utils';
import { askConfirmation, capitalizeFirstLetter } from '@/utils/sweetAlerts';
import EditButton from '@/components/buttons/EditButon';
import DeleteButton from '@/components/buttons/DeleteButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import AddButton from '@/components/buttons/AddButton';
import SaveButton from '@/components/buttons/SaveButton';

export default function FeeCategoriesPage() {
    const { props } = usePage();
    const categories = useMemo(() => props.categories ?? [], [props.categories]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [queryParams, setQueryParams] = useState({
        search: initialFilters.search || ''
    });
    const isMounted = useRef(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const prevParamsString = useRef(JSON.stringify(queryParams));

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
            router.get('/dashboard/fee-categories', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [queryParams]);

    const startEdit = (row) => {
        setEditingId(row.fee_category_id || row.id);
        setEditName(row.category_name || '');
        setEditDesc(row.description || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditDesc('');
    };

    const createCategory = async () => {
        if (!newName.trim() || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/fee-categories', {
            category_name: newName,
            description: newDesc || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewName(''); setNewDesc('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/fee-categories/${editingId}`, {
            category_name: editName,
            description: editDesc || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteCategory = async (row) => {
        const id = row.fee_category_id || row.id;
        const isConfirmed = await askConfirmation('Delete this fee category?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/fee-categories/${id}`, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Fee Categories', href: '/dashboard/fee-categories' }]}>
            <Head title="Fee Categories" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={queryParams.search}
                            onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value })}
                            placeholder="Search by category name"
                        />
                        <AddButton onClick={() => setIsAddOpen(true)}>Add Fee Category</AddButton>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Fee Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category Name</label>
                                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Tuition" />
                                    {errors.category_name && <div className="text-red-500 text-sm mt-1">{errors.category_name}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description (optional)</label>
                                    <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Short description" />
                                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewName(''); setNewDesc(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createCategory} disabled={isSaving || !newName.trim()}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(categories.data ?? categories).map((row) => (
                            <TableRow key={row.fee_category_id || row.id}>
                                <TableCell>
                                    {editingId === (row.fee_category_id || row.id) ? (
                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    ) : (
                                        capitalizeFirstLetter(row.category_name)
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.fee_category_id || row.id) ? (
                                        <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                                    ) : (
                                        row.description || '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2 flex">
                                    {editingId === (row.fee_category_id || row.id) ? (
                                        <>
                                            <SaveButton onClick={saveEdit}> Save</SaveButton>
                                            <SecondaryButton onClick={cancelEdit}>Cancel</SecondaryButton>
                                        </>
                                    ) : (
                                        <>
                                            <EditButton  onClick={() => startEdit(row)}/>
                                            <DeleteButton onClick={() => deleteCategory(row)}/>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {categories.links && (
                    <div className="mt-4">
                        <Pagination links={categories.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

