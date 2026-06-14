'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const testimonials = [
  { text: 'Якість різьблення на ЧПК неймовірна — чіткі лінії, ідеальна симетрія. Стіл став справжньою прикрасою нашої вітальні!', name: 'Олена Коваленко', role: 'Київ', initials: 'ОК', stars: 5 },
  { text: 'Замовив спальний гарнітур з масиву вільхи — дерево чудово відчувається, класичний стиль, швидко виготовили. Дуже задоволений!', name: 'Андрій Петренко', role: 'Львів', initials: 'АП', stars: 5 },
  { text: 'Взяли гарнітур зі шпонованого МДФ — виглядає як масив, а ціна значно доступніша. Різьба ідеальна, рекомендую!', name: 'Марія Шевченко', role: 'Одеса', initials: 'МШ', stars: 5 },
  { text: 'Диван «Львів» — просто мрія! Різьблена рама з вільхи, якісна тканина. Вже рік як стоїть у вітальні і виглядає чудово.', name: 'Іван Бондаренко', role: 'Харків', initials: 'ІБ', stars: 5 },
  { text: 'Замовили кухонний стіл «Карпати» — масив вільхи, чітка різьба. Дуже задоволені якістю та термінами виготовлення.', name: 'Наталія Мороз', role: 'Дніпро', initials: 'НМ', stars: 5 },
  { text: 'Спальня «Верховина» перевершила всі очікування. Різьблене узголів\'я просто шедевр. Майстри справжні професіонали!', name: 'Тарас Литвин', role: 'Тернопіль', initials: 'ТЛ', stars: 5 },
]

function colsCount() {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth <= 768) return 1
  if (window.innerWidth <= 1024) return 2
  return 3
}

export default function ReviewsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [realIdx, setRealIdx] = useState(0)
  const [total, setTotal] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const buildDOM = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const cols = colsCount()
    const slideCount = Math.ceil(testimonials.length / cols)
    setTotal(slideCount)
    setRealIdx(0)

    const makeSlide = (items: typeof testimonials) => `
      <div class="carousel-slide">
        ${items.map(t => `
          <div class="testimonial-card">
            <div class="testimonial-text">${t.text}</div>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${t.initials}</div>
              <div>
                <div class="testimonial-name">${t.name}</div>
                <div class="testimonial-role">${t.role}</div>
                <div class="testimonial-stars">
                  ${Array.from({ length: 5 }, (_, i) => `<span class="star${i < t.stars ? '' : ' empty'}">★</span>`).join('')}
                </div>
              </div>
            </div>
          </div>`).join('')}
      </div>`

    const slides = Array.from({ length: slideCount }, (_, s) =>
      makeSlide(testimonials.slice(s * cols, (s + 1) * cols))
    )
    const lastSlide = makeSlide(testimonials.slice((slideCount - 1) * cols, slideCount * cols))
    const firstSlide = makeSlide(testimonials.slice(0, cols))

    track.innerHTML = `<div class="carousel-slide clone">${lastSlide.match(/<div class="carousel-slide">([\s\S]*)<\/div>/)?.[1] ?? ''}</div>` + slides.join('') + `<div class="carousel-slide clone">${firstSlide.match(/<div class="carousel-slide">([\s\S]*)<\/div>/)?.[1] ?? ''}</div>`
    track.style.transition = 'none'
    track.style.transform = 'translateX(-100%)'
  }, [])

  useEffect(() => {
    buildDOM()
    window.addEventListener('resize', buildDOM)
    return () => window.removeEventListener('resize', buildDOM)
  }, [buildDOM])

  const advance = useCallback(() => {
    if (isAnimating) return
    const track = trackRef.current
    if (!track) return

    setIsAnimating(true)
    const nextPos = realIdx + 2
    track.style.transition = 'transform 700ms cubic-bezier(0.4,0,0.2,1)'
    track.style.transform = `translateX(-${nextPos * 100}%)`

    const onEnd = () => {
      track.removeEventListener('transitionend', onEnd)
      setRealIdx(prev => {
        const next = (prev + 1) % total
        if (next === 0) {
          track.style.transition = 'none'
          track.style.transform = 'translateX(-100%)'
        }
        return next
      })
      setIsAnimating(false)
    }
    track.addEventListener('transitionend', onEnd)
  }, [isAnimating, realIdx, total])

  const retreat = useCallback(() => {
    if (isAnimating) return
    const track = trackRef.current
    if (!track) return

    setIsAnimating(true)
    track.style.transition = 'transform 700ms cubic-bezier(0.4,0,0.2,1)'
    track.style.transform = `translateX(-${realIdx * 100}%)`

    const onEnd = () => {
      track.removeEventListener('transitionend', onEnd)
      setRealIdx(prev => {
        if (prev === 0) {
          track.style.transition = 'none'
          track.style.transform = `translateX(-${total * 100}%)`
          return total - 1
        }
        return prev - 1
      })
      setIsAnimating(false)
    }
    track.addEventListener('transitionend', onEnd)
  }, [isAnimating, realIdx, total])

  const goTo = useCallback((idx: number) => {
    if (isAnimating) return
    const track = trackRef.current
    if (!track) return
    setIsAnimating(true)
    track.style.transition = 'transform 700ms cubic-bezier(0.4,0,0.2,1)'
    track.style.transform = `translateX(-${(idx + 1) * 100}%)`
    const onEnd = () => {
      track.removeEventListener('transitionend', onEnd)
      setRealIdx(idx)
      setIsAnimating(false)
    }
    track.addEventListener('transitionend', onEnd)
  }, [isAnimating])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(advance, 4500)
  }, [advance])

  useEffect(() => {
    timerRef.current = setInterval(advance, 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [advance])

  return (
    <section className="section carousel-section" id="reviews" aria-labelledby="reviews-title">
      <div className="reveal carousel-header">
        <div>
          <div className="section-tag">Відгуки клієнтів</div>
          <h2 className="section-title" id="reviews-title" style={{ marginBottom: 0 }}>
            Що кажуть про наші меблі
          </h2>
        </div>
        <div className="carousel-controls">
          <button
            className="carousel-btn"
            onClick={() => { retreat(); resetTimer() }}
            aria-label="Попередній відгук"
          >←</button>
          <div className="carousel-dots">
            {Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                className={`carousel-dot${i === realIdx ? ' active' : ''}`}
                onClick={() => { goTo(i); resetTimer() }}
              />
            ))}
          </div>
          <button
            className="carousel-btn"
            onClick={() => { advance(); resetTimer() }}
            aria-label="Наступний відгук"
          >→</button>
        </div>
      </div>
      <div className="carousel-track-wrap reveal">
        <div className="carousel-track" ref={trackRef} />
      </div>
    </section>
  )
}
