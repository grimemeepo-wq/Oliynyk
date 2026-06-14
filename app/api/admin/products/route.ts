import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts, createProduct, reorderProducts, validateSession } from '@/lib/db'
import { cookies } from 'next/headers'

async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ADMIN_SESSION')?.value
  return token ? validateSession(token) : false
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getAllProducts())
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { name, cat, price, oldPrice, badge, emoji, rating, desc, photos, options, featured, hit } = body
    if (!name || !cat || !price) {
      return NextResponse.json({ error: 'Назва, категорія та ціна обов\'язкові' }, { status: 400 })
    }
    const id = await createProduct({
      id: '',
      name, cat, price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      badge: badge || '',
      emoji: emoji || '🪵',
      rating: Number(rating) || 5,
      desc: desc || '',
      photos: photos || [],
      options: options || [],
      featured: Boolean(featured),
      hit: Boolean(hit),
    })
    return NextResponse.json({ ok: true, id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}

// PATCH /api/admin/products — reorder: { ids: string[] }
export async function PATCH(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids required' }, { status: 400 })
    await reorderProducts(ids)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
