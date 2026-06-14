import { NextRequest, NextResponse } from 'next/server'
import { updateProduct, deleteProduct, getAllProducts, validateSession } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { cookies } from 'next/headers'

async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  return token ? validateSession(token) : false
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const products = await getAllProducts()
  const product = products.find(p => p.id === id || slugify(p.name) === id)
  if (!product) return NextResponse.json({ error: 'Не знайдено' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const body = await req.json()
    await updateProduct(id, body)
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
