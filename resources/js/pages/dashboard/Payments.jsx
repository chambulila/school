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
import { askConfirmation } from '@/utils/sweetAlerts';

export default function Payments() {
    const { payments, bills, students, users, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isEditSaving, setIsEditSaving] = useState(false);

    const [newBillId, setNewBillId] = useState('');
    const [newStudentId, setNewStudentId] = useState('');
    const [newPaymentDate, setNewPaymentDate] = useState('');
    const [newAmountPaid, setNewAmountPaid] = useState('');
    const [newMethod, setNewMethod] = useState('');
    const [newReference, setNewReference] = useState('');
    const [newReceivedBy, setNewReceivedBy] = useState('');

    const [editBillId, setEditBillId] = useState('');
    const [editStudentId, setEditStudentId] = useState('');
    const [editPaymentDate, setEditPaymentDate] = useState('');
    const [editAmountPaid, setEditAmountPaid] = useState('');
    const [editMethod, setEditMethod] = useState('');
    const [editReference, setEditReference] = useState('');
    const [editReceivedBy, setEditReceivedBy] = useState('');

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get('/dashboard/payments', cleanParams({ search }), { replace: true, preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [search]);

    const billLabel = (b) => {
        const s = b.student?.user ? `${b.student.user.first_name} ${b.student.user.last_name}` : '—';
        const y = b.academicYear?.year_name ?? '—';
        return `${s} • ${y} • ${b.total_amount}`;
    };
    const studentLabel = (s) => (s.user ? `${s.user.first_name} ${s.user.last_name}` : '—');
    const userLabel = (u) => u.name;

    const resetNewFields = () => {
        setNewBillId('');
        setNewStudentId('');
        setNewPaymentDate('');
        setNewAmountPaid('');
        setNewMethod('');
        setNewReference('');
        setNewReceivedBy('');
    };

    const createPayment = async () => {
        setIsSaving(true);
        try {
            await router.post('/dashboard/payments', {
                bill_id: newBillId,
                student_id: newStudentId,
                payment_date: newPaymentDate,
                amount_paid: newAmountPaid,
                payment_method: newMethod || null,
                transaction_reference: newReference || null,
                received_by: newReceivedBy || null,
            });
            setIsAddOpen(false);
            resetNewFields();
            router.reload();
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (row) => {
        setEditingId(row.payment_id || row.id);
        setEditBillId(row.bill_id);
        setEditStudentId(row.student_id);
        setEditPaymentDate(row.payment_date);
        setEditAmountPaid(row.amount_paid);
        setEditMethod(row.payment_method || '');
        setEditReference(row.transaction_reference || '');
        setEditReceivedBy(row.received_by || '');
    };

    const saveEdit = async (row) => {
        setIsEditSaving(true);
        try {
            await router.put(`/dashboard/payments/${row.payment_id || row.id}`, {
                bill_id: editBillId,
                student_id: editStudentId,
                payment_date: editPaymentDate,
                amount_paid: editAmountPaid,
                payment_method: editMethod || null,
                transaction_reference: editReference || null,
                received_by: editReceivedBy || null,
            });
            setEditingId(null);
            router.reload();
        } finally {
            setIsEditSaving(false);
        }
    };

    const removePayment = async (row) => {
        const ok = await askConfirmation('Delete this payment?', 'This action cannot be undone.');
        if (!ok) return;
        await router.delete(`/dashboard/payments/${row.payment_id || row.id}`);
        router.reload();
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Payments', href: '/dashboard/payments' }]}>
            <Head title="Payments" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input className="w-64" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student or reference" />
                        <Button onClick={() => setIsAddOpen(true)}>Add Payment</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Payment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bill</label>
                                        <Select value={newBillId} onValueChange={setNewBillId}>
                                            <SelectTrigger><SelectValue placeholder="Select bill" /></SelectTrigger>
                                            <SelectContent>
                                                {bills.map((b) => (
                                                    <SelectItem key={b.bill_id || b.id} value={b.bill_id || b.id}>{billLabel(b)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Student</label>
                                        <Select value={newStudentId} onValueChange={setNewStudentId}>
                                            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                            <SelectContent>
                                                {students.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{studentLabel(s)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Payment Date</label>
                                        <Input type="date" value={newPaymentDate} onChange={(e) => setNewPaymentDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Amount Paid</label>
                                        <Input type="number" value={newAmountPaid} onChange={(e) => setNewAmountPaid(e.target.value)} placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Method</label>
                                        <Select value={newMethod} onValueChange={setNewMethod}>
                                            <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Bank">Bank</SelectItem>
                                                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Transaction Reference</label>
                                        <Input value={newReference} onChange={(e) => setNewReference(e.target.value)} placeholder="Ref #" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Received By</label>
                                        <Select value={newReceivedBy} onValueChange={setNewReceivedBy}>
                                            <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                                            <SelectContent>
                                                {users.map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>{userLabel(u)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={createPayment} disabled={isSaving}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Bill</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Received By</TableHead>
                            <TableHead>Receipt</TableHead>
                            <TableHead>Payment Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(payments.data ?? payments).map((row) => (
                            <TableRow key={row.payment_id || row.id}>
                                <TableCell>{row.student ? studentLabel(row.student) : '—'}</TableCell>
                                <TableCell>{row.bill ? billLabel(row.bill) : '—'}</TableCell>
                                <TableCell>
                                    {editingId === (row.payment_id || row.id) ? (
                                        <Input disabled={isEditSaving} type="number" value={editAmountPaid} onChange={(e) => setEditAmountPaid(e.target.value)} />
                                    ) : (
                                        row.amount_paid
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.payment_id || row.id) ? (
                                        <Select value={editMethod} onValueChange={setEditMethod}>
                                            <SelectTrigger className="w-40"><SelectValue placeholder="Method" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Bank">Bank</SelectItem>
                                                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.payment_method || '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.payment_id || row.id) ? (
                                        <Input disabled={isEditSaving} value={editReference} onChange={(e) => setEditReference(e.target.value)} />
                                    ) : (
                                        row.transaction_reference || '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.payment_id || row.id) ? (
                                        <Select value={editReceivedBy} onValueChange={setEditReceivedBy}>
                                            <SelectTrigger className="w-40"><SelectValue placeholder="User" /></SelectTrigger>
                                            <SelectContent>
                                                {users.map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>{userLabel(u)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.receivedBy ? userLabel(row.receivedBy) : '—'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {row.receipt ? row.receipt.receipt_number : '—'}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.payment_id || row.id) ? (
                                        <Input disabled={isEditSaving} type="date" value={editPaymentDate} onChange={(e) => setEditPaymentDate(e.target.value)} />
                                    ) : (
                                        row.payment_date
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === (row.payment_id || row.id) ? (
                                        <>
                                            <Button onClick={() => saveEdit(row)} disabled={isEditSaving}>Save</Button>
                                            <Button variant="outline" onClick={() => setEditingId(null)} disabled={isEditSaving}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(row)}><Pencil className="size-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => removePayment(row)}><Trash className="size-4" /></Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {payments.links && (
                    <div className="mt-4">
                        <Pagination links={payments.links} filters={cleanParams({ search })} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

