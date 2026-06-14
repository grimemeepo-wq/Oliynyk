import { NextRequest, NextResponse } from 'next/server'
import { updateProduct, deleteProduct, validateSession } from '@/lib/db'
import { cookies } from 'next/headers'

async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  return token ? validateSession(token) : false
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const body = await req.json()
    await updateProduct(id, {
      ...body,
      price: body.price !== undefined ? Number(body.price) : undefined,
      oldPrice: body.oldPrice !== undefined ? (body.oldPrice ? Number(body.oldPrice) : null) : undefined,
      rating: body.rating !== undefined ? Number(body.rating) : undefined,
      hit: body.hit !== undefined ? Boolean(body.hit) : undefined,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    await deleteProduct(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
