import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash, ChevronDown } from 'lucide-react';
import { cleanParams } from '@/lib/utils';
import { askConfirmation } from '@/utils/sweetAlerts';
import AddButton from '@/components/buttons/AddButton';

export default function PaymentReceipts() {
    const { receipts, payments, users, filters, academicYears, grades } = usePage().props;

    // Filter State
    const [queryParams, setQueryParams] = useState({
        search: filters?.search || '',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
        academic_year_id: filters?.academic_year_id || 'all',
        payment_method: filters?.payment_method || 'all',
        received_by: filters?.received_by || 'all',
        grade_id: filters?.grade_id || 'all',
        min_amount: filters?.min_amount || '',
        max_amount: filters?.max_amount || '',
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Helper to clean params for API
    const getEffectiveParams = (qParams) => {
        const params = cleanParams(qParams);
        Object.keys(params).forEach(key => {
            if (params[key] === 'all') delete params[key];
        });
        return params;
    };

    // Track previous params to prevent initial/redundant fetches
    const prevParamsString = useRef(JSON.stringify(getEffectiveParams({
        search: filters?.search || '',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
        academic_year_id: filters?.academic_year_id || 'all',
        payment_method: filters?.payment_method || 'all',
        received_by: filters?.received_by || 'all',
        grade_id: filters?.grade_id || 'all',
        min_amount: filters?.min_amount || '',
        max_amount: filters?.max_amount || '',
    })));

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isEditSaving, setIsEditSaving] = useState(false);

    // Debounced Search & Filter Effect
    useEffect(() => {
        const effectiveParams = getEffectiveParams(queryParams);
        const paramString = JSON.stringify(effectiveParams);

        // If params haven't effectively changed, do nothing
        if (paramString === prevParamsString.current) {
            return;
        }

        const timeoutId = setTimeout(() => {
            prevParamsString.current = paramString;

            router.get('/dashboard/payment-receipts', effectiveParams, {
                replace: true,
                preserveState: true,
                preserveScroll: true,
            });
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [queryParams]);

    const handleFilterChange = (key, value) => {
        setQueryParams(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setQueryParams({
            search: '',
            date_from: '',
            date_to: '',
            academic_year_id: 'all',
            payment_method: 'all',
            received_by: 'all',
            grade_id: 'all',
            min_amount: '',
            max_amount: '',
        });
    };

    const [newPaymentId, setNewPaymentId] = useState('');
    const [newReceiptNumber, setNewReceiptNumber] = useState('');
    const [newIssuedAt, setNewIssuedAt] = useState('');
    const [newGeneratedBy, setNewGeneratedBy] = useState('');

    const [editPaymentId, setEditPaymentId] = useState('');
    const [editReceiptNumber, setEditReceiptNumber] = useState('');
    const [editIssuedAt, setEditIssuedAt] = useState('');
    const [editGeneratedBy, setEditGeneratedBy] = useState('');

    const paymentLabel = (p) => {
        const s = p.student?.user ? `${p.student.user.first_name} ${p.student.user.last_name}` : '—';
        return `${s} • ${p.amount_paid} • ${p.transaction_reference || '—'}`;
    };
    const userLabel = (u) => u.name || `${u.first_name} ${u.last_name}`;

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
                <div className="mb-6 space-y-4">
                    {/* Filter Controls */}
                    <div className="flex flex-col gap-4">
                        {/* Row 1: Search & Actions */}
                        <div className="flex items-center justify-between gap-4">
                            <Input
                                className="w-96"
                                placeholder="Search receipt, reference..."
                                value={queryParams.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                                    <ChevronDown className={`size-4 mr-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                                    {showAdvancedFilters ? 'Less Filters' : 'More Filters'}
                                </Button>
                                <Button variant="ghost" onClick={resetFilters}>Reset</Button>
                                <AddButton onClick={() => { setIsAddOpen(true); resetNewFields(); }}>Add Receipt</AddButton>
                            </div>
                        </div>

                        {/* Row 2: Primary Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <div>
                                <label className="text-xs font-medium mb-1 block text-gray-500">From Date</label>
                                <Input type="date" value={queryParams.date_from} onChange={(e) => handleFilterChange('date_from', e.target.value)} />
                             </div>
                             <div>
                                <label className="text-xs font-medium mb-1 block text-gray-500">To Date</label>
                                <Input type="date" value={queryParams.date_to} onChange={(e) => handleFilterChange('date_to', e.target.value)} />
                             </div>
                             <div>
                                <label className="text-xs font-medium mb-1 block text-gray-500">Academic Year</label>
                                <Select value={queryParams.academic_year_id} onValueChange={(v) => handleFilterChange('academic_year_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="All Years" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {academicYears?.map(y => (
                                            <SelectItem key={y.id} value={y.id}>{y.year_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             </div>
                             <div>
                                <label className="text-xs font-medium mb-1 block text-gray-500">Method</label>
                                <Select value={queryParams.payment_method} onValueChange={(v) => handleFilterChange('payment_method', v)}>
                                    <SelectTrigger><SelectValue placeholder="All Methods" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Bank">Bank</SelectItem>
                                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>

                        {/* Row 3: Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-dashed">
                                 <div>
                                    <label className="text-xs font-medium mb-1 block text-gray-500">Grade</label>
                                    <Select value={queryParams.grade_id} onValueChange={(v) => handleFilterChange('grade_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="All Grades" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Grades</SelectItem>
                                            {grades?.map(g => (
                                                <SelectItem key={g.id} value={g.id}>{g.grade_name || g.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium mb-1 block text-gray-500">Received By</label>
                                    <Select value={queryParams.received_by} onValueChange={(v) => handleFilterChange('received_by', v)}>
                                        <SelectTrigger><SelectValue placeholder="All Staff" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Staff</SelectItem>
                                            {users?.map(u => (
                                                <SelectItem key={u.id} value={u.id}>{userLabel(u)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium mb-1 block text-gray-500">Min Amount</label>
                                    <Input type="number" placeholder="0.00" value={queryParams.min_amount} onChange={(e) => handleFilterChange('min_amount', e.target.value)} />
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium mb-1 block text-gray-500">Max Amount</label>
                                    <Input type="number" placeholder="0.00" value={queryParams.max_amount} onChange={(e) => handleFilterChange('max_amount', e.target.value)} />
                                 </div>
                            </div>
                        )}
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
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(row)}><Pencil className="size-4" /></Button>
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
                        <Pagination links={receipts.links} filters={queryParams} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
