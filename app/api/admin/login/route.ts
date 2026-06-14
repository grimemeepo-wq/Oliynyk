import { NextRequest, NextResponse } from 'next/server'
import { saveSession, makeToken } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234'

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Невірний пароль' }, { status: 401 })
    }

    const token = await makeToken()
    await saveSession(token)

    const res = NextResponse.json({ ok: true })
    res.cookies.set('ADMIN_SESSION', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return res
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
