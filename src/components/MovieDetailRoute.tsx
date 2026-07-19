import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Movie, WatchStatus } from '../types/movie'
import { fetchMovieDetail, enrichMovieWithDetail, tmdbDetailToMovie } from '../api/tmdb'
import MovieDetail from './MovieDetail'
import styles from './MovieDetailRoute.module.css'

export default function MovieDetailRoute({
  allMovies,
  detailCache,
  setDetailCache,
  status,
  toggleStatus,
  onMovieClick
}: {
  allMovies: Movie[]
  detailCache: Record<number, Movie>
  setDetailCache: React.Dispatch<React.SetStateAction<Record<number, Movie>>>
  status: Record<number, WatchStatus>
  toggleStatus: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  onMovieClick: (id: number) => void
}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const movieId = id ? Number(id) : null

  useEffect(() => {
    if (movieId !== null && !detailCache[movieId]) {
      fetchMovieDetail(movieId)
        .then(detail => {
          const existing = allMovies.find(m => m.id === movieId)
          setDetailCache(p => ({
            ...p,
            [movieId]: existing
              ? enrichMovieWithDetail(existing, detail)
              : tmdbDetailToMovie(detail),
          }))
        })
        .catch(() => {})
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [movieId, allMovies, detailCache, setDetailCache])

  if (movieId === null) return null

  const movie = detailCache[movieId] ?? allMovies.find(m => m.id === movieId) ?? null

  if (!movie) {
    return <div className={styles.loading}>加载中...</div>
  }

  return (
    <MovieDetail
      movie={movie}
      status={status[movie.id] ?? 'none'}
      onToggle={toggleStatus}
      allMovies={allMovies}
      onBack={() => navigate(-1)}
      onMovieClick={onMovieClick}
    />
  )
}
