import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Pencil, Trash } from 'lucide-react';
import { askConfirmation } from '@/utils/sweetAlerts';

export default function AcademicYearsPage() {
    const { props } = usePage();
    const years = useMemo(() => props.years ?? [], [props.years]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');
    const [newActive, setNewActive] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');
    const [editActive, setEditActive] = useState(false);

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get('/dashboard/academic-years', { search }, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (year) => {
        setEditingId(year.id);
        setEditName(year.year_name || '');
        setEditStart(year.start_date || '');
        setEditEnd(year.end_date || '');
        setEditActive(!!year.is_active);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditStart('');
        setEditEnd('');
        setEditActive(false);
    };

    const createYear = async () => {
        if (!newName.trim() || !newStart || !newEnd || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/academic-years', {
            year_name: newName,
            start_date: newStart,
            end_date: newEnd,
            is_active: newActive,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewName('');
                setNewStart('');
                setNewEnd('');
                setNewActive(false);
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
        router.put(`/dashboard/academic-years/${editingId}`, {
            year_name: editName,
            start_date: editStart,
            end_date: editEnd,
            is_active: editActive,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteYear = async (year) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this academic year?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/academic-years/${year.id}`, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Academic Years', href: '/dashboard/academic-years' }]}>
            <Head title="Academic Years" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by year name"
                        />
                        <Button onClick={() => setIsAddOpen(true)}>Add New Academic Year</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Academic Year</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Year Name</label>
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. 2025-2026"
                                    />
                                    {errors.year_name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.year_name}</div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Date</label>
                                        <Input
                                            type="date"
                                            value={newStart}
                                            onChange={(e) => setNewStart(e.target.value)}
                                        />
                                        {errors.start_date && (
                                            <div className="text-red-500 text-sm mt-1">{errors.start_date}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Date</label>
                                        <Input
                                            type="date"
                                            value={newEnd}
                                            onChange={(e) => setNewEnd(e.target.value)}
                                        />
                                        {errors.end_date && (
                                            <div className="text-red-500 text-sm mt-1">{errors.end_date}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={newActive}
                                        onCheckedChange={(val) => setNewActive(!!val)}
                                    />
                                    <label htmlFor="is_active" className="text-sm">Is Active</label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewName(''); setNewStart(''); setNewEnd(''); setNewActive(false); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createYear} disabled={isSaving || !newName.trim() || !newStart || !newEnd}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>End</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(years.data ?? years).map((y) => (
                            <TableRow key={y.id}>
                                <TableCell>
                                    {editingId === y.id ? (
                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    ) : (
                                        y.year_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === y.id ? (
                                        <Input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
                                    ) : (
                                        y.start_date
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === y.id ? (
                                        <Input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
                                    ) : (
                                        y.end_date
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === y.id ? (
                                        <Checkbox checked={editActive} onCheckedChange={(val) => setEditActive(!!val)} />
                                    ) : (
                                        y.is_active ? 'Yes' : 'No'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === y.id ? (
                                        <>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Pencil className="w-5 h-5 cursor-pointer" onClick={() => startEdit(y)} />
                                            <Trash className="w-5 h-5 cursor-pointer text-red-800" onClick={() => deleteYear(y)} />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {years.links && (
                    <div className="mt-4">
                        <Pagination links={years.links} filters={{ search }} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

