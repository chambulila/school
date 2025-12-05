import { Head, useForm } from '@inertiajs/react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const roleSchema = z.object({
  role_name: z.string().min(1).max(100),
  description: z.string().optional(),
})

export default function RolesPage({ roles }) {
  const { data, setData, post, processing } = useForm({ role_name: '', description: '' })

  const submitCreate = (e) => {
    e.preventDefault()
    const parsed = roleSchema.safeParse(data)
    if (!parsed.success) return
    post('/admin/roles', { onSuccess: () => setData({ role_name: '', description: '' }) })
  }

  return (
    <AuthenticatedLayout breadcrumbs={[{ title: 'Admin', href: '/admin' }, { title: 'Roles', href: '/admin/roles' }]}>
    <div className="p-6">
      <Head title="Roles" />
      <h1 className="text-xl font-semibold mb-4">Roles</h1>
      <form onSubmit={submitCreate} className="flex gap-3 mb-6">
        <Input value={data.role_name} onChange={e => setData('role_name', e.target.value)} placeholder="Role name" />
        <Input value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Description" />
        <Button disabled={processing} type="submit">Create</Button>
      </form>

      <ul className="space-y-2">
        {roles.map(r => (
          <li key={r.id} className="border p-3 rounded">
            <div className="font-medium">{r.role_name}</div>
            <div className="text-sm text-muted-foreground">{r.description}</div>
          </li>
        ))}
      </ul>
    </div>
    </AuthenticatedLayout>
  )
}
import AuthenticatedLayout from '@/layouts/authenticated-layout'
