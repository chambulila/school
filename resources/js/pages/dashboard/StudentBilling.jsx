import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cleanParams } from '@/lib/utils';
import { askConfirmation } from '@/utils/sweetAlerts';
import SaveButton from '@/components/buttons/SaveButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import DeleteButton from '@/components/buttons/DeleteButton';
import AddButton from '@/components/buttons/AddButton';
import SearchableSelect from '@/components/ui/SearchableSelect';

import { Checkbox } from "@/components/ui/checkbox"

export default function StudentBillingPage() {
    const { props } = usePage();
    const bills = useMemo(() => props.bills ?? [], [props.bills]);
    const students = useMemo(() => props.students ?? [], [props.students]);
    const years = useMemo(() => props.years ?? [], [props.years]);

    const feeStructures = useMemo(() => props.feeStructures ?? [], [props.feeStructures]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [queryParams, setQueryParams] = useState({
        search: initialFilters.search || ''
    });
    const isMounted = useRef(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newStudentId, setNewStudentId] = useState('');
    const [newYearId, setNewYearId] = useState('');
    const [selectedFeeStructureIds, setSelectedFeeStructureIds] = useState([]);
    const [newIssuedDate, setNewIssuedDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Set default active year when dialog opens
    useEffect(() => {
        if (isAddOpen && !newYearId) {
            const activeYear = years.find(y => y.is_active);
            if (activeYear) {
                setNewYearId(activeYear.id);
            }
        }
        if (!isAddOpen) {
            // Reset state when closed
             setNewStudentId('');
             // Don't reset year if we want it to persist, but maybe safer to reset or keep active default
             const activeYear = years.find(y => y.is_active);
             setNewYearId(activeYear ? activeYear.id : '');
             setSelectedFeeStructureIds([]);
             setNewIssuedDate('');
        }
    }, [isAddOpen, years]);

    const [editingId, setEditingId] = useState(null);
    const [editStudentId, setEditStudentId] = useState('');
    const [editYearId, setEditYearId] = useState('');
    const [editTotal, setEditTotal] = useState('');
    const [editPaid, setEditPaid] = useState('');
    const [editStatus, setEditStatus] = useState('unpaid');
    const [editIssuedDate, setEditIssuedDate] = useState('');


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
            router.get('/dashboard/student-billing', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [queryParams]);

    const cancelEdit = () => {
        setEditingId(null);
        setEditStudentId(''); setEditYearId('');
        setEditTotal(''); setEditPaid('');
        setEditStatus('unpaid'); setEditIssuedDate('');
    };


    const handleFeeStructureToggle = (id) => {
        setSelectedFeeStructureIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAllFees = (checked) => {
        if (checked) {
            setSelectedFeeStructureIds(feeStructures.map(fs => fs.id));
        } else {
            setSelectedFeeStructureIds([]);
        }
    };

    const createBill = async () => {
        if (!newStudentId || !newYearId || selectedFeeStructureIds.length === 0 || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/student-billing', {
            student_id: newStudentId,
            academic_year_id: newYearId,
            fee_structure_ids: selectedFeeStructureIds,
            status: 'unpaid',
            issued_date: newIssuedDate || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
            onError: () => setIsAddOpen(true),
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
            <div className="p-4 md:p-6">
                <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <Input
                        className="w-full md:w-64"
                        value={queryParams.search}
                        onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value })}
                        placeholder="Search by student or academic year"
                    />
                    <AddButton onClick={() => setIsAddOpen(true)} className="w-full md:w-auto">Add Bill</AddButton>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="w-full max-w-[95vw] md:max-w-3xl lg:max-w-6xl">
                            <DialogHeader>
                                <DialogTitle>Add Student Bill</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">1. Select Student</label>
                                    <SearchableSelect
                                        value={newStudentId}
                                        onChange={setNewStudentId}
                                        options={students}
                                        getLabel={studentLabel}
                                        getValue={(s) => s.id}
                                        placeholder="Select student"
                                    />
                                    {errors.student_id && <div className="text-red-500 text-sm mt-1">{errors.student_id}</div>}
                                </div>

                                {newStudentId && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-medium mb-1">2. Select Academic Year</label>
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
                                )}

                                {newStudentId && newYearId && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-medium">3. Select Fees</label>
                                            <div className="flex items-center space-x-2">
                                                 <Checkbox
                                                    id="select-all"
                                                    checked={feeStructures.length > 0 && selectedFeeStructureIds.length === feeStructures.length}
                                                    onCheckedChange={handleSelectAllFees}
                                                 />
                                                 <label htmlFor="select-all" className="text-sm cursor-pointer">Select All</label>
                                            </div>
                                        </div>

                                        <div className="border rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                                            {feeStructures.length > 0 ? (
                                                feeStructures.map((fs) => (
                                                    <div key={fs.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                                                        <Checkbox
                                                            id={`fee-${fs.id}`}
                                                            checked={selectedFeeStructureIds.includes(fs.id)}
                                                            onCheckedChange={() => handleFeeStructureToggle(fs.id)}
                                                        />
                                                        <label htmlFor={`fee-${fs.id}`} className="text-sm flex-1 cursor-pointer">
                                                            <span className="font-medium">{fs.name.split(' - ')[0]}</span>
                                                            <span className="text-gray-500 text-xs ml-2">({parseFloat(fs.amount).toFixed(2)})</span>
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-500 py-4 text-sm">
                                                    No fee structures found for this student's grade in the selected year.
                                                </div>
                                            )}
                                        </div>
                                        {errors.fee_structure_ids && <div className="text-red-500 text-sm mt-1">{errors.fee_structure_ids}</div>}

                                        {/* <div>
                                            <label className="block text-sm font-medium mb-1">Issued Date (optional)</label>
                                            <Input type="date" value={newIssuedDate} onChange={(e) => setNewIssuedDate(e.target.value)} />
                                            {errors.issued_date && <div className="text-red-500 text-sm mt-1">{errors.issued_date}</div>}
                                        </div> */}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <SecondaryButton onClick={() => setIsAddOpen(false)} disabled={isSaving}>
                                    Cancel
                                </SecondaryButton>
                                <SaveButton onClick={createBill} disabled={isSaving || !newStudentId || !newYearId || selectedFeeStructureIds.length === 0}>
                                    {isSaving ? 'Saving' : 'Save Bills'}
                                </SaveButton>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-x-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="min-w-[150px]">Student</TableHead>
                                <TableHead className="min-w-[100px]">Admission#</TableHead>
                                <TableHead className="min-w-[120px]">Academic Year</TableHead>
                                <TableHead className="min-w-[150px]">Fee Type</TableHead>
                                <TableHead className="min-w-[100px]">Total</TableHead>
                                <TableHead className="min-w-[100px]">Paid</TableHead>
                                <TableHead className="min-w-[100px]">Balance</TableHead>
                                <TableHead className="min-w-[120px]">Status</TableHead>
                                <TableHead className="min-w-[120px]">Issued</TableHead>
                                <TableHead className="min-w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {(bills.data ?? bills).map((row, index) => (
                            <TableRow key={row.bill_id || row.id}>
                                <TableCell>{index + 1}</TableCell>
                                  <TableCell>{row.student ? studentLabel(row.student) : '—'}</TableCell>
                                <TableCell>{row.student?.user?.admission_number || '—'}</TableCell>
                                <TableCell>{row.academic_year ? yearLabel(row.academic_year) : '—'}</TableCell>
                                <TableCell>{row.fee_category_name || 'General'}</TableCell>
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
                                            {/* <EditButton  onClick={() => startEdit(row)} /> */}
                                            <DeleteButton onClick={() => deleteBill(row)} />
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
                {bills.links && (
                    <div className="mt-4">
                        <Pagination links={bills.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
        </AuthenticatedLayout>
    );
}

