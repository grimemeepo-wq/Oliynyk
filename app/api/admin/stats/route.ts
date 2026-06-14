import { NextResponse } from 'next/server'
import { getStats, validateSession } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  const ok = token ? await validateSession(token) : false
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getStats())
}
