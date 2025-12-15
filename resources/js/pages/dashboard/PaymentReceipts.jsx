import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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

export default function PaymentReceipts() {
    const { receipts, payments, users, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isEditSaving, setIsEditSaving] = useState(false);

    const [newPaymentId, setNewPaymentId] = useState('');
    const [newReceiptNumber, setNewReceiptNumber] = useState('');
    const [newIssuedAt, setNewIssuedAt] = useState('');
    const [newGeneratedBy, setNewGeneratedBy] = useState('');

    const [editPaymentId, setEditPaymentId] = useState('');
    const [editReceiptNumber, setEditReceiptNumber] = useState('');
    const [editIssuedAt, setEditIssuedAt] = useState('');
    const [editGeneratedBy, setEditGeneratedBy] = useState('');

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get('/dashboard/payment-receipts', cleanParams({ search }), { replace: true, preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [search]);

    const paymentLabel = (p) => {
        const s = p.student?.user ? `${p.student.user.first_name} ${p.student.user.last_name}` : '—';
        return `${s} • ${p.amount_paid} • ${p.transaction_reference || '—'}`;
    };
    const userLabel = (u) => u.name;

    const resetNewFields = () => {
        setNewPaymentId('');
        setNewReceiptNumber('');
        setNewIssuedAt('');
        setNewGeneratedBy('');
    };

    const createReceipt = async () => {
        setIsSaving(true);
        try {
            await router.post('/dashboard/payment-receipts', {
                payment_id: newPaymentId,
                receipt_number: newReceiptNumber,
                issued_at: newIssuedAt,
                generated_by: newGeneratedBy || null,
            });
            setIsAddOpen(false);
            resetNewFields();
            router.reload();
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (row) => {
        setEditingId(row.receipt_id || row.id);
        setEditPaymentId(row.payment_id);
        setEditReceiptNumber(row.receipt_number);
        setEditIssuedAt(row.issued_at);
        setEditGeneratedBy(row.generated_by || '');
    };

    const saveEdit = async (row) => {
        setIsEditSaving(true);
        try {
            await router.put(`/dashboard/payment-receipts/${row.receipt_id || row.id}`, {
                payment_id: editPaymentId,
                receipt_number: editReceiptNumber,
                issued_at: editIssuedAt,
                generated_by: editGeneratedBy || null,
            });
            setEditingId(null);
            router.reload();
        } finally {
            setIsEditSaving(false);
        }
    };

    const removeReceipt = async (row) => {
        const ok = await askConfirmation('Delete this receipt?', 'This action cannot be undone.');
        if (!ok) return;
        await router.delete(`/dashboard/payment-receipts/${row.receipt_id || row.id}`);
        router.reload();
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Payment Receipts', href: '/dashboard/payment-receipts' }]}>
            <Head title="Payment Receipts" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input className="w-64" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by receipt or reference" />
                        <Button onClick={() => setIsAddOpen(true)}>Add Receipt</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Receipt</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Payment</label>
                                        <Select value={newPaymentId} onValueChange={setNewPaymentId}>
                                            <SelectTrigger><SelectValue placeholder="Select payment" /></SelectTrigger>
                                            <SelectContent>
                                                {payments.map((p) => (
                                                    <SelectItem key={p.payment_id || p.id} value={p.payment_id || p.id}>{paymentLabel(p)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Receipt Number</label>
                                        <Input value={newReceiptNumber} onChange={(e) => setNewReceiptNumber(e.target.value)} placeholder="RCPT-001" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Issued At</label>
                                        <Input type="datetime-local" value={newIssuedAt} onChange={(e) => setNewIssuedAt(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Generated By</label>
                                        <Select value={newGeneratedBy} onValueChange={setNewGeneratedBy}>
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
                                <Button onClick={createReceipt} disabled={isSaving}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Payment</TableHead>
                            <TableHead>Receipt #</TableHead>
                            <TableHead>Issued At</TableHead>
                            <TableHead>Generated By</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(receipts.data ?? receipts).map((row) => (
                            <TableRow key={row.receipt_id || row.id}>
                                <TableCell>{row.payment ? paymentLabel(row.payment) : '—'}</TableCell>
                                <TableCell>
                                    {editingId === (row.receipt_id || row.id) ? (
                                        <Input disabled={isEditSaving} value={editReceiptNumber} onChange={(e) => setEditReceiptNumber(e.target.value)} />
                                    ) : (
                                        row.receipt_number
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.receipt_id || row.id) ? (
                                        <Input disabled={isEditSaving} type="datetime-local" value={editIssuedAt} onChange={(e) => setEditIssuedAt(e.target.value)} />
                                    ) : (
                                        row.issued_at
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.receipt_id || row.id) ? (
                                        <Select value={editGeneratedBy} onValueChange={setEditGeneratedBy}>
                                            <SelectTrigger className="w-40"><SelectValue placeholder="User" /></SelectTrigger>
                                            <SelectContent>
                                                {users.map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>{userLabel(u)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        row.generatedBy ? userLabel(row.generatedBy) : '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === (row.receipt_id || row.id) ? (
                                        <>
                                            <Button onClick={() => saveEdit(row)} disabled={isEditSaving}>Save</Button>
                                            <Button variant="outline" onClick={() => setEditingId(null)} disabled={isEditSaving}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="icon" variant="ghost" onClick={() => {
                                                setEditPaymentId(row.payment_id);
                                                setEditReceiptNumber(row.receipt_number);
                                                setEditIssuedAt(row.issued_at);
                                                setEditGeneratedBy(row.generated_by || '');
                                                setEditingId(row.receipt_id || row.id);
                                            }}><Pencil className="size-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => removeReceipt(row)}><Trash className="size-4" /></Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {receipts.links && (
                    <div className="mt-4">
                        <Pagination links={receipts.links} filters={cleanParams({ search })} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

