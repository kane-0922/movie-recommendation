import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import type { Movie, WatchStatus } from './types/movie'
import { getDailyPicks } from './utils/movie'
import { getTodayString } from './utils/date'
import { fetchGenres, fetchDiscover, fetchTrending, tmdbToMovieMinimal } from './api/tmdb'
import MovieDetailRoute from './components/MovieDetailRoute'
import TodayPage from './pages/TodayPage'
import FilterPage from './pages/FilterPage'
import MyListPage from './pages/MyListPage'
import styles from './App.module.css'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // ---------- global state ----------
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)
  const [status, setStatus] = useState<Record<number, WatchStatus>>({})
  const [myFilter, setMyFilter] = useState<'want' | 'watched'>('want')
  const [discoverPool, setDiscoverPool] = useState<Movie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [genreList, setGenreList] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailCache, setDetailCache] = useState<Record<number, Movie>>({})

  // ---------- data fetching ----------
  useEffect(() => {
    fetchGenres().then(g => setGenreList(g)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchDiscover({ genreIds: selectedGenreId ? String(selectedGenreId) : undefined, sortBy: 'vote_average.desc', voteCountGte: 200, page: 1 })
      .then(r => { setDiscoverPool(r.map(tmdbToMovieMinimal)); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [selectedGenreId])

  useEffect(() => {
    fetchTrending().then(r => setTrendingMovies(r.map(tmdbToMovieMinimal))).catch(e => console.error('[trending]', e))
  }, [])

  // ---------- derived data ----------
  const allMovies = useMemo(() => [...discoverPool, ...trendingMovies], [discoverPool, trendingMovies])
  const dailyPicks = useMemo(() => getDailyPicks(discoverPool), [discoverPool])
  const wantList = allMovies.filter(m => status[m.id] === 'want')
  const watchedList = allMovies.filter(m => status[m.id] === 'watched')

  // ---------- actions ----------
  const toggleStatus = (id: number, target: Exclude<WatchStatus, 'none'>) => {
    setStatus(prev => ({ ...prev, [id]: prev[id] === target ? 'none' : target }))
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
            <button
              onClick={() => navigate('/mylist')}
              className={`${styles.headerBtn} ${wantList.length > 0 ? styles.headerBtnActive : ''}`}>
              <span>♡</span><span className={styles.headerBtnCount}>{wantList.length}</span>
            </button>
            <button
              onClick={() => navigate('/mylist')}
              className={`${styles.headerBtn} ${watchedList.length > 0 ? styles.headerBtnActive : ''}`}>
              <span>●</span><span className={styles.headerBtnCount}>{watchedList.length}</span>
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
                t === 'today' ? location.pathname === '/' :
                t === 'filter' ? location.pathname === '/filter' :
                location.pathname === '/mylist'
              const route =
                t === 'today' ? '/' :
                t === 'filter' ? '/filter' :
                '/mylist'
              const label =
                t === 'today' ? '今日推荐' :
                t === 'filter' ? '筛选推荐' :
                `我的片单${wantList.length + watchedList.length > 0 ? `  ♥ ${wantList.length + watchedList.length}` : ''}`
              return (
                <button
                  key={t}
                  onClick={() => navigate(route)}
                  className={`${styles.tab} ${active ? styles.tabActive : ''}`}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ----- routes ----- */}
      <Routes>
        <Route path="/" element={
          <TodayPage
            dailyPicks={dailyPicks}
            trendingMovies={trendingMovies}
            loading={loading}
            error={error}
            status={status}
            onToggleStatus={toggleStatus}
            onMovieClick={navigateToMovie}
          />
        } />
        <Route path="/filter" element={
          <FilterPage
            status={status}
            onToggleStatus={toggleStatus}
            onMovieClick={navigateToMovie}
          />
        } />
        <Route path="/mylist" element={
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
        } />
        <Route path="/movie/:id" element={
          <MovieDetailRoute
            allMovies={allMovies}
            detailCache={detailCache}
            setDetailCache={setDetailCache}
            status={status}
            toggleStatus={toggleStatus}
            onMovieClick={navigateToMovie}
          />
        } />
      </Routes>
    </div>
  )
}
