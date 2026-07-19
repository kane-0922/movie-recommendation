import { useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { fetchDiscover, fetchGenres, fetchTopRated, fetchTrending, tmdbToMovieMinimal } from './api/tmdb'
import styles from './App.module.css'
import MovieDetailRoute from './components/MovieDetailRoute'
import FilterPage from './pages/FilterPage'
import MyListPage from './pages/MyListPage'
import TodayPage from './pages/TodayPage'
import type { Movie, WatchStatus } from './types/movie'
import { getTodayString } from './utils/date'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // ---------- global state ----------
  const [status, setStatus] = useState<Record<number, WatchStatus>>(() => {
    try {
      const saved = localStorage.getItem('watch_status')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const [myFilter, setMyFilter] = useState<'want' | 'watched'>('want')
  const [discoverPool, setDiscoverPool] = useState<Movie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [dailyPicks, setDailyPicks] = useState<Movie[]>([])
  const [filterMovies, setFilterMovies] = useState<Movie[]>([])
  const [genreList, setGenreList] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailCache, setDetailCache] = useState<Record<number, Movie>>({})
  const [movieCache, setMovieCache] = useState<Record<number, Movie>>(() => {
    try {
      const saved = localStorage.getItem('movie_cache')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  // ---------- data fetching ----------
  useEffect(() => {
    fetchGenres()
      .then(g => setGenreList(g))
      .catch(() => {})
  }, [])

  // daily picks: top_rated, deterministic random pages, serial fetch
  useEffect(() => {
    const d = new Date()
    const seed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) >>> 0
    let s = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0

    // 5 unique page numbers 1-60
    const pages: number[] = []
    const pageSet = new Set<number>()
    while (pages.length < 5) {
      const p = (s % 60) + 1
      s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0
      if (!pageSet.has(p)) {
        pageSet.add(p)
        pages.push(p)
      }
    }

    const todayStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    const CACHE_KEY = `daily_${todayStr}`

    const doFetch = async () => {
      // check localStorage first
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        try {
          const data = JSON.parse(cached)
          if (Array.isArray(data) && data.length >= 5) {
            setDailyPicks(data)
            setLoading(false)
            return
          }
        } catch { /* corrupt cache — refetch */ }
      }

      setLoading(true)
      setError(null)
      const picks: Movie[] = []
      const seen = new Set<number>()

      for (const page of pages) {
        try {
          const results = await fetchTopRated(page)
          if (results.length === 0) continue
          const idx = s % results.length
          s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0
          const movie = tmdbToMovieMinimal(results[idx])
          if (!seen.has(movie.id)) {
            seen.add(movie.id)
            picks.push(movie)
          }
        } catch {
          /* skip failed pages */
        }
      }

      setDailyPicks(picks)
      localStorage.setItem(CACHE_KEY, JSON.stringify(picks))
      setLoading(false)
    }
    doFetch()
  }, [])

  useEffect(() => {
    fetchDiscover({ sortBy: 'vote_average.desc', voteCountGte: 2000, page: 1 })
      .then(r => setDiscoverPool(r.map(tmdbToMovieMinimal)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchTrending()
      .then(r => setTrendingMovies(r.map(tmdbToMovieMinimal)))
      .catch(e => console.error('[trending]', e))
  }, [])

  // persist watch status to localStorage
  useEffect(() => {
    localStorage.setItem('watch_status', JSON.stringify(status))
  }, [status])

  // persist movie cache to localStorage
  useEffect(() => {
    localStorage.setItem('movie_cache', JSON.stringify(movieCache))
  }, [movieCache])

  // sync movies from all pools into persistent cache (so marked movies survive pool changes)
  useEffect(() => {
    const allCurrent = [...discoverPool, ...trendingMovies, ...dailyPicks, ...filterMovies]
    if (allCurrent.length === 0) return
    setMovieCache(prev => {
      const next = { ...prev }
      let changed = false
      for (const m of allCurrent) {
        if (!(m.id in next)) {
          next[m.id] = m
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [discoverPool, trendingMovies, dailyPicks, filterMovies])

  // ---------- derived data ----------
  const allMovies = useMemo(() => {
    const pool = [...discoverPool, ...trendingMovies, ...dailyPicks, ...filterMovies]
    const seen = new Set(pool.map(m => m.id))
    const cached = Object.values(movieCache).filter(m => !seen.has(m.id))
    return [...pool, ...cached]
  }, [discoverPool, trendingMovies, dailyPicks, filterMovies, movieCache])
  const wantList = allMovies.filter(m => status[m.id] === 'want')
  const watchedList = allMovies.filter(m => status[m.id] === 'watched')

  // ---------- actions ----------
  const toggleStatus = (id: number, target: Exclude<WatchStatus, 'none'>) => {
    setStatus(prev => {
      const next: Record<number, WatchStatus> = { ...prev, [id]: prev[id] === target ? 'none' : target }
      localStorage.setItem('watch_status', JSON.stringify(next))
      return next
    })
  }

  const navigateToMovie = (id: number) => {
    navigate(`/movie/${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isDetailPage = location.pathname.startsWith('/movie/')

  // ---------- UI ----------
  return (
    <div className={styles.app}>
      {/* ----- header ----- */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <button onClick={() => navigate('/')} className={styles.brandBtn}>
              <span className={styles.brandName}>REEL</span>
              <span className={styles.brandTag}>每日好片</span>
            </button>
          </div>
          <div className={styles.date}>{getTodayString()}</div>
          <div className={styles.actions}>
            <button onClick={() => navigate('/mylist')} className={`${styles.headerBtn} ${wantList.length > 0 ? styles.headerBtnActive : ''}`}>
              <span>♡</span>
              <span className={styles.headerBtnCount}>{wantList.length}</span>
            </button>
            <button onClick={() => navigate('/mylist')} className={`${styles.headerBtn} ${watchedList.length > 0 ? styles.headerBtnActive : ''}`}>
              <span>●</span>
              <span className={styles.headerBtnCount}>{watchedList.length}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ----- tab bar (hidden on detail page) ----- */}
      {!isDetailPage && (
        <div className={styles.tabBar}>
          <div className={styles.tabInner}>
            {(['today', 'filter', 'mylist'] as const).map(t => {
              const active =
                t === 'today' ? location.pathname === '/' : t === 'filter' ? location.pathname === '/filter' : location.pathname === '/mylist'
              const route = t === 'today' ? '/' : t === 'filter' ? '/filter' : '/mylist'
              const label =
                t === 'today'
                  ? '今日推荐'
                  : t === 'filter'
                    ? '筛选推荐'
                    : `我的片单${wantList.length + watchedList.length > 0 ? `  ♥ ${wantList.length + watchedList.length}` : ''}`
              return (
                <button key={t} onClick={() => navigate(route)} className={`${styles.tab} ${active ? styles.tabActive : ''}`}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ----- routes ----- */}
      <Routes>
        <Route
          path="/"
          element={
            <TodayPage
              dailyPicks={dailyPicks}
              trendingMovies={trendingMovies}
              loading={loading}
              error={error}
              status={status}
              onToggleStatus={toggleStatus}
              onMovieClick={navigateToMovie}
            />
          }
        />
        <Route path="/filter" element={<FilterPage status={status} onToggleStatus={toggleStatus} onMovieClick={navigateToMovie} filterMovies={filterMovies} setFilterMovies={setFilterMovies} />} />
        <Route
          path="/mylist"
          element={
            <MyListPage
              wantList={wantList}
              watchedList={watchedList}
              myFilter={myFilter}
              onSetFilter={setMyFilter}
              status={status}
              onToggleStatus={toggleStatus}
              onMovieClick={navigateToMovie}
              onNavigateHome={() => navigate('/')}
            />
          }
        />
        <Route
          path="/movie/:id"
          element={
            <MovieDetailRoute
              allMovies={allMovies}
              detailCache={detailCache}
              setDetailCache={setDetailCache}
              status={status}
              toggleStatus={toggleStatus}
              onMovieClick={navigateToMovie}
            />
          }
        />
      </Routes>
    </div>
  )
}
