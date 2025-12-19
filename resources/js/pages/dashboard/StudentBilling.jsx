import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cleanParams } from '@/lib/utils';
import { askConfirmation } from '@/utils/sweetAlerts';
import SaveButton from '@/components/buttons/SaveButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import EditButton from '@/components/buttons/EditButon';
import DeleteButton from '@/components/buttons/DeleteButton';
import AddButton from '@/components/buttons/AddButton';

export default function StudentBillingPage() {
    const { props } = usePage();
    const bills = useMemo(() => props.bills ?? [], [props.bills]);
    const students = useMemo(() => props.students ?? [], [props.students]);
    const years = useMemo(() => props.years ?? [], [props.years]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newStudentId, setNewStudentId] = useState('');
    const [newYearId, setNewYearId] = useState('');
    const [newTotal, setNewTotal] = useState('');
    const [newPaid, setNewPaid] = useState('');
    const [newStatus, setNewStatus] = useState('unpaid');
    const [newIssuedDate, setNewIssuedDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editStudentId, setEditStudentId] = useState('');
    const [editYearId, setEditYearId] = useState('');
    const [editTotal, setEditTotal] = useState('');
    const [editPaid, setEditPaid] = useState('');
    const [editStatus, setEditStatus] = useState('unpaid');
    const [editIssuedDate, setEditIssuedDate] = useState('');

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            const params = cleanParams({ search });
            router.get('/dashboard/student-billing', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (row) => {
        const id = row.bill_id || row.id;
        setEditingId(id);
        setEditStudentId(row.student_id || (row.student?.id ?? ''));
        setEditYearId(row.academic_year_id || (row.academicYear?.id ?? ''));
        setEditTotal(String(row.total_amount ?? '') || '');
        setEditPaid(String(row.paid_amount ?? '') || '');
        setEditStatus(row.status || 'unpaid');
        setEditIssuedDate(row.issued_date || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditStudentId(''); setEditYearId('');
        setEditTotal(''); setEditPaid('');
        setEditStatus('unpaid'); setEditIssuedDate('');
    };

    const createBill = async () => {
        if (!newStudentId || !newYearId || !newTotal || !newStatus || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/student-billing', {
            student_id: newStudentId,
            academic_year_id: newYearId,
            total_amount: parseFloat(newTotal),
            paid_amount: newPaid ? parseFloat(newPaid) : null,
            status: newStatus,
            issued_date: newIssuedDate || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewStudentId(''); setNewYearId(''); setNewTotal(''); setNewPaid(''); setNewStatus('unpaid'); setNewIssuedDate('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        router.put(`/dashboard/student-billing/${editingId}`, {
            student_id: editStudentId,
            academic_year_id: editYearId,
            total_amount: parseFloat(editTotal),
            paid_amount: editPaid ? parseFloat(editPaid) : null,
            status: editStatus,
            issued_date: editIssuedDate || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    };

    const deleteBill = async (row) => {
        const id = row.bill_id || row.id;
        const isConfirmed = await askConfirmation('Delete this bill?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/student-billing/${id}`, { preserveState: true, preserveScroll: true });
    };

    const studentLabel = (s) => s.user ? (s.user.name || [s.user.first_name, s.user.last_name].filter(Boolean).join(' ')) : 'Unknown';
    const yearLabel = (y) => y.year_name;

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Student Billing', href: '/dashboard/student-billing' }]}>
            <Head title="Student Billing" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by student or academic year"
                        />
                        <AddButton onClick={() => setIsAddOpen(true)}>Add Bill</AddButton>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Student Bill</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Student</label>
                                        <Select value={newStudentId} onValueChange={setNewStudentId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{studentLabel(s)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.student_id && <div className="text-red-500 text-sm mt-1">{errors.student_id}</div>}
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Total Amount</label>
                                        <Input type="number" value={newTotal} onChange={(e) => setNewTotal(e.target.value)} placeholder="e.g. 500.00" />
                                        {errors.total_amount && <div className="text-red-500 text-sm mt-1">{errors.total_amount}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Paid Amount (optional)</label>
                                        <Input type="number" value={newPaid} onChange={(e) => setNewPaid(e.target.value)} placeholder="e.g. 200.00" />
                                        {errors.paid_amount && <div className="text-red-500 text-sm mt-1">{errors.paid_amount}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <Select value={newStatus} onValueChange={setNewStatus}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                                <SelectItem value="partial">Partial</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <div className="text-red-500 text-sm mt-1">{errors.status}</div>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Issued Date (optional)</label>
                                    <Input type="date" value={newIssuedDate} onChange={(e) => setNewIssuedDate(e.target.value)} />
                                    {errors.issued_date && <div className="text-red-500 text-sm mt-1">{errors.issued_date}</div>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsAddOpen(false); setNewStudentId(''); setNewYearId(''); setNewTotal(''); setNewPaid(''); setNewStatus('unpaid'); setNewIssuedDate(''); }} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={createBill} disabled={isSaving || !newStudentId || !newYearId || !newTotal || !newStatus}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Admission#</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Issued</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(bills.data ?? bills).map((row) => (
                            <TableRow key={row.bill_id || row.id}>
                                <TableCell>
                                    {row.student ? studentLabel(row.student) : '—'}
                                </TableCell>
                                <TableCell>
                                    {row.student?.user?.admission_number || '—'}
                                </TableCell>
                                <TableCell>
                                    {row.academic_year ? yearLabel(row.academic_year) : '—'}
                                </TableCell>
                                <TableCell>{row.total_amount}</TableCell>
                                <TableCell>{row.amount_paid ?? '—'}</TableCell>
                                <TableCell>{row.balance ?? '—'}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell>{row.issued_date || '—'}</TableCell>
                                <TableCell className="space-x-2 flex">
                                    {editingId === (row.bill_id || row.id) ? (
                                        <>
                                            <SaveButton onClick={saveEdit}> Save</SaveButton>
                                            <SecondaryButton onClick={cancelEdit}>Cancel</SecondaryButton>
                                        </>
                                    ) : (
                                        <>
                                            <EditButton  onClick={() => startEdit(row)} />
                                            <DeleteButton onClick={() => deleteBill(row)} />
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {bills.links && (
                    <div className="mt-4">
                        <Pagination links={bills.links} filters={cleanParams({ search })} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

