import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash } from 'lucide-react';
import { askConfirmation } from '@/utils/sweetAlerts';

export default function TeachersPage() {
    const { props } = usePage();
    const teachers = useMemo(() => props.teachers ?? [], [props.teachers]);
    const users = useMemo(() => props.users ?? [], [props.users]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newUserId, setNewUserId] = useState('');
    const [newEmp, setNewEmp] = useState('');
    const [newQual, setNewQual] = useState('');
    const [newHire, setNewHire] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editUserId, setEditUserId] = useState('');
    const [editEmp, setEditEmp] = useState('');
    const [editQual, setEditQual] = useState('');
    const [editHire, setEditHire] = useState('');

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            router.get('/dashboard/teachers', { search }, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditUserId(row.user_id || (row.user?.id ?? ''));
        setEditEmp(row.employee_number || '');
        setEditQual(row.qualification || '');
        setEditHire(row.hire_date || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditUserId('');
        setEditEmp('');
        setEditQual('');
        setEditHire('');
    };

    const createTeacher = async () => {
        if (!newUserId || !newEmp || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/teachers', {
            user_id: newUserId,
            employee_number: newEmp,
            qualification: newQual || null,
            hire_date: newHire || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewUserId(''); setNewEmp(''); setNewQual(''); setNewHire('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/teachers/${editingId}`, {
            user_id: editUserId,
            employee_number: editEmp,
            qualification: editQual || null,
            hire_date: editHire || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteTeacher = async (row) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this teacher?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/teachers/${row.id}`, { preserveState: true, preserveScroll: true });
    };

    const userLabel = (u) => u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown';

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Teachers', href: '/dashboard/teachers' }]}>
            <Head title="Teachers" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or employee #"
                        />
                        <Button onClick={() => setIsAddOpen(true)}>Add Teacher</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Teacher</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">User</label>
                                    <Select value={newUserId} onValueChange={setNewUserId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((u) => (
                                                <SelectItem key={u.id} value={u.id}>{userLabel(u)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && <div className="text-red-500 text-sm mt-1">{errors.user_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Employee Number</label>
                                    <Input value={newEmp} onChange={(e) => setNewEmp(e.target.value)} placeholder="e.g. EMP-0001" />
                                    {errors.employee_number && <div className="text-red-500 text-sm mt-1">{errors.employee_number}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Qualification (optional)</label>
                                    <Input value={newQual} onChange={(e) => setNewQual(e.target.value)} placeholder="e.g. B.Ed, M.Sc" />
                                    {errors.qualification && <div className="text-red-500 text-sm mt-1">{errors.qualification}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hire Date (optional)</label>
                                    <Input type="date" value={newHire} onChange={(e) => setNewHire(e.target.value)} />
                                    {errors.hire_date && <div className="text-red-500 text-sm mt-1">{errors.hire_date}</div>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewUserId(''); setNewEmp(''); setNewQual(''); setNewHire(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createTeacher} disabled={isSaving || !newUserId || !newEmp.trim()}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Employee #</TableHead>
                            <TableHead>Qualification</TableHead>
                            <TableHead>Hire Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(teachers.data ?? teachers).map((t) => (
                            <TableRow key={t.id}>
                                <TableCell>
                                    {editingId === t.id ? (
                                        <Select value={editUserId} onValueChange={setEditUserId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>{userLabel(u)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        t.user ? userLabel(t.user) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === t.id ? (
                                        <Input value={editEmp} onChange={(e) => setEditEmp(e.target.value)} />
                                    ) : (
                                        t.employee_number
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === t.id ? (
                                        <Input value={editQual} onChange={(e) => setEditQual(e.target.value)} />
                                    ) : (
                                        t.qualification || '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === t.id ? (
                                        <Input type="date" value={editHire} onChange={(e) => setEditHire(e.target.value)} />
                                    ) : (
                                        t.hire_date || '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === t.id ? (
                                        <>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Pencil className="w-5 h-5 cursor-pointer" onClick={() => startEdit(t)} />
                                            <Trash className="w-5 h-5 cursor-pointer text-red-800" onClick={() => deleteTeacher(t)} />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {teachers.links && (
                    <div className="mt-4">
                        <Pagination links={teachers.links} filters={{ search }} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

