import { NextRequest, NextResponse } from 'next/server'
import { createConsultation } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, category, comment } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "Ім'я та телефон обов'язкові" }, { status: 400 })
    }

    const id = await createConsultation({ name, phone, email, category, comment })

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (token && chatId) {
      const msg = `📞 <b>ЗАЯВКА ${id}</b>\n\n👤 <b>${name}</b>\n📞 ${phone}${email ? '\n✉️ ' + email : ''}${category ? '\n📦 ' + category : ''}${comment ? '\n\n💬 ' + comment : ''}`
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
      }).catch(console.error)
    }

    return NextResponse.json({ ok: true, id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
