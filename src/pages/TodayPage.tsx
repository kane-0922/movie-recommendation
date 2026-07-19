import MovieCard from '../components/MovieCard'
import TrendingSection from '../components/TrendingSection'
import type { Movie, WatchStatus } from '../types/movie'
import { getDailyQuote } from '../utils/movie'
import styles from './TodayPage.module.css'

export default function TodayPage({
  dailyPicks,
  trendingMovies,
  loading,
  error,
  status,
  onToggleStatus,
  onMovieClick
}: {
  dailyPicks: Movie[]
  trendingMovies: Movie[]
  loading: boolean
  error: string | null
  status: Record<number, WatchStatus>
  onToggleStatus: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  onMovieClick: (id: number) => void
}) {
  const quote = getDailyQuote()

  return (
    <main className={styles.main}>
      <div className={styles.sectionHead}>
        <p className={styles.sectionLabel}>DAILY QUOTE</p>
        <div className={styles.titleRow}>
          <h1 className={styles.sectionTitle}>今日台词</h1>
          <span className={styles.titleDesc}>经典电影台词</span>
        </div>
      </div>

      <div className={styles.quote}>
        <p className={styles.quoteText}>"{quote.text}"</p>
        <p className={styles.quoteAttr}>
          —— {quote.movie} ({quote.year})
        </p>
      </div>

      <div className={styles.sectionHead}>
        <p className={styles.sectionLabel}>RECOMMENDED</p>
        <div className={styles.titleRow}>
          <h1 className={styles.sectionTitle}>今日推荐</h1>
          <span className={styles.titleDesc}>每日精选五部影片</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : error ? (
        <div className={styles.error}>加载失败: {error}</div>
      ) : dailyPicks.length === 0 ? (
        <div className={styles.empty}>该类型暂无电影</div>
      ) : (
        <div className={styles.grid}>
          {dailyPicks.map(m => (
            <MovieCard key={m.id} movie={m} status={status[m.id] ?? 'none'} onToggle={onToggleStatus} onClick={() => onMovieClick(m.id)} />
          ))}
        </div>
      )}

      <TrendingSection movies={trendingMovies} status={status} onToggle={onToggleStatus} onMovieClick={onMovieClick} />
    </main>
  )
}
