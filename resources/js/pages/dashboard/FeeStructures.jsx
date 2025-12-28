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
import { cleanParams } from '@/lib/utils';
import { askConfirmation, capitalizeFirstLetter } from '@/utils/sweetAlerts';
import AddButton from '@/components/buttons/AddButton';
import SaveButton from '@/components/buttons/SaveButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import EditButton from '@/components/buttons/EditButon';
import DeleteButton from '@/components/buttons/DeleteButton';

export default function FeeStructuresPage() {
    const { props } = usePage();
    const structures = useMemo(() => props.structures ?? [], [props.structures]);
    const categories = useMemo(() => props.categories ?? [], [props.categories]);
    const grades = useMemo(() => props.grades ?? [], [props.grades]);
    const years = useMemo(() => props.years ?? [], [props.years]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [queryParams, setQueryParams] = useState({
        search: initialFilters.search || ''
    });
    const isMounted = useRef(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCategoryId, setNewCategoryId] = useState('');
    const [newGradeId, setNewGradeId] = useState('');
    const [newYearId, setNewYearId] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editCategoryId, setEditCategoryId] = useState('');
    const [editGradeId, setEditGradeId] = useState('');
    const [editYearId, setEditYearId] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editDueDate, setEditDueDate] = useState('');

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
            router.get('/dashboard/fee-structures', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [queryParams]);

    const startEdit = (row) => {
        setEditingId(row.fee_structure_id || row.id);
        setEditCategoryId(row.fee_category_id || (row.feeCategory?.fee_category_id ?? ''));
        setEditGradeId(row.grade_id || (row.grade?.id ?? ''));
        setEditYearId(row.academic_year_id || (row.academicYear?.id ?? ''));
        setEditAmount(String(row.amount ?? '') || '');
        setEditDueDate(row.due_date || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditCategoryId(''); setEditGradeId(''); setEditYearId('');
        setEditAmount(''); setEditDueDate('');
    };

    const createStructure = async () => {
        if (!newCategoryId || !newGradeId || !newYearId || !newAmount || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/fee-structures', {
            fee_category_id: newCategoryId,
            grade_id: newGradeId,
            academic_year_id: newYearId,
            amount: parseFloat(newAmount),
            due_date: newDueDate || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewCategoryId(''); setNewGradeId(''); setNewYearId('');
                setNewAmount(''); setNewDueDate('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/fee-structures/${editingId}`, {
            fee_category_id: editCategoryId,
            grade_id: editGradeId,
            academic_year_id: editYearId,
            amount: parseFloat(editAmount),
            due_date: editDueDate || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteStructure = async (row) => {
        const id = row.fee_structure_id || row.id;
        const isConfirmed = await askConfirmation('Delete this fee structure?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/fee-structures/${id}`, { preserveState: true, preserveScroll: true });
    };

    const categoryLabel = (c) => capitalizeFirstLetter(c.category_name);
    const gradeLabel = (g) => capitalizeFirstLetter(g.grade_name);
    const yearLabel = (y) => y.year_name;

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Fee Structures', href: '/dashboard/fee-structures' }]}>
            <Head title="Fee Structures" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={queryParams.search}
                            onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value })}
                            placeholder="Search by category, grade, or year"
                        />
                        <AddButton onClick={() => setIsAddOpen(true)}>Add Fee Structure</AddButton>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="w-full max-w-[95vw] md:max-w-3xl lg:max-w-6xl">
                            <DialogHeader>
                                <DialogTitle>Add Fee Structure</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Fee Category</label>
                                        <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.fee_category_id || c.id} value={c.fee_category_id || c.id}>{categoryLabel(c)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.fee_category_id && <div className="text-red-500 text-sm mt-1">{errors.fee_category_id}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Grade</label>
                                        <Select value={newGradeId} onValueChange={setNewGradeId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {grades.map((g) => (
                                                    <SelectItem key={g.id} value={g.id}>{gradeLabel(g)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.grade_id && <div className="text-red-500 text-sm mt-1">{errors.grade_id}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Academic Year</label>
                                        <Select value={newYearId} onValueChange={setNewYearId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y.id} value={y.id}>{yearLabel(y)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.academic_year_id && <div className="text-red-500 text-sm mt-1">{errors.academic_year_id}</div>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Amount</label>
                                        <Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="e.g. 500.00" />
                                        {errors.amount && <div className="text-red-500 text-sm mt-1">{errors.amount}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Due Date (optional)</label>
                                        <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                                        {errors.due_date && <div className="text-red-500 text-sm mt-1">{errors.due_date}</div>}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewCategoryId(''); setNewGradeId(''); setNewYearId(''); setNewAmount(''); setNewDueDate(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createStructure} disabled={isSaving || !newCategoryId || !newGradeId || !newYearId || !newAmount}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(structures.data ?? structures).map((row) => (
                            <TableRow key={row.fee_structure_id || row.id}>
                                <TableCell>
                                    {editingId === (row.fee_structure_id || row.id) ? (
                                        <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.fee_category_id || c.id} value={c.fee_category_id || c.id}>{categoryLabel(c)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        capitalizeFirstLetter(row.fee_category?.category_name) || '-'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.fee_structure_id || row.id) ? (
                                        <Select value={editGradeId} onValueChange={setEditGradeId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {grades.map((g) => (
                                                    <SelectItem key={g.id} value={g.id}>{gradeLabel(g)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.grade ? gradeLabel(row.grade) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.fee_structure_id || row.id) ? (
                                        <Select value={editYearId} onValueChange={setEditYearId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y.id} value={y.id}>{yearLabel(y)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.academic_year ? yearLabel(row.academic_year) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.fee_structure_id || row.id) ? (
                                        <Input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
                                    ) : (
                                        row.amount
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.fee_structure_id || row.id) ? (
                                        <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                                    ) : (
                                        row.due_date || '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2 flex">
                                    {editingId === (row.fee_structure_id || row.id) ? (
                                        <>
                                            <SaveButton onClick={saveEdit}> Save</SaveButton>
                                            <SecondaryButton  onClick={cancelEdit}>Cancel</SecondaryButton>
                                        </>
                                    ) : (
                                        <>
                                            <EditButton onClick={() => startEdit(row)}><Pencil className="mr-1 h-4 w-4" /> Edit</EditButton>
                                            <DeleteButton onClick={() => deleteStructure(row)}><Trash className="mr-1 h-4 w-4" /> Delete</DeleteButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {structures.links && (
                    <div className="mt-4">
                        <Pagination links={structures.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

