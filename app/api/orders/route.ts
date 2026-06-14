import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/db'

// Telegram notification (optional)
async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch (e) {
    console.error('Telegram error:', e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, total, source } = body

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json({ error: "Ім'я та телефон обов'язкові" }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Кошик порожній' }, { status: 400 })
    }

    const id = await createOrder({ customer, items, total: total || 0, status: 'new', source: source || 'site' })

    // Telegram notification
    const msg = `🛒 <b>ЗАМОВЛЕННЯ ${id}</b>\n\n👤 <b>${customer.name}</b>\n📞 ${customer.phone}${customer.email ? '\n✉️ ' + customer.email : ''}${customer.address ? '\n📍 ' + customer.address : ''}\n\n${items.map((i: {name:string;price:number;qty:number}) => `  • ${i.name} ×${i.qty} — ₴${(i.price * i.qty).toLocaleString('uk-UA')}`).join('\n')}\n\n💰 <b>₴${(total || 0).toLocaleString('uk-UA')}</b>${customer.comment ? '\n\n💬 ' + customer.comment : ''}`
    notifyTelegram(msg)

    return NextResponse.json({ ok: true, id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
