'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', category: '', comment: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(v => ({ ...v, [k]: e.target.value }))

  const submit = async () => {
    if (!form.name || !form.phone) { alert("Заповніть ім'я та телефон!"); return }
    setLoading(true)
    try {
      await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setForm({ name: '', phone: '', email: '', category: '', comment: '' })
      alert("Заявку надіслано! Ми зв'яжемося з вами протягом 30 хвилин.")
    } catch {
      alert('Помилка. Спробуйте ще раз або зателефонуйте нам.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="order-form">
      <h3 className="form-title">Замовити консультацію щодо меблів</h3>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="fname">Ваше імʼя</label>
          <input id="fname" className="form-input" placeholder="Іван" value={form.name} onChange={set('name')} autoComplete="given-name" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="fphone">Телефон</label>
          <input id="fphone" className="form-input" type="tel" placeholder="+380..." value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="femail">Email</label>
          <input id="femail" className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="fcat">Категорія меблів</label>
          <select id="fcat" className="form-select" value={form.category} onChange={set('category')}>
            <option value="">Оберіть</option>
            <option value="Столи">Столи з масиву</option>
            <option value="Крісла">Крісла з різьбою</option>
            <option value="Меблі у вітальню">Меблі у вітальню</option>
            <option value="Спальні">Спальні гарнітури</option>
            <option value="Інше">Інше</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group full">
          <label className="form-label" htmlFor="fmsg">Коментар</label>
          <textarea id="fmsg" className="form-textarea" placeholder="Опишіть побажання до меблів..." value={form.comment} onChange={set('comment')} />
        </div>
      </div>
      <button className="form-submit" onClick={submit} disabled={loading}>
        {loading ? 'Надсилається...' : 'Надіслати заявку →'}
      </button>
    </div>
  )
}
