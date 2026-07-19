import { useCallback, useEffect, useRef, useState } from 'react'
import type { Movie, WatchStatus } from '../types/movie'
import MovieCard from './MovieCard'
import styles from './TrendingSection.module.css'

export default function TrendingSection({
  movies,
  status,
  onToggle,
  onMovieClick
}: {
  movies: Movie[]
  status: Record<number, WatchStatus>
  onToggle: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  onMovieClick: (id: number) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const checkEdges = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkEdges()

    const handleWheel = (e: WheelEvent) => {
      const atLeft = el.scrollLeft <= 0
      const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
      if ((e.deltaY > 0 && atRight) || (e.deltaY < 0 && atLeft)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('scroll', checkEdges)
    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('scroll', checkEdges)
    }
  }, [checkEdges])

  const maskClass = [atStart ? styles.scrollStart : '', atEnd ? styles.scrollEnd : ''].filter(Boolean).join(' ')

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>TRENDING</p>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>近期热门</h2>
            <span className={styles.titleDesc}>推荐里没有想看的？那来看看近期热门吧！</span>
          </div>
        </div>
        <div className={styles.badge}>
          <span>热门</span>
          <span className={styles.badgeDot}>·</span>
          <span>本周</span>
        </div>
      </div>
      <div ref={scrollRef} className={`${styles.scroll} ${maskClass} hide-scrollbar`}>
        {movies.map(m => (
          <div key={m.id} className={styles.cardWrap}>
            <MovieCard movie={m} status={status[m.id] ?? 'none'} onToggle={onToggle} onClick={() => onMovieClick(m.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
