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

export default function FeeNotifications() {
    const { notifications, students, bills, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isEditSaving, setIsEditSaving] = useState(false);

    const [newStudentId, setNewStudentId] = useState('');
    const [newBillId, setNewBillId] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [newSentAt, setNewSentAt] = useState('');

    const [editStudentId, setEditStudentId] = useState('');
    const [editBillId, setEditBillId] = useState('');
    const [editMessage, setEditMessage] = useState('');
    const [editSentAt, setEditSentAt] = useState('');

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get('/dashboard/fee-notifications', cleanParams({ search }), { replace: true, preserveState: true });
        }, 400);
        return () => clearTimeout(delay);
    }, [search]);

    const studentLabel = (s) => (s.user ? `${s.user.first_name} ${s.user.last_name}` : '—');
    const billLabel = (b) => {
        const s = b.student?.user ? `${b.student.user.first_name} ${b.student.user.last_name}` : '—';
        const y = b.academicYear?.year_name ?? '—';
        return `${s} • ${y} • ${b.total_amount}`;
    };

    const resetNewFields = () => {
        setNewStudentId('');
        setNewBillId('');
        setNewMessage('');
        setNewSentAt('');
    };

    const createNotification = async () => {
        setIsSaving(true);
        try {
            await router.post('/dashboard/fee-notifications', {
                student_id: newStudentId,
                bill_id: newBillId,
                message: newMessage,
                sent_at: newSentAt || null,
            });
            setIsAddOpen(false);
            resetNewFields();
            router.reload();
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (row) => {
        setEditingId(row.fee_notification_id || row.id);
        setEditStudentId(row.student_id);
        setEditBillId(row.bill_id);
        setEditMessage(row.message);
        setEditSentAt(row.sent_at || '');
    };

    const saveEdit = async (row) => {
        setIsEditSaving(true);
        try {
            await router.put(`/dashboard/fee-notifications/${row.fee_notification_id || row.id}`, {
                student_id: editStudentId,
                bill_id: editBillId,
                message: editMessage,
                sent_at: editSentAt || null,
            });
            setEditingId(null);
            router.reload();
        } finally {
            setIsEditSaving(false);
        }
    };

    const removeNotification = async (row) => {
        const ok = await askConfirmation('Delete this notification?', 'This action cannot be undone.');
        if (!ok) return;
        await router.delete(`/dashboard/fee-notifications/${row.fee_notification_id || row.id}`);
        router.reload();
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Fee Notifications', href: '/dashboard/fee-notifications' }]}>
            <Head title="Fee Notifications" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input className="w-64" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student or message" />
                        <Button onClick={() => setIsAddOpen(true)}>Add Notification</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Notification</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Message</label>
                                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Notification message" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sent At</label>
                                    <Input type="datetime-local" value={newSentAt} onChange={(e) => setNewSentAt(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={createNotification} disabled={isSaving}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Bill</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Sent At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(notifications.data ?? notifications).map((row) => (
                            <TableRow key={row.fee_notification_id || row.id}>
                                <TableCell>{row.student ? studentLabel(row.student) : '—'}</TableCell>
                                <TableCell>{row.bill ? billLabel(row.bill) : '—'}</TableCell>
                                <TableCell>
                                    {editingId === (row.fee_notification_id || row.id) ? (
                                        <Input disabled={isEditSaving} value={editMessage} onChange={(e) => setEditMessage(e.target.value)} />
                                    ) : (
                                        row.message
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === (row.fee_notification_id || row.id) ? (
                                        <Input disabled={isEditSaving} type="datetime-local" value={editSentAt} onChange={(e) => setEditSentAt(e.target.value)} />
                                    ) : (
                                        row.sent_at || '—'
                                    )}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    {editingId === (row.fee_notification_id || row.id) ? (
                                        <>
                                            <Button onClick={() => saveEdit(row)} disabled={isEditSaving}>Save</Button>
                                            <Button variant="outline" onClick={() => setEditingId(null)} disabled={isEditSaving}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="icon" variant="ghost" onClick={() => {
                                                setEditStudentId(row.student_id);
                                                setEditBillId(row.bill_id);
                                                setEditMessage(row.message);
                                                setEditSentAt(row.sent_at || '');
                                                setEditingId(row.fee_notification_id || row.id);
                                            }}><Pencil className="size-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => removeNotification(row)}><Trash className="size-4" /></Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {notifications.links && (
                    <div className="mt-4">
                        <Pagination links={notifications.links} filters={cleanParams({ search })} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

