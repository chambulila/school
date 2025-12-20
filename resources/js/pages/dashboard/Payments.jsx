import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash, Search, Check, RefreshCw, Download } from 'lucide-react';
import { cleanParams } from '@/lib/utils';
import { askConfirmation } from '@/utils/sweetAlerts';
import AddButton from '@/components/buttons/AddButton';
import EditButton from '@/components/buttons/EditButon';
import DeleteButton from '@/components/buttons/DeleteButton';
import SaveButton from '@/components/buttons/SaveButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';

export default function Payments() {
    const { payments, bills, students, users, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isEditSaving, setIsEditSaving] = useState(false);

    // Wizard State
    const [wizardStep, setWizardStep] = useState(1);
    const [studentQuery, setStudentQuery] = useState('');
    const [foundStudents, setFoundStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentBills, setStudentBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [errors, setErrors] = useState({});

    // Form State
    const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);
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

    // Student Search Debounce
    useEffect(() => {
        if (wizardStep !== 1 || !studentQuery) {
            setFoundStudents([]);
            return;
        }
        const delay = setTimeout(async () => {
            try {
                const res = await fetch(`/dashboard/payments/search-students?query=${encodeURIComponent(studentQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setFoundStudents(data);
                }
            } catch (error) {
                console.error("Search error", error);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [studentQuery, wizardStep]);

    const selectStudent = async (student) => {
        setSelectedStudent(student);
        try {
            const res = await fetch(`/dashboard/payments/student-bills/${student.id}`);
            if (res.ok) {
                const data = await res.json();
                setStudentBills(data);
                setWizardStep(2);
            }
        } catch (error) {
            console.error("Fetch bills error", error);
        }
    };

    const selectBill = (bill) => {
        setSelectedBill(bill);
        setNewAmountPaid(''); // Reset amount
        setWizardStep(3);
    };

    const generateReference = async () => {
        try {
            const res = await fetch('/dashboard/payments/generate-reference');
            if (res.ok) {
                const data = await res.json();
                setNewReference(data.reference);
            }
        } catch (error) {
            console.error("Generate ref error", error);
        }
    };

    const studentLabel = (s) => (s.user ? `${s.user.first_name} ${s.user.last_name}` : '—');
    const userLabel = (u) => u.name || `${u.first_name} ${u.last_name}`;
    const billLabel = (b) => {
         const s = b.student?.user ? `${b.student.user.first_name} ${b.student.user.last_name}` : '—';
         const y = b.academicYear?.year_name ?? '—';
         return `${s} • ${y} • ${b.total_amount}`;
    };

    const resetNewFields = () => {
        setWizardStep(1);
        setErrors({});
        setStudentQuery('');
        setFoundStudents([]);
        setSelectedStudent(null);
        setStudentBills([]);
        setSelectedBill(null);
        setNewPaymentDate(new Date().toISOString().split('T')[0]);
        setNewAmountPaid('');
        setNewMethod('');
        setNewReference('');
        setNewReceivedBy('');
    };

    const createPayment = async () => {

        const confirmed = await askConfirmation('Are you sure you want to create this payment? This action cannot be undone.');
        if (confirmed) {
        if (!selectedBill || !selectedStudent) return;
        setIsSaving(true);
        setErrors({});

        router.post('/dashboard/payments', {
            bill_id: selectedBill.bill_id,
            student_id: selectedStudent.id,
            payment_date: newPaymentDate,
            amount_paid: newAmountPaid,
            payment_method: newMethod || null,
            transaction_reference: newReference || null,
            received_by: newReceivedBy || null,
        }, {
            onSuccess: () => {
                setIsAddOpen(false);
                resetNewFields();
            },
            onError: (err) => {
                setErrors(err);
            },
            onFinish: () => {
                setIsSaving(false);
            }
        });
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
        const confirmed = await askConfirmation('Are you sure you want to update this payment? This action cannot be undone.');
        if (!confirmed) return;
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
                        <AddButton onClick={() => { setIsAddOpen(true); resetNewFields(); }}>Add Payment</AddButton>
                    </div>

                    <Dialog open={isAddOpen}
                    // onOpenChange={setIsAddOpen}
                    >
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {wizardStep === 1 && "Select Student"}
                                    {wizardStep === 2 && "Select Bill"}
                                    {wizardStep === 3 && "Payment Details"}
                                </DialogTitle>
                            </DialogHeader>

                            {/* Step 1: Search Student */}
                            {wizardStep === 1 && (
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Search by name or admission number..."
                                        value={studentQuery}
                                        onChange={(e) => setStudentQuery(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="border rounded-md max-h-60 overflow-y-auto">
                                        {foundStudents.length === 0 && studentQuery && (
                                            <div className="p-4 text-center text-gray-500">No students found.</div>
                                        )}
                                        {foundStudents.map(student => (
                                            <div
                                                key={student.id}
                                                className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                                onClick={() => selectStudent(student)}
                                            >
                                                <div>
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-sm text-gray-500">{student.admission_number}</div>
                                                </div>
                                                <Button size="sm" variant="ghost"><Check className="size-4" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Bill */}
                            {wizardStep === 2 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                        <div>
                                            <div className="text-sm text-gray-500">Selected Student</div>
                                            <div className="font-medium">{selectedStudent?.name} ({selectedStudent?.admission_number})</div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setWizardStep(1)}>Change</Button>
                                    </div>

                                    <div className="text-sm font-medium mb-2">Unpaid Bills</div>
                                    <div className="border rounded-md max-h-60 overflow-y-auto">
                                        {studentBills.length === 0 && (
                                            <div className="p-4 text-center text-gray-500">No unpaid bills found for this student.</div>
                                        )}
                                        {studentBills.map(bill => (
                                            <div
                                                key={bill.bill_id}
                                                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                                                onClick={() => selectBill(bill)}
                                            >
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{bill.academic_year}</span>
                                                    <span className={`text-sm px-2 py-0.5 rounded-full ${bill.status === 'Pending' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {bill.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between mt-1 text-sm">
                                                    <span className="text-gray-500">Total: {bill.total_amount}</span>
                                                    <span className="font-semibold text-green-600">Balance: {bill.balance}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Payment Details */}
                            {wizardStep === 3 && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Student:</span>
                                            <span className="font-medium">{selectedStudent?.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Academic Year:</span>
                                            <span className="font-medium">{selectedBill?.academic_year}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-t pt-2 mt-2">
                                            <span className="text-gray-500">Outstanding Balance:</span>
                                            <span className="font-bold text-lg text-green-600">{selectedBill?.balance}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Amount Paid</label>
                                            <Input
                                                type="number"
                                                value={newAmountPaid}
                                                onChange={(e) => setNewAmountPaid(e.target.value)}
                                                placeholder="0.00"
                                                max={selectedBill?.balance}
                                            />
                                            {errors.amount_paid && <div className="text-red-500 text-sm mt-1">{errors.amount_paid}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Payment Date</label>
                                            <Input type="date" value={newPaymentDate} onChange={(e) => setNewPaymentDate(e.target.value)} />
                                            {errors.payment_date && <div className="text-red-500 text-sm mt-1">{errors.payment_date}</div>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                                        <Select value={newMethod} onValueChange={setNewMethod}>
                                            <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Bank">Bank</SelectItem>
                                                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_method && <div className="text-red-500 text-sm mt-1">{errors.payment_method}</div>}
                                    </div>

                                    {newMethod === 'Cash' ? (
                                        <div className="flex items-end gap-2">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium mb-1">Reference Number</label>
                                                <Input value={newReference} readOnly placeholder="Auto-generated" className="bg-gray-100" />
                                            </div>
                                            <Button type="button" variant="outline" onClick={generateReference}>
                                                <RefreshCw className="size-4 mr-2" /> Generate
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Transaction Reference</label>
                                            <Input
                                                value={newReference}
                                                onChange={(e) => setNewReference(e.target.value)}
                                                placeholder={newMethod ? "Enter reference number" : "Select method first"}
                                                disabled={!newMethod}
                                            />
                                            {errors.transaction_reference && <div className="text-red-500 text-sm mt-1">{errors.transaction_reference}</div>}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Received By</label>
                                        <Select value={newReceivedBy} onValueChange={setNewReceivedBy}>
                                            <SelectTrigger><SelectValue placeholder="Select user (optional)" /></SelectTrigger>
                                            <SelectContent>
                                                {users.map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>{userLabel(u)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.received_by && <div className="text-red-500 text-sm mt-1">{errors.received_by}</div>}
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="mt-4">
                                {wizardStep > 1 && (
                                    <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)}>Back</Button>
                                )}
                                {wizardStep < 3 ? (
                                    <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                ) : (
                                    <Button onClick={createPayment} disabled={isSaving || !newAmountPaid || !newMethod}>
                                        Confirm Payment
                                    </Button>
                                )}
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
                                <TableCell className="space-x-2 flex items-center">
                                    {editingId === (row.payment_id || row.id) ? (
                                        <>
                                            <SaveButton onClick={() => saveEdit(row)} disabled={isEditSaving} />
                                            <SecondaryButton variant="outline" onClick={() => setEditingId(null)} disabled={isEditSaving}>Cancel</SecondaryButton>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                title="Download Receipt"
                                                onClick={() => window.open(`/dashboard/payments/${row.payment_id || row.id}/receipt`, '_blank')}
                                                disabled={!row.receipt}
                                            >
                                                <Download className="size-4" />
                                            </Button>
                                            <EditButton size="icon" variant="ghost" onClick={() => startEdit(row)} />
                                            <DeleteButton size="icon" variant="ghost" onClick={() => removePayment(row)} />
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
