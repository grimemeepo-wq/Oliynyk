'use client'

import { useEffect } from 'react'

export default function RevealInit() {
  useEffect(() => {
    // No ran-guard here — React Strict Mode double-invokes effects (mount→cleanup→mount).
    // The guard caused the observer to be created on the first run, destroyed on cleanup,
    // and then NEVER re-created on the second (real) mount. Result: zero reveals triggered.
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target) // once visible, no need to keep watching
        }
      }),
      { threshold: 0.08 }
    )

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
