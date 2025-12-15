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
import { cleanParams } from '@/lib/utils';

export default function StudentsPage() {
    const { props } = usePage();
    const students = useMemo(() => props.students ?? [], [props.students]);
    const users = useMemo(() => props.users ?? [], [props.users]);
    const sections = useMemo(() => props.sections ?? [], [props.sections]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newUserId, setNewUserId] = useState('');
    const [newAdmNum, setNewAdmNum] = useState('');
    const [newAdmDate, setNewAdmDate] = useState('');
    const [newClassId, setNewClassId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editUserId, setEditUserId] = useState('');
    const [editAdmNum, setEditAdmNum] = useState('');
    const [editAdmDate, setEditAdmDate] = useState('');
    const [editClassId, setEditClassId] = useState('');

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            const params = cleanParams({ search });
            router.get('/dashboard/students', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditUserId(row.user_id || (row.user?.id ?? ''));
        setEditAdmNum(row.admission_number || '');
        setEditAdmDate(row.admission_date || '');
        setEditClassId(row.current_class_id || (row.currentClass?.id ?? ''));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditUserId(''); setEditAdmNum(''); setEditAdmDate(''); setEditClassId('');
    };

    const createStudent = async () => {
        if (!newUserId || !newAdmNum || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/students', {
            user_id: newUserId,
            admission_number: newAdmNum,
            admission_date: newAdmDate || null,
            current_class_id: newClassId || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewUserId(''); setNewAdmNum(''); setNewAdmDate(''); setNewClassId('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/students/${editingId}`, {
            user_id: editUserId,
            admission_number: editAdmNum,
            admission_date: editAdmDate || null,
            current_class_id: editClassId || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteStudent = async (row) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this student?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/students/${row.id}`, { preserveState: true, preserveScroll: true });
    };

    const userLabel = (u) => u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown';

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Students', href: '/dashboard/students' }]}>
            <Head title="Students" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or admission #"
                        />
                        <Button onClick={() => setIsAddOpen(true)}>Add Student</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Student</DialogTitle>
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
                                    <label className="block text-sm font-medium mb-1">Admission Number</label>
                                    <Input value={newAdmNum} onChange={(e) => setNewAdmNum(e.target.value)} placeholder="e.g. ADM-0001" />
                                    {errors.admission_number && <div className="text-red-500 text-sm mt-1">{errors.admission_number}</div>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Admission Date (optional)</label>
                                        <Input type="date" value={newAdmDate} onChange={(e) => setNewAdmDate(e.target.value)} />
                                        {errors.admission_date && <div className="text-red-500 text-sm mt-1">{errors.admission_date}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Current Class (optional)</label>
                                        <Select value={newClassId} onValueChange={setNewClassId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec) => (
                                                    <SelectItem key={sec.id} value={sec.id}>
                                                        {sec.section_name} {sec.grade ? `(${sec.grade.grade_name})` : ''}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem >None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.current_class_id && <div className="text-red-500 text-sm mt-1">{errors.current_class_id}</div>}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewUserId(''); setNewAdmNum(''); setNewAdmDate(''); setNewClassId(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createStudent} disabled={isSaving || !newUserId || !newAdmNum.trim()}>
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
                            <TableHead>Admission #</TableHead>
                            <TableHead>Admission Date</TableHead>
                            <TableHead>Current Class</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(students.data ?? students).map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    {editingId === s.id ? (
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
                                        s.user ? userLabel(s.user) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Input value={editAdmNum} onChange={(e) => setEditAdmNum(e.target.value)} />
                                    ) : (
                                        s.admission_number
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Input type="date" value={editAdmDate} onChange={(e) => setEditAdmDate(e.target.value)} />
                                    ) : (
                                        s.admission_date || '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === s.id ? (
                                        <Select value={editClassId} onValueChange={setEditClassId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec) => (
                                                    <SelectItem key={sec.id} value={sec.id}>
                                                        {sec.section_name} {sec.grade ? `(${sec.grade.grade_name})` : ''}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem >None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        s.currentClass ? `${s.currentClass.section_name}${s.currentClass.grade ? ` (${s.currentClass.grade.grade_name})` : ''}` : '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === s.id ? (
                                        <>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Pencil className="w-5 h-5 cursor-pointer" onClick={() => startEdit(s)} />
                                            <Trash className="w-5 h-5 cursor-pointer text-red-800" onClick={() => deleteStudent(s)} />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {students.links && (
                    <div className="mt-4">
                        <Pagination links={students.links} filters={cleanParams({ search })} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
