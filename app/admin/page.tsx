import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validateSession } from '@/lib/db'
import AdminClient from '@/components/admin/AdminClient'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  const ok = token ? await validateSession(token) : false
  if (!ok) redirect('/admin/login')

  return <AdminClient />
}
