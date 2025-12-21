import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, Search, X } from 'lucide-react';
import { cleanParams } from '@/lib/utils';

export default function PaymentReports() {
    const { payments, academicYears, grades, filters } = usePage().props;

    const [queryParams, setQueryParams] = useState({
        academic_year_id: filters?.academic_year_id || 'all',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
        student_id: filters?.student_id || '', // We might need a better way to select student, but text search is easier for now
        grade_id: filters?.grade_id || 'all',
        payment_method: filters?.payment_method || 'all',
        receipt_number: filters?.receipt_number || '',
        transaction_reference: filters?.transaction_reference || '',
    });

    const handleFilterChange = (key, value) => {
        setQueryParams(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = { ...queryParams };
        // Remove 'all' values
        Object.keys(params).forEach(key => {
            if (params[key] === 'all') delete params[key];
        });

        router.get('/dashboard/reports/payments', cleanParams(params), { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setQueryParams({
            academic_year_id: 'all',
            date_from: '',
            date_to: '',
            student_id: '',
            grade_id: 'all',
            payment_method: 'all',
            receipt_number: '',
            transaction_reference: '',
        });
        router.get('/dashboard/reports/payments', {}, { preserveState: true, replace: true });
    };

    const exportPdf = () => {
        const params = cleanParams({ ...queryParams });
        // Remove 'all'
        Object.keys(params).forEach(key => {
            if (params[key] === 'all') delete params[key];
        });
        const queryString = new URLSearchParams(params).toString();
        window.open(`/dashboard/reports/payments/export/pdf?${queryString}`, '_blank');
    };

    const previewPdf = () => {
        const params = cleanParams({ ...queryParams });
        // Remove 'all'
        Object.keys(params).forEach(key => {
            if (params[key] === 'all') delete params[key];
        });
        params.preview = true;
        const queryString = new URLSearchParams(params).toString();
        window.open(`/dashboard/reports/payments/export/pdf?${queryString}`, '_blank');
    };

    const exportExcel = () => {
        const params = cleanParams({ ...queryParams });
        Object.keys(params).forEach(key => {
            if (params[key] === 'all') delete params[key];
        });
        const queryString = new URLSearchParams(params).toString();
        window.open(`/dashboard/reports/payments/export/excel?${queryString}`, '_blank');
    };

    const studentLabel = (s) => (s.user ? `${s.user.first_name} ${s.user.last_name}` : '—');
    const billLabel = (b) => {
         const s = b.student?.user ? `${b.student.user.first_name} ${b.student.user.last_name}` : '—';
         const y = b.academic_year?.year_name ?? '—';
         return `${s} • ${y} • ${b.total_amount}`;
    };
    const userLabel = (u) => u ? (u.name || `${u.first_name} ${u.last_name}`) : 'System';

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Payment Reports', href: '/dashboard/reports/payments' }]}>
            <Head title="Payment Reports" />
            <div className="p-6 space-y-6">

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Filter Payments</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={clearFilters}><X className="size-4 mr-2"/> Clear</Button>
                            <Button size="sm" onClick={applyFilters}><Search className="size-4 mr-2"/> Apply Filters</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium">Academic Year</label>
                            <Select value={queryParams.academic_year_id} onValueChange={(v) => handleFilterChange('academic_year_id', v)}>
                                <SelectTrigger><SelectValue placeholder="All Years" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {academicYears.map(y => (
                                        <SelectItem key={y.academic_year_id} value={y.academic_year_id}>{y.year_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Grade</label>
                            <Select value={queryParams.grade_id} onValueChange={(v) => handleFilterChange('grade_id', v)}>
                                <SelectTrigger><SelectValue placeholder="All Grades" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Grades</SelectItem>
                                    {grades.map(g => (
                                        <SelectItem key={g.grade_id} value={g.grade_id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Payment Method</label>
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

                        <div>
                            <label className="text-sm font-medium">Receipt Number</label>
                            <Input
                                placeholder="Search Receipt..."
                                value={queryParams.receipt_number}
                                onChange={(e) => handleFilterChange('receipt_number', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Reference</label>
                            <Input
                                placeholder="Search Reference..."
                                value={queryParams.transaction_reference}
                                onChange={(e) => handleFilterChange('transaction_reference', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Date From</label>
                            <Input
                                type="date"
                                value={queryParams.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Date To</label>
                            <Input
                                type="date"
                                value={queryParams.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions & Table */}
                <div className="bg-white border rounded-lg shadow-sm">
                    <div className="p-4 border-b flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Showing {payments.from ?? 0} to {payments.to ?? 0} of {payments.total} results
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={exportExcel}>
                                <FileSpreadsheet className="size-4 mr-2" /> Export Excel
                            </Button>
                            <Button variant="outline" size="sm" onClick={previewPdf}>
                                <Search className="size-4 mr-2" /> Preview
                            </Button>
                            <Button variant="outline" size="sm" onClick={exportPdf}>
                                <Download className="size-4 mr-2" /> Export PDF
                            </Button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Receipt</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Admission</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Received By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center h-24 text-gray-500">
                                        No payments found matching criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                            {payments.data.map((row) => (
                                <TableRow key={row.payment_id || row.id}>
                                    <TableCell>{row.receipt ? row.receipt.receipt_number : '—'}</TableCell>
                                    <TableCell>{row.student ? studentLabel(row.student) : '—'}</TableCell>
                                    <TableCell>{row.student?.admission_number || '—'}</TableCell>
                                    <TableCell>{row.bill?.academic_year?.year_name || '—'}</TableCell>
                                    <TableCell>{row.student?.current_class?.grade?.grade_name || '—'}</TableCell>
                                    <TableCell>{row.amount_paid}</TableCell>
                                    <TableCell>{row.payment_method || '—'}</TableCell>
                                    <TableCell>{row.transaction_reference || '—'}</TableCell>
                                    <TableCell>{row.payment_date}</TableCell>
                                    <TableCell>{userLabel(row.received_by)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {payments.links && (
                        <div className="p-4 border-t">
                            <Pagination links={payments.links} filters={queryParams} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
