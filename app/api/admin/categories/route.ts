import { NextRequest, NextResponse } from 'next/server'
import { getAllCategories, saveCategories, validateSession } from '@/lib/db'
import { cookies } from 'next/headers'
import type { CategoryDef } from '@/lib/types'

async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  return token ? validateSession(token) : false
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getAllCategories())
}

export async function PUT(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const cats: CategoryDef[] = await req.json()
    if (!Array.isArray(cats)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    await saveCategories(cats)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
