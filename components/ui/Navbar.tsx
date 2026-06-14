'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import LogoV1 from '@/components/logos/LogoV1'

interface NavbarProps {
  cartCount: number
  onCartOpen: () => void
}

export default function Navbar({ cartCount, onCartOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navTo = (id: string) => {
    setMobileOpen(false)
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      router.push(`/#${id}`)
    }
  }

  const NAV_LINKS = [
    ['home', 'Головна'],
    ['catalog', 'Каталог'],
    ['about', 'Про нас'],
    ['reviews', 'Відгуки'],
    ['contact', 'Контакти'],
  ]

  return (
    <>
      <header className="site-header">
        <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>
          <a href="/" className="nav-logo">
            <LogoV1 height={44} />
          </a>
          <ul className="nav-links" role="list">
            {NAV_LINKS.map(([id, label]) => (
              <li key={id}>
                <a href={pathname === '/' ? `#${id}` : `/#${id}`} onClick={e => { e.preventDefault(); navTo(id) }}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-right">
            <button className="nav-cart" onClick={onCartOpen} aria-label="Кошик">
              🛒 Кошик
              <span className={`cart-badge${cartCount > 0 ? ' show' : ''}`}>
                {cartCount}
              </span>
            </button>
            <button
              className="burger"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Меню"
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>
      </header>

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(([id, label]) => (
          <a key={id} href={pathname === '/' ? `#${id}` : `/#${id}`} onClick={e => { e.preventDefault(); navTo(id) }}>
            {label}
          </a>
        ))}
      </div>
    </>
  )
}
