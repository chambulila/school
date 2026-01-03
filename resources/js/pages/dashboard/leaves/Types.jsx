import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LeaveTypesPage() {
    const { props } = usePage();
    const types = useMemo(() => props.types || [], [props.types]);
    const [name, setName] = useState('');
    const [applicantScope, setApplicantScope] = useState('both');
    const [enabled, setEnabled] = useState(true);
    const [requiresAttachment, setRequiresAttachment] = useState(false);
    const [requiresApproval, setRequiresApproval] = useState(true);
    const [maxDays, setMaxDays] = useState('');
    const [paid, setPaid] = useState('');

    const createType = () => {
        router.post('/dashboard/leaves/types', {
            name,
            applicant_scope: applicantScope,
            enabled,
            requires_attachment: requiresAttachment,
            requires_approval: requiresApproval,
            max_days_per_year: maxDays || null,
            paid: paid === '' ? null : paid === 'true',
        }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Leave Types', href: '/dashboard/leaves/types' }]}>
            <Head title="Leave Types" />
            <div className="p-6 space-y-6">
                <div className="border rounded p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Scope</label>
                            <Select value={applicantScope} onValueChange={setApplicantScope}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Enabled</label>
                            <Select value={String(enabled)} onValueChange={(v) => setEnabled(v === 'true')}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Enabled</SelectItem>
                                    <SelectItem value="false">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Requires Attachment</label>
                            <Select value={String(requiresAttachment)} onValueChange={(v) => setRequiresAttachment(v === 'true')}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Requires Approval</label>
                            <Select value={String(requiresApproval)} onValueChange={(v) => setRequiresApproval(v === 'true')}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Max Days/Year</label>
                            <Input value={maxDays} onChange={(e) => setMaxDays(e.target.value)} placeholder="Optional" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Paid (Teacher)</label>
                            <Select value={paid} onValueChange={setPaid}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="N/A" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem >N/A</SelectItem>
                                    <SelectItem value="true">Paid</SelectItem>
                                    <SelectItem value="false">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button onClick={createType} disabled={!name}>Create</Button>
                    </div>
                </div>
                <div className="border rounded p-4 bg-white">
                    <div className="font-medium mb-2">Existing Types</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {types.map((t) => (
                            <div key={t.id} className="border rounded p-3">
                                <div className="font-medium">{t.name}</div>
                                <div className="text-sm text-gray-600">Scope: {t.applicant_scope}</div>
                                <div className="text-sm text-gray-600">Enabled: {t.enabled ? 'Yes' : 'No'}</div>
                                <div className="text-sm text-gray-600">Requires Approval: {t.requires_approval ? 'Yes' : 'No'}</div>
                                <div className="text-sm text-gray-600">Requires Attachment: {t.requires_attachment ? 'Yes' : 'No'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

