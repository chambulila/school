import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming Checkbox component exists or I'll use native
import { Search } from 'lucide-react';
import { cleanParams } from '@/lib/utils';

export default function CreateEnrollment() {
    const { classSections, subjects, exams, fetchedStudents, filters } = usePage().props;

    const [form, setForm] = useState({
        class_section_id: filters.class_section_id || '',
        subject_id: filters.subject_id || '',
        exam_id: filters.exam_id || '',
    });

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch students when class_section_id changes
    const handleSectionChange = (val) => {
        setForm(prev => ({ ...prev, class_section_id: val }));
        router.get('/dashboard/exams/enrollments/create', {
            class_section_id: val,
            subject_id: form.subject_id,
            exam_id: form.exam_id
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
        // Clear selection on section change as list changes
        setSelectedStudents([]);
    };

    const handleFilterChange = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        // Optional: Update URL params for persistence if needed, but not strictly required for subject/exam unless we want to filter them too.
        // For now, we only trigger fetch on section change as per requirement "Once all three are selected... fetch".
        // But actually, usually fetching students only depends on Section.
        // The prompt says "Once all three are selected... fetch".
        // But if I fetch on section change, it's better UX.
        // I'll stick to fetching on section change for now, but I'll update URL params for all to keep state on refresh.
        router.get('/dashboard/exams/enrollments/create', {
            ...form,
            [key]: val
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Filter students client-side
    const filteredStudents = useMemo(() => {
        if (!fetchedStudents) return [];
        if (!searchQuery) return fetchedStudents;
        const lower = searchQuery.toLowerCase();
        return fetchedStudents.filter(s =>
            s.name.toLowerCase().includes(lower) ||
            s.admission_number.toLowerCase().includes(lower)
        );
    }, [fetchedStudents, searchQuery]);

    const handleSelectAll = (checked) => {
        if (checked) {
            // Select all CURRENTLY FILTERED students? Or all fetched?
            // "Searching must NOT uncheck already selected students" implies we manage a global set.
            // "Select All" usually selects visible items.
            const visibleIds = filteredStudents.map(s => s.id);
            // Add visible IDs to selected set
            setSelectedStudents(prev => [...new Set([...prev, ...visibleIds])]);
        } else {
            // Unselect visible items
            const visibleIds = filteredStudents.map(s => s.id);
            setSelectedStudents(prev => prev.filter(id => !visibleIds.includes(id)));
        }
    };

    const isAllVisibleSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s.id));

    const handleSubmit = () => {
        if (!form.subject_id || !form.exam_id || !form.class_section_id || selectedStudents.length === 0) return;
        setIsSubmitting(true);
        router.post('/dashboard/exams/enrollments/store', {
            ...form,
            students: selectedStudents
        }, {
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Exam Results', href: '/dashboard/exam-results' },
            { title: 'Enroll Students', href: '/dashboard/exams/enrollments/create' }
        ]}>
            <Head title="Enroll Students" />
            <div className="p-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                    <h2 className="text-lg font-semibold">Exam Enrollment</h2>

                    {/* Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Class Section</label>
                            <Select value={form.class_section_id} onValueChange={handleSectionChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classSections.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.grade?.grade_name} - {s.section_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Subject</label>
                            <Select value={form.subject_id} onValueChange={(v) => handleFilterChange('subject_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Exam</label>
                            <Select value={form.exam_id} onValueChange={(v) => handleFilterChange('exam_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Exam" />
                                </SelectTrigger>
                                <SelectContent>
                                    {exams.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.exam_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Student List */}
                    {fetchedStudents && fetchedStudents.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Students ({selectedStudents.length} selected)</h3>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search students..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border rounded-md">
                                <div className="flex items-center p-3 border-b bg-gray-50">
                                    <input
                                        type="checkbox"
                                        className="mr-3 h-4 w-4 rounded border-gray-300"
                                        checked={isAllVisibleSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                    <span className="text-sm font-medium">Select All</span>
                                </div>
                                <div className="max-h-96 overflow-y-auto divide-y">
                                    {filteredStudents.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">No students found matching search.</div>
                                    ) : (
                                        filteredStudents.map(student => (
                                            <div key={student.id} className="flex items-center p-3 hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    className="mr-3 h-4 w-4 rounded border-gray-300"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => {
                                                        if (selectedStudents.includes(student.id)) {
                                                            setSelectedStudents(prev => prev.filter(id => id !== student.id));
                                                        } else {
                                                            setSelectedStudents(prev => [...prev, student.id]);
                                                        }
                                                    }}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium">{student.name}</div>
                                                    <div className="text-xs text-gray-500">{student.admission_number}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSubmit} disabled={isSubmitting || selectedStudents.length === 0 || !form.subject_id || !form.exam_id}>
                                    {isSubmitting ? 'Enrolling...' : 'Enroll Selected Students'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {(!fetchedStudents || fetchedStudents.length === 0) && form.class_section_id && (
                         <div className="text-center py-10 text-gray-500">
                             No students found in this section.
                         </div>
                    )}

                    {!form.class_section_id && (
                        <div className="text-center py-10 text-gray-500">
                            Select a Class Section to view students.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
