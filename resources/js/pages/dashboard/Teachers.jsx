import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash } from 'lucide-react';
import { askConfirmation } from '@/utils/sweetAlerts';
import { cleanParams } from '@/lib/utils';
import DeleteButton from '@/components/buttons/DeleteButton';
import EditButton from '@/components/buttons/EditButon';

export default function TeachersPage() {
    const { props } = usePage();
    const teachers = useMemo(() => props.teachers ?? [], [props.teachers]);
    const users = useMemo(() => props.users ?? [], [props.users]);
    const errors = props.errors || {};
    const initialFilters = props.filters || {};
    const [search, setSearch] = useState(initialFilters.search || '');
    const isFirstSearchEffect = useRef(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newGender, setNewGender] = useState('');
    const [newDob, setNewDob] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newGuardianName, setNewGuardianName] = useState('');
    const [newGuardianPhone, setNewGuardianPhone] = useState('');
    const [newEmp, setNewEmp] = useState('');
    const [newQual, setNewQual] = useState('');
    const [newHire, setNewHire] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editDob, setEditDob] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editGuardianName, setEditGuardianName] = useState('');
    const [editGuardianPhone, setEditGuardianPhone] = useState('');
    const [editUserId, setEditUserId] = useState('');
    const [editEmp, setEditEmp] = useState('');
    const [editQual, setEditQual] = useState('');
    const [editHire, setEditHire] = useState('');
    const [isEditSaving, setIsEditSaving] = useState(false);

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timeout = setTimeout(() => {
            const params = cleanParams({ search });
            router.get('/dashboard/teachers', params, { replace: true, preserveState: true, preserveScroll: true });
        }, 2000);
        return () => clearTimeout(timeout);
    }, [search]);

    const startEdit = (row) => {
        setEditingId(row.id);
        const u = row.user || {};
        setEditUserId(row.user_id || u.id || '');
        setEditFirstName(u.first_name || '');
        setEditLastName(u.last_name || '');
        setEditEmail(u.email || '');
        setEditPassword('');
        setEditPhone(u.phone || '');
        setEditGender(u.gender || '');
        setEditDob(u.date_of_birth || '');
        setEditAddress(u.address || '');
        setEditGuardianName(u.guardian_name || '');
        setEditGuardianPhone(u.guardian_phone || '');
        setEditEmp(row.employee_number || '');
        setEditQual(row.qualification || '');
        setEditHire(row.hire_date || '');
        setIsEditOpen(true);
    };

    const cancelEdit = () => {
        setIsEditOpen(false);
        setEditingId(null);
        setEditUserId('');
        setEditFirstName(''); setEditLastName(''); setEditEmail(''); setEditPassword('');
        setEditPhone(''); setEditGender(''); setEditDob(''); setEditAddress('');
        setEditGuardianName(''); setEditGuardianPhone('');
        setEditEmp('');
        setEditQual('');
        setEditHire('');
    };

    const createTeacher = async () => {
        if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim() || !newPassword || !newEmp.trim() || isSaving) return;
        setIsSaving(true);
        router.post('/dashboard/teachers', {
            first_name: newFirstName,
            last_name: newLastName,
            email: newEmail,
            password: newPassword,
            phone: newPhone || null,
            gender: newGender || null,
            date_of_birth: newDob || null,
            address: newAddress || null,
            guardian_name: newGuardianName || null,
            guardian_phone: newGuardianPhone || null,
            employee_number: newEmp,
            qualification: newQual || null,
            hire_date: newHire || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNewFirstName(''); setNewLastName(''); setNewEmail(''); setNewPassword('');
                setNewPhone(''); setNewGender(''); setNewDob(''); setNewAddress('');
                setNewGuardianName(''); setNewGuardianPhone('');
                setNewEmp(''); setNewQual(''); setNewHire('');
                setIsAddOpen(false);
                setIsSaving(false);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setIsEditSaving(true);
        router.put(`/dashboard/teachers/${editingId}`, {
            user_id: editUserId,
            first_name: editFirstName || undefined,
            last_name: editLastName || undefined,
            email: editEmail || undefined,
            password: editPassword || undefined,
            phone: editPhone || null,
            gender: editGender || null,
            date_of_birth: editDob || null,
            address: editAddress || null,
            guardian_name: editGuardianName || null,
            guardian_phone: editGuardianPhone || null,
            employee_number: editEmp,
            qualification: editQual || null,
            hire_date: editHire || null,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
            onFinish: () => setIsEditSaving(false),
        });
    };

    const deleteTeacher = async (row) => {
        const isConfirmed = await askConfirmation('Are you sure you want to delete this teacher?');
        if (!isConfirmed) return;
        router.delete(`/dashboard/teachers/${row.id}`, { preserveState: true, preserveScroll: true });
    };

    const userLabel = (u) => u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Unknown';

    return (
        <AuthenticatedLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Teachers', href: '/dashboard/teachers' }]}>
            <Head title="Teachers" />
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <Input
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or employee #"
                        />
                        <Button onClick={() => setIsAddOpen(true)}>Add Teacher</Button>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent className="w-full max-w-[95vw] md:max-w-3xl lg:max-w-6xl">
                            <DialogHeader>
                                <DialogTitle>Add Teacher</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">First Name</label>
                                        <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="First name" />
                                        {errors.first_name && <div className="text-red-500 text-sm mt-1">{errors.first_name}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name</label>
                                        <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="Last name" />
                                        {errors.last_name && <div className="text-red-500 text-sm mt-1">{errors.last_name}</div>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email</label>
                                        <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email address" />
                                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Password</label>
                                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" />
                                        {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                                        <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone" />
                                        {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Gender (optional)</label>
                                        <Select value={newGender} onValueChange={setNewGender}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <div className="text-red-500 text-sm mt-1">{errors.gender}</div>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date of Birth (optional)</label>
                                        <Input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)} />
                                        {errors.date_of_birth && <div className="text-red-500 text-sm mt-1">{errors.date_of_birth}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Address (optional)</label>
                                        <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Address" />
                                        {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Guardian Name (optional)</label>
                                        <Input value={newGuardianName} onChange={(e) => setNewGuardianName(e.target.value)} placeholder="Guardian name" />
                                        {errors.guardian_name && <div className="text-red-500 text-sm mt-1">{errors.guardian_name}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Guardian Phone (optional)</label>
                                        <Input value={newGuardianPhone} onChange={(e) => setNewGuardianPhone(e.target.value)} placeholder="Guardian phone" />
                                        {errors.guardian_phone && <div className="text-red-500 text-sm mt-1">{errors.guardian_phone}</div>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Employee Number</label>
                                    <Input value={newEmp} onChange={(e) => setNewEmp(e.target.value)} placeholder="e.g. EMP-0001" />
                                    {errors.employee_number && <div className="text-red-500 text-sm mt-1">{errors.employee_number}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Qualification (optional)</label>
                                    <Input value={newQual} onChange={(e) => setNewQual(e.target.value)} placeholder="e.g. B.Ed, M.Sc" />
                                    {errors.qualification && <div className="text-red-500 text-sm mt-1">{errors.qualification}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hire Date (optional)</label>
                                    <Input type="date" value={newHire} onChange={(e) => setNewHire(e.target.value)} />
                                    {errors.hire_date && <div className="text-red-500 text-sm mt-1">{errors.hire_date}</div>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddOpen(false);
                                        setNewFirstName(''); setNewLastName(''); setNewEmail(''); setNewPassword('');
                                        setNewPhone(''); setNewGender(''); setNewDob(''); setNewAddress('');
                                        setNewGuardianName(''); setNewGuardianPhone('');
                                        setNewEmp(''); setNewQual(''); setNewHire('');
                                    }}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={createTeacher} disabled={isSaving || !newFirstName.trim() || !newLastName.trim() || !newEmail.trim() || !newPassword || !newEmp.trim()}>
                                    {isSaving ? 'Saving' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Employee #</TableHead>
                            <TableHead>Qualification</TableHead>
                            <TableHead>Hire Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(teachers.data ?? teachers).map((t) => (
                            <TableRow key={t.id}>
                                <TableCell>
                                    {t.user ? userLabel(t.user) : '—'}
                                </TableCell>
                                <TableCell>
                                    {t.employee_number}
                                </TableCell>
                                <TableCell>
                                    {t.qualification || '—'}
                                </TableCell>
                                <TableCell>
                                    {t.hire_date || '—'}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    <div className="flex items-center gap-2">
                                        <EditButton onClick={() => startEdit(t)} />
                                        <DeleteButton onClick={() => deleteTeacher(t)} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {teachers.links && (
                    <div className="mt-4">
                        <Pagination links={teachers.links} filters={cleanParams({ search })} />
                    </div>
                )}
                <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) cancelEdit(); else setIsEditOpen(true); }}>
                    <DialogContent className="w-full max-w-[95vw] md:max-w-3xl lg:max-w-6xl">
                        <DialogHeader>
                            <DialogTitle>Edit Teacher</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <Input disabled={isEditSaving} value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="First name" />
                                    {errors.first_name && <div className="text-red-500 text-sm mt-1">{errors.first_name}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <Input disabled={isEditSaving} value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Last name" />
                                    {errors.last_name && <div className="text-red-500 text-sm mt-1">{errors.last_name}</div>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input disabled={isEditSaving} type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email address" />
                                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password (optional)</label>
                                    <Input disabled={isEditSaving} type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="New password (leave blank to keep)" />
                                    {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                                    <Input disabled={isEditSaving} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" />
                                    {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gender (optional)</label>
                                    <Select value={editGender} onValueChange={setEditGender}>
                                        <SelectTrigger className="w-full" disabled={isEditSaving}>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && <div className="text-red-500 text-sm mt-1">{errors.gender}</div>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Birth (optional)</label>
                                    <Input disabled={isEditSaving} type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
                                    {errors.date_of_birth && <div className="text-red-500 text-sm mt-1">{errors.date_of_birth}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Address (optional)</label>
                                    <Input disabled={isEditSaving} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Address" />
                                    {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Guardian Name (optional)</label>
                                    <Input disabled={isEditSaving} value={editGuardianName} onChange={(e) => setEditGuardianName(e.target.value)} placeholder="Guardian name" />
                                    {errors.guardian_name && <div className="text-red-500 text-sm mt-1">{errors.guardian_name}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Guardian Phone (optional)</label>
                                    <Input disabled={isEditSaving} value={editGuardianPhone} onChange={(e) => setEditGuardianPhone(e.target.value)} placeholder="Guardian phone" />
                                    {errors.guardian_phone && <div className="text-red-500 text-sm mt-1">{errors.guardian_phone}</div>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Employee Number</label>
                                <Input disabled={isEditSaving} value={editEmp} onChange={(e) => setEditEmp(e.target.value)} placeholder="e.g. EMP-0001" />
                                {errors.employee_number && <div className="text-red-500 text-sm mt-1">{errors.employee_number}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Qualification (optional)</label>
                                <Input disabled={isEditSaving} value={editQual} onChange={(e) => setEditQual(e.target.value)} placeholder="e.g. B.Ed, M.Sc" />
                                {errors.qualification && <div className="text-red-500 text-sm mt-1">{errors.qualification}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hire Date (optional)</label>
                                <Input disabled={isEditSaving} type="date" value={editHire} onChange={(e) => setEditHire(e.target.value)} />
                                {errors.hire_date && <div className="text-red-500 text-sm mt-1">{errors.hire_date}</div>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={cancelEdit} disabled={isEditSaving}>
                                Cancel
                            </Button>
                            <Button onClick={saveEdit} disabled={isEditSaving || !editEmp.trim() || !editFirstName.trim() || !editLastName.trim() || !editEmail.trim()}>
                                {isEditSaving ? 'Saving' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
