import { NextRequest, NextResponse } from 'next/server'
import { getAllConsultations, validateSession } from '@/lib/db'
import { cookies } from 'next/headers'
import path from 'path'
import fs from 'fs'

async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  return token ? validateSession(token) : false
}

function readJSON<T>(file: string, fallback: T): T {
  const p = path.join(process.cwd(), 'data', file)
  if (!fs.existsSync(p)) return fallback
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return fallback }
}
function writeJSON(file: string, data: unknown) {
  fs.writeFileSync(path.join(process.cwd(), 'data', file), JSON.stringify(data, null, 2))
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getAllConsultations())
}

export async function PATCH(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'id та status обов\'язкові' }, { status: 400 })
    const all = readJSON<Array<{id: string; status: string}>>('consultations.json', [])
    const c = all.find(x => x.id === id)
    if (c) c.status = status
    writeJSON('consultations.json', all)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
