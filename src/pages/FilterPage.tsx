import { useEffect, useState } from 'react'
import type { Movie, WatchStatus } from '../types/movie'
import { fetchDiscover, tmdbToMovieMinimal } from '../api/tmdb'
import MovieCard from '../components/MovieCard'
import styles from './FilterPage.module.css'

const CATEGORIES = [
  { key: 'hardcore', label: '硬核视听', emoji: '🎬', genreIds: '28|12|878|14', maxPage: 50 },
  { key: 'suspense', label: '悬疑烧脑', emoji: '🔍', genreIds: '53|9648|80|27', maxPage: 50 },
  { key: 'romance', label: '浪漫爱情', emoji: '💕', genreIds: '10749', maxPage: 30 },
  { key: 'drama', label: '剧情故事', emoji: '🎭', genreIds: '18|36|10752', maxPage: 50 },
  { key: 'comedy', label: '轻松一刻', emoji: '😄', genreIds: '35', maxPage: 30 },
  { key: 'anime', label: '动画动漫', emoji: '🎨', genreIds: '16', maxPage: 20 },
]

const MAX_ATTEMPTS = 10
const TARGET_COUNT = 5

async function fetchMovies(cacheKey: string, genreIds: string, maxPage: number): Promise<Movie[]> {
  const d = new Date()
  const todayStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const CACHE_KEY = `filter_${todayStr}_${cacheKey}`

  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    try {
      const data = JSON.parse(cached)
      if (Array.isArray(data) && data.length >= 5) return data
    } catch { /* corrupt — refetch */ }
  }

  const seed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) >>> 0
  let s = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0

  const picks: Movie[] = []
  const seen = new Set<number>()

  for (let attempt = 0; attempt < MAX_ATTEMPTS && picks.length < TARGET_COUNT; attempt++) {
    const page = (s % maxPage) + 1
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0

    try {
      const results = await fetchDiscover({ genreIds, sortBy: 'popularity.desc', voteCountGte: 1000, page })
      if (results.length === 0) continue

      const idx = s % results.length
      s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0

      const m = results[idx]
      if (m.popularity < 2.5) continue
      if (seen.has(m.id)) continue

      seen.add(m.id)
      picks.push(tmdbToMovieMinimal(m))
    } catch { /* skip failed pages */ }
  }

  const result = picks.slice(0, TARGET_COUNT)
  localStorage.setItem(CACHE_KEY, JSON.stringify(result))
  return result
}

export default function FilterPage({
  status,
  onToggleStatus,
  onMovieClick,
  filterMovies,
  setFilterMovies,
}: {
  status: Record<number, WatchStatus>
  onToggleStatus: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  onMovieClick: (id: number) => void
  filterMovies: Movie[]
  setFilterMovies: React.Dispatch<React.SetStateAction<Movie[]>>
}) {
  const [activeKey, setActiveKey] = useState<string>(CATEGORIES[0].key)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeCategory = CATEGORIES.find(c => c.key === activeKey)!

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchMovies(CATEGORIES[0].key, CATEGORIES[0].genreIds, CATEGORIES[0].maxPage)
      .then(m => { setFilterMovies(m); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const handleSelect = (key: string) => {
    const cat = CATEGORIES.find(c => c.key === key)!
    setActiveKey(key)
    setLoading(true)
    setError(null)
    setFilterMovies([])
    fetchMovies(cat.key, cat.genreIds, cat.maxPage)
      .then(m => { setFilterMovies(m); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <p className={styles.sectionLabel}>FILTER</p>
        <h1 className={styles.sectionTitle}>筛选推荐</h1>
      </div>

      <div className={styles.categoryGrid}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => handleSelect(c.key)}
            className={`${styles.categoryBtn} ${activeKey === c.key ? styles.categoryBtnActive : ''}`}
          >
            <span className={styles.categoryEmoji}>{c.emoji}</span>
            <span className={styles.categoryName}>{c.label}</span>
          </button>
        ))}
      </div>

      {activeCategory && (
        <div className={styles.resultSection}>
          <div className={styles.resultHead}>
            <p className={styles.resultLabel}>RESULTS</p>
            <h2 className={styles.resultTitle}>
              {activeCategory.label} · 共 {filterMovies.length} 部
            </h2>
          </div>

          {loading ? (
            <div className={styles.loading}>加载中...</div>
          ) : error ? (
            <div className={styles.error}>加载失败: {error}</div>
          ) : filterMovies.length === 0 ? (
            <div className={styles.empty}>暂无符合条件的电影</div>
          ) : (
            <div className={styles.grid}>
              {filterMovies.map(m => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  status={status[m.id] ?? 'none'}
                  onToggle={onToggleStatus}
                  onClick={() => onMovieClick(m.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
