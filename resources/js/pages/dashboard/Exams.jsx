import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListChecks, Pencil, Trash } from 'lucide-react';
import { askConfirmation } from '@/utils/sweetAlerts';
import { cleanParams } from '@/lib/utils';
import AddButton from '@/components/buttons/AddButton';
import SaveButton from '@/components/buttons/SaveButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import EditButton from '@/components/buttons/EditButon';
import DeleteButton from '@/components/buttons/DeleteButton';

export default function ExamsPage() {
    const { props } = usePage();
    const exams = useMemo(() => props.exams ?? [], [props.exams]);
    const years = useMemo(() => props.years ?? [], [props.years]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [queryParams, setQueryParams] = useState({
        search: initialFilters.search || ''
    });
    const isMounted = useRef(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newYearId, setNewYearId] = useState('');
    const [newTerm, setNewTerm] = useState('');
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editYearId, setEditYearId] = useState('');
    const [editTerm, setEditTerm] = useState('');
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');

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
            router.get('/dashboard/exams', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [queryParams]);

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditName(row.exam_name || '');
        setEditYearId(row.academic_year_id || (row.academicYear?.id ?? ''));
        setEditTerm(row.term_name || '');
        setEditStart(row.start_date || '');
        setEditEnd(row.end_date || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName(''); setEditYearId(''); setEditTerm(''); setEditStart(''); setEditEnd('');
    };

    const createExam = async () => {
        if (!newName || !newYearId || !newTerm || !newStart || !newEnd || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/exams', {
            exam_name: newName,
            academic_year_id: newYearId,
            term_name: newTerm,
            start_date: newStart,
            end_date: newEnd,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewName(''); setNewYearId(''); setNewTerm(''); setNewStart(''); setNewEnd('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/exams/${editingId}`, {
            exam_name: editName,
            academic_year_id: editYearId,
            term_name: editTerm,
            start_date: editStart,
            end_date: editEnd,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteExam = async (row) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this exam?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/exams/${row.id}`, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Exams', href: '/dashboard/exams' }]}>
            <Head title="Exams" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={queryParams.search}
                            onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value })}
                            placeholder="Search by exam, term, or year"
                        />
                        <AddButton onClick={() => setIsAddOpen(true)}>Add Exam</AddButton>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Exam</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Exam Name</label>
                                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Mid Term" />
                                    {errors.exam_name && <div className="text-red-500 text-sm mt-1">{errors.exam_name}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                                    <Select value={newYearId} onValueChange={setNewYearId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((y) => (
                                                <SelectItem key={y.id} value={y.id}>{y.year_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.academic_year_id && <div className="text-red-500 text-sm mt-1">{errors.academic_year_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Term</label>
                                    <Input value={newTerm} onChange={(e) => setNewTerm(e.target.value)} placeholder="e.g. Term 1" />
                                    {errors.term_name && <div className="text-red-500 text-sm mt-1">{errors.term_name}</div>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Date</label>
                                        <Input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                                        {errors.start_date && <div className="text-red-500 text-sm mt-1">{errors.start_date}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Date</label>
                                        <Input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                                        {errors.end_date && <div className="text-red-500 text-sm mt-1">{errors.end_date}</div>}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewName(''); setNewYearId(''); setNewTerm(''); setNewStart(''); setNewEnd(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createExam} disabled={isSaving || !newName || !newYearId || !newTerm || !newStart || !newEnd}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Exam</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>End</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(exams.data ?? exams).map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    ) : (
                                        row.exam_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Select value={editYearId} onValueChange={setEditYearId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y.id} value={y.id}>{y.year_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.academic_year ? row.academic_year.year_name : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Input value={editTerm} onChange={(e) => setEditTerm(e.target.value)} />
                                    ) : (
                                        row.term_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
                                    ) : (
                                        row.start_date
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === row.id ? (
                                        <Input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
                                    ) : (
                                        row.end_date
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2 flex items-center ">
                                    {editingId === row.id ? (
                                        <>
                                            <SaveButton onClick={saveEdit}>Save</SaveButton>
                                            <SecondaryButton onClick={cancelEdit}>Cancel</SecondaryButton>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={() => router.get(`/dashboard/exams/enrollments/${row.id}`)}>
                                                <ListChecks className="mr-1 h-4 w-4" /> Results
                                            </Button>
                                            <EditButton onClick={() => startEdit(row)} />

                                            <DeleteButton variant="destructive" onClick={() => deleteExam(row)} />
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {exams.links && (
                    <div className="mt-4">
                        <Pagination links={exams.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
