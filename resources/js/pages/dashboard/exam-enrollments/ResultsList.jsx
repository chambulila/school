import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cleanParams } from '@/lib/utils';
import { Eye } from 'lucide-react';

export default function ResultsList() {
    const { props } = usePage();
    const exams = useMemo(() => props.exams ?? [], [props.exams]);
    const academicYears = useMemo(() => props.academicYears ?? [], [props.academicYears]);
    const initialFilters = props.filters || {};

    // Unified Filter State
    const [queryParams, setQueryParams] = useState({
        search: initialFilters.search || '',
        academic_year_id: initialFilters.academic_year_id || 'all',
    });

    const prevParamsString = useRef(JSON.stringify(queryParams));

    const handleFilterChange = (key, value) => {
        setQueryParams(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setQueryParams({
            search: '',
            academic_year_id: 'all',
        });
    };

    const isMounted = useRef(false);

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
            router.get('/dashboard/exams/enrollments/results', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 500);
        return () => clearTimeout(timeout);
    }, [queryParams]);

    return (
        <AuthenticatedLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Exam Results', href: '/dashboard/exams/enrollments/results' },
        ]}>
            <Head title="Exam Results" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2 items-center flex-1">
                        <Input
                            className="w-64"
                            placeholder="Search exams..."
                            value={queryParams.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                         <Select value={queryParams.academic_year_id} onValueChange={(v) => handleFilterChange('academic_year_id', v)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Academic Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {academicYears.map(y => (
                                    <SelectItem key={y.id} value={y.id}>{y.year_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" onClick={resetFilters}>Reset</Button>
                    </div>
                </div>

                <div className="bg-white border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Exam Name</TableHead>
                                <TableHead>Term</TableHead>
                                <TableHead>Academic Year</TableHead>
                                <TableHead>Enrollments</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                                        No exams found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                exams.data.map((exam) => (
                                    <TableRow key={exam.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.get(`/dashboard/exams/enrollments/${exam.id}`)}>
                                        <TableCell className="font-medium">{exam.exam_name}</TableCell>
                                        <TableCell>{exam.term_name}</TableCell>
                                        <TableCell>{exam.academic_year?.year_name || '—'}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${exam.results_count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {exam.results_count} Results
                                            </span>
                                        </TableCell>
                                        <TableCell>{exam.start_date}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={(e) => {
                                                e.stopPropagation();
                                                router.get(`/dashboard/exams/enrollments/${exam.id}`);
                                            }}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Results
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {exams.links && (
                    <div className="mt-4">
                        <Pagination links={exams.links} filters={cleanParams(queryParams)} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
