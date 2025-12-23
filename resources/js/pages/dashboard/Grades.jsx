import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Pencil, Trash } from 'lucide-react';
import { cleanParams } from '@/lib/utils';
import { askConfirmation } from '@/utils/sweetAlerts';
import AddButton from '@/components/buttons/AddButton';

export default function GradesPage() {
    const { props } = usePage();
    const grades = useMemo(() => props.grades ?? [], [props.grades]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            const params = cleanParams({ search });
            router.get('/dashboard/grades', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (grade) => {
        setEditingId(grade.id);
        setEditName(grade.grade_name || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const createGrade = async () => {
        if (!newName.trim() || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/grades', { grade_name: newName }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewName('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => {
                setIsSaving(false);
            },
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/grades/${editingId}`, { grade_name: editName }, { preserveState: true, preserveScroll: true, onSuccess: cancelEdit });
    };

    const deleteGrade = async (grade) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this grade?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/grades/${grade.id}`, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Grades', href: '/dashboard/grades' }]}>
            <Head title="Grades" />
            <div className="p-6">
                <div className="mb-6  ">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name"
                        />
                        <AddButton onClick={() => setIsAddOpen(true)}>Add New Grade</AddButton>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Grade</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium mb-1">Grade Name</label>
                                <Input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Grade 1"
                                />
                                {errors.grade_name && (
                                    <div className="text-red-500 text-sm mt-1">{errors.grade_name}</div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewName(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createGrade} disabled={isSaving || !newName.trim()}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Grade</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(grades.data ?? grades).map((g) => (
                            <TableRow key={g.id}>
                                <TableCell>
                                    {editingId === g.id ? (
                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    ) : (
                                        g.grade_name
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === g.id ? (
                                        <>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Pencil className="w-5 h-5 cursor-pointer" onClick={() => startEdit(g)}>Edit</Pencil>
                                            <Trash className="w-5 h-5 cursor-pointer text-red-800" onClick={() => deleteGrade(g)} />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {grades.links && (
                    <div className="mt-4">
                        <Pagination links={grades.links} filters={cleanParams({ search })} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
