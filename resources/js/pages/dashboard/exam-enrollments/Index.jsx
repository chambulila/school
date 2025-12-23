import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination from '@/components/ui/pagination';
import { cleanParams } from '@/lib/utils';
import { Save } from 'lucide-react';

export default function ExamEnrollmentIndex() {
    const { exam, results, subjects, classSections, filters } = usePage().props;
    const [localResults, setLocalResults] = useState(results.data || []);
    const [hasChanges, setHasChanges] = useState(false);
    const [savingRows, setSavingRows] = useState([]);
    const [isSavingAll, setIsSavingAll] = useState(false);

    // Sync local results when props change (e.g. pagination/search)
    useEffect(() => {
        setLocalResults(results.data || []);
        setHasChanges(false);
    }, [results.data]);

    // Grade Calculation Logic (Mirrors Backend)
    const calculateGrade = (score) => {
        if (score === '' || score === null) return { grade: '', remarks: '' };
        const s = parseFloat(score);
        if (isNaN(s)) return { grade: '', remarks: '' };
        
        if (s >= 80) return { grade: 'A', remarks: 'Excellent' };
        if (s >= 70) return { grade: 'B', remarks: 'Very Good' };
        if (s >= 60) return { grade: 'C', remarks: 'Good' };
        if (s >= 50) return { grade: 'D', remarks: 'Fair' };
        if (s >= 40) return { grade: 'E', remarks: 'Poor' };
        return { grade: 'F', remarks: 'Fail' };
    };

    const handleScoreChange = (id, value) => {
        // Validate range 0-100
        let val = value;
        if (val !== '' && (parseFloat(val) < 0 || parseFloat(val) > 100)) return;

        setLocalResults(prev => prev.map(row => {
            if (row.id === id) {
                const { grade, remarks } = calculateGrade(val);
                return { ...row, score: val, grade, remarks, isDirty: true };
            }
            return row;
        }));
        setHasChanges(true);
    };

    const saveRow = (row) => {
        if (!row.isDirty) return;
        setSavingRows(prev => [...prev, row.id]);
        
        router.post(route('admin.exam-enrollments.update-scores'), {
            results: [{ id: row.id, score: row.score }]
        }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setSavingRows(prev => prev.filter(id => id !== row.id));
                setLocalResults(prev => prev.map(r => r.id === row.id ? { ...r, isDirty: false } : r));
            }
        });
    };

    const saveAll = () => {
        const dirtyRows = localResults.filter(r => r.isDirty);
        if (dirtyRows.length === 0) return;
        
        setIsSavingAll(true);
        router.post(route('admin.exam-enrollments.update-scores'), {
            results: dirtyRows.map(r => ({ id: r.id, score: r.score }))
        }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setIsSavingAll(false);
                setHasChanges(false);
                setLocalResults(prev => prev.map(r => ({ ...r, isDirty: false })));
            }
        });
    };

    // Filter Logic
    const [filterParams, setFilterParams] = useState({
        search: filters.search || '',
        subject_id: filters.subject_id || '',
        class_section_id: filters.class_section_id || '',
        perPage: filters.perPage || 50,
    });

    const handleFilterChange = (key, value) => {
        const newParams = { ...filterParams, [key]: value };
        setFilterParams(newParams);
        
        router.get(route('admin.exam-enrollments.show', { exam: exam.id }), cleanParams(newParams), {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' }, 
            { title: 'Exam Results', href: route('admin.exam-results.index') },
            { title: exam.exam_name, href: '' }
        ]}>
            <Head title={`Results: ${exam.exam_name}`} />
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                    <div className="flex gap-2 items-center">
                        <Input 
                            placeholder="Search students..." 
                            className="w-64" 
                            value={filterParams.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                        <Select value={filterParams.subject_id} onValueChange={(v) => handleFilterChange('subject_id', v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Subjects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterParams.class_section_id} onValueChange={(v) => handleFilterChange('class_section_id', v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Sections" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sections</SelectItem>
                                {classSections.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.section_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.get(route('admin.exam-enrollments.create'))}>
                            Enroll Students
                        </Button>
                        <Button onClick={saveAll} disabled={!hasChanges || isSavingAll}>
                            {isSavingAll ? 'Saving...' : 'Save All Changes'}
                        </Button>
                    </div>
                </div>

                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead className="w-32">Score (0-100)</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localResults.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">No results found.</TableCell>
                                </TableRow>
                            ) : (
                                localResults.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <div className="font-medium">{row.student?.user?.name || `${row.student?.user?.first_name} ${row.student?.user?.last_name}`}</div>
                                            <div className="text-xs text-gray-500">{row.student?.admission_number}</div>
                                        </TableCell>
                                        <TableCell>{row.subject?.subject_name}</TableCell>
                                        <TableCell>{row.classSection?.section_name}</TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                min="0" 
                                                max="100" 
                                                value={row.score ?? ''} 
                                                onChange={(e) => handleScoreChange(row.id, e.target.value)}
                                                className={row.isDirty ? 'border-amber-500' : ''}
                                            />
                                        </TableCell>
                                        <TableCell>{row.grade}</TableCell>
                                        <TableCell>{row.remarks}</TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => saveRow(row)} 
                                                disabled={!row.isDirty || savingRows.includes(row.id)}
                                                className={row.isDirty ? 'text-amber-600 hover:text-amber-700' : 'text-gray-400'}
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {results.links && (
                    <div className="mt-4">
                        <Pagination links={results.links} filters={filterParams} />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
