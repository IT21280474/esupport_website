import { useEffect } from 'react'

const SELECTOR = '.reveal:not(.is-visible), .reveal-img:not(.is-visible), .timeline:not(.is-visible), [data-count]:not([data-counted])'
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function animateCount(element) {
  element.setAttribute('data-counted', '')
  const target = Number.parseInt(element.dataset.count, 10)
  if (Number.isNaN(target)) return
  if (reduceMotion()) {
    element.textContent = target
    return
  }
  const duration = 1600
  const start = performance.now()
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    element.textContent = Math.round(target * (1 - (1 - progress) ** 3))
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/**
 * Adds `is-visible` to .reveal / .reveal-img / .timeline elements as they
 * scroll into view and runs [data-count] counters — the prototype's scroll
 * animations. Watches the DOM so sections rendered after data loads are
 * picked up automatically.
 */
export default function RevealObserver({ root = 'main' }) {
  useEffect(() => {
    const container = document.querySelector(root) || document.body

    if (!('IntersectionObserver' in window)) {
      container.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          if (entry.target.dataset.count !== undefined) animateCount(entry.target)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    const observeAll = () => container.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el))
    observeAll()

    let frame = 0
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(observeAll)
    })
    mutations.observe(container, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      observer.disconnect()
    }
  }, [root])

  return null
}
