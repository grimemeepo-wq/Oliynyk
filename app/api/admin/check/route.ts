import { NextResponse } from 'next/server'
import { validateSession } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  const ok = token ? await validateSession(token) : false
  return NextResponse.json({ ok })
}
