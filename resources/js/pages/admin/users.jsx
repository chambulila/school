import { Head, Link, useForm, router } from '@inertiajs/react'
import { useMemo } from 'react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const userSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).optional(),
  phone: z.string().max(50).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  guardian_name: z.string().max(255).optional(),
  guardian_phone: z.string().max(50).optional(),
  roles: z.array(z.string().uuid()).default([]),
})

export default function UsersPage({ users, roles }) {
  const roleOptions = useMemo(() => roles.map(r => ({ label: r.role_name, value: r.id })), [roles])

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    first_name: '', last_name: '', email: '', password: '', phone: '', gender: '', date_of_birth: '', address: '', guardian_name: '', guardian_phone: '', roles: [],
  })

  const submitCreate = (e) => {
    e.preventDefault()
    const parsed = userSchema.safeParse({ ...data, password: data.password || undefined })
    if (!parsed.success) return
    post('/dashboard/users', { onSuccess: () => reset('first_name','last_name','email','password','phone','gender','date_of_birth','address','guardian_name','guardian_phone','roles') })
  }

  const submitUpdate = (id) => {
    const parsed = userSchema.safeParse({ ...data })
    if (!parsed.success) return
    put(`/dashboard/users/${id}`)
  }

  return (
    <AuthenticatedLayout breadcrumbs={[{ title: 'Admin', href: '/dashboard' }, { title: 'Users', href: '/dashboard/users' }]}>
    <div className="p-6">
      <Head title="Users" />
      <h1 className="text-xl font-semibold mb-4">Users</h1>

      <form onSubmit={submitCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Input value={data.first_name} onChange={e => setData('first_name', e.target.value)} placeholder="First name" />
        <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)} placeholder="Last name" />
        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="Email" />
        <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Password" />
        <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="Phone" />
        <Input value={data.gender} onChange={e => setData('gender', e.target.value)} placeholder="Gender (Male/Female/Other)" />
        <Input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} placeholder="Date of birth" />
        <Input value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Address" />
        <Input value={data.guardian_name} onChange={e => setData('guardian_name', e.target.value)} placeholder="Guardian name" />
        <Input value={data.guardian_phone} onChange={e => setData('guardian_phone', e.target.value)} placeholder="Guardian phone" />
        <div className="col-span-1 md:col-span-2">
          <div className="mb-2 font-medium">Roles</div>
          <div className="flex flex-wrap gap-3">
            {roles.map(r => {
              const checked = data.roles.includes(r.id)
              return (
                <label key={r.id} className="flex items-center gap-2">
                  <Checkbox checked={checked} onCheckedChange={(v) => {
                    setData('roles', v ? [...data.roles, r.id] : data.roles.filter((id) => id !== r.id))
                  }} />
                  <span>{r.role_name}</span>
                </label>
              )
            })}
          </div>
        </div>
        <div>
          <Button disabled={processing} type="submit">Create User</Button>
        </div>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Roles</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.first_name} {u.last_name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.roles.map(r => r.role_name).join(', ')}</td>
              <td className="p-2 space-x-2">
                <Button variant="secondary" onClick={() => {
                  setData({
                    first_name: u.first_name,
                    last_name: u.last_name,
                    email: u.email,
                    password: '',
                    phone: u.phone ?? '',
                    gender: u.gender ?? '',
                    date_of_birth: u.date_of_birth ?? '',
                    address: u.address ?? '',
                    guardian_name: u.guardian_name ?? '',
                    guardian_phone: u.guardian_phone ?? '',
                    roles: u.roles.map(r => r.id),
                  })
                  submitUpdate(u.id)
                }}>Quick Save</Button>
                <Button variant="destructive" onClick={() => {
                  if (window.confirm('Delete user?')) {
                    router.delete(`/dashboard/users/${u.id}`)
                  }
                }}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.links && (
        <div className="mt-4">
            <Pagination links={users.links} filters={cleanParams(queryParams)} />
        </div>
      )}
    </div>
    </AuthenticatedLayout>
  )
}
import AuthenticatedLayout from '@/layouts/authenticated-layout'
