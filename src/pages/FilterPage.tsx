import { useEffect, useState } from 'react'
import type { Movie, WatchStatus } from '../types/movie'
import { fetchDiscover, tmdbToMovieMinimal } from '../api/tmdb'
import MovieCard from '../components/MovieCard'
import styles from './FilterPage.module.css'

const CATEGORIES = [
  { key: 'hardcore', label: '硬核视听', emoji: '🎬', genreIds: '28,12,878,14' },
  { key: 'suspense', label: '悬疑烧脑', emoji: '🔍', genreIds: '53,9648,80,27' },
  { key: 'romance', label: '浪漫爱情', emoji: '💕', genreIds: '10749' },
  { key: 'drama', label: '剧情故事', emoji: '🎭', genreIds: '18,36,10752' },
  { key: 'comedy', label: '轻松一刻', emoji: '😄', genreIds: '35' },
  { key: 'anime', label: '动画动漫', emoji: '🎨', genreIds: '16' },
]

/** 基于日期的 PRNG，每次刷新/切换返回不同页码 */
function dailyPages(): [number, number] {
  const d = new Date()
  const seed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) >>> 0
  let s = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0
  const p1 = (s % 10) + 1
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0
  let p2 = (s % 10) + 1
  if (p2 === p1) p2 = p1 < 10 ? p1 + 1 : 1
  return [p1, p2]
}

async function fetchMovies(genreIds: string): Promise<Movie[]> {
  const [page1, page2] = dailyPages()
  const [r1, r2] = await Promise.all([
    fetchDiscover({ genreIds, sortBy: 'vote_average.desc', voteCountGte: 2000, page: page1 }),
    fetchDiscover({ genreIds, sortBy: 'vote_average.desc', voteCountGte: 2000, page: page2 }),
  ])
  const seen = new Set<number>()
  const all: Movie[] = []
  for (const m of [...r1, ...r2]) {
    if (!seen.has(m.id)) {
      seen.add(m.id)
      all.push(tmdbToMovieMinimal(m))
    }
  }
  return all.slice(0, 5)
}

export default function FilterPage({
  status,
  onToggleStatus,
  onMovieClick,
}: {
  status: Record<number, WatchStatus>
  onToggleStatus: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  onMovieClick: (id: number) => void
}) {
  const [activeKey, setActiveKey] = useState<string>(CATEGORIES[0].key)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeCategory = CATEGORIES.find(c => c.key === activeKey)!

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchMovies(CATEGORIES[0].genreIds)
      .then(m => { setMovies(m); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const handleSelect = (key: string, genreIds: string) => {
    setActiveKey(key)
    setLoading(true)
    setError(null)
    setMovies([])
    fetchMovies(genreIds)
      .then(m => { setMovies(m); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  return (
    <main className={styles.main}>
      {/* ----- header ----- */}
      <div className={styles.head}>
        <p className={styles.sectionLabel}>FILTER</p>
        <h1 className={styles.sectionTitle}>筛选推荐</h1>
      </div>

      {/* ----- category buttons ----- */}
      <div className={styles.categoryGrid}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => handleSelect(c.key, c.genreIds)}
            className={`${styles.categoryBtn} ${activeKey === c.key ? styles.categoryBtnActive : ''}`}
          >
            <span className={styles.categoryEmoji}>{c.emoji}</span>
            <span className={styles.categoryName}>{c.label}</span>
          </button>
        ))}
      </div>

      {/* ----- results ----- */}
      {activeCategory && (
        <div className={styles.resultSection}>
          <div className={styles.resultHead}>
            <p className={styles.resultLabel}>RESULTS</p>
            <h2 className={styles.resultTitle}>
              {activeCategory.label} · 共 {movies.length} 部
            </h2>
          </div>

          {loading ? (
            <div className={styles.loading}>加载中...</div>
          ) : error ? (
            <div className={styles.error}>加载失败: {error}</div>
          ) : movies.length === 0 ? (
            <div className={styles.empty}>暂无符合条件的电影</div>
          ) : (
            <div className={styles.grid}>
              {movies.map(m => (
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
