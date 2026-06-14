import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/db'

export async function GET() {
  try {
    const products = await getAllProducts()
    return NextResponse.json(products)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
