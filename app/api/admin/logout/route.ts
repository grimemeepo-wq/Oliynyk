import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  if (token) await deleteSession(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('ADMIN_SESSION', '', { maxAge: 0, path: '/' })
  return res
}
