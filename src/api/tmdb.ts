import type { Movie } from '../types/movie'

const TMDB_BASE = 'https://api.themoviedb.org/3'
export const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p'
const API_KEY = 'f66def6df3e8b92795935256ed704361'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TMDbMovieResult {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export interface TMDbMovieDetail extends TMDbMovieResult {
  tagline: string
  runtime: number
  genres: { id: number; name: string }[]
  credits?: {
    crew: { job: string; name: string }[]
  }
}

export interface TMDbGenre {
  id: number
  name: string
}

/* ------------------------------------------------------------------ */
/*  Genre name cache (fetched once, shared across conversions)         */
/* ------------------------------------------------------------------ */

let genreNameMap: Record<number, string> = {}

export function getGenreName(id: number): string {
  return genreNameMap[id] ?? String(id)
}

export function getAvailableGenres(): TMDbGenre[] {
  return Object.entries(genreNameMap).map(([id, name]) => ({
    id: Number(id),
    name,
  }))
}

/* ------------------------------------------------------------------ */
/*  API calls                                                          */
/* ------------------------------------------------------------------ */

export async function fetchGenres(
  language = 'zh-CN'
): Promise<TMDbGenre[]> {
  const res = await fetch(
    `${TMDB_BASE}/genre/movie/list?api_key=${API_KEY}&language=${language}`
  )
  const data = await res.json()
  const genres: TMDbGenre[] = data.genres ?? []
  genreNameMap = Object.fromEntries(genres.map((g) => [g.id, g.name]))
  return genres
}

export async function fetchDiscover(options: {
  genreIds?: string
  page?: number
  sortBy?: string
  voteCountGte?: number
}): Promise<TMDbMovieResult[]> {
  const params: Record<string, string> = {
    api_key: API_KEY,
    language: 'zh-CN',
    sort_by: options.sortBy ?? 'vote_average.desc',
    'vote_count.gte': String(options.voteCountGte ?? 200),
  }
  if (options.genreIds) params.with_genres = options.genreIds
  if (options.page) params.page = String(options.page)

  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${TMDB_BASE}/discover/movie?${qs}`)
  const data = await res.json()
  return data.results ?? []
}

export async function fetchTrending(): Promise<TMDbMovieResult[]> {
  const res = await fetch(
    `${TMDB_BASE}/movie/popular?api_key=${API_KEY}&language=zh-CN`
  )
  const data = await res.json()
  return data.results ?? []
}

export async function fetchMovieDetail(
  id: number
): Promise<TMDbMovieDetail> {
  const res = await fetch(
    `${TMDB_BASE}/movie/${id}?api_key=${API_KEY}&language=zh-CN&append_to_response=credits`
  )
  return res.json()
}

/* ------------------------------------------------------------------ */
/*  Data mapping helpers                                               */
/* ------------------------------------------------------------------ */

/** Build a poster / backdrop URL from a TMDB path */
export function tmdbImgUrl(
  path: string | null,
  width: number
): string | null {
  if (!path) return null
  return `${TMDB_IMG_BASE}/w${width}${path}`
}

/** Convert a TMDB list result to our internal Movie shape (partial) */
export function tmdbToMovieMinimal(
  tmdb: TMDbMovieResult
): {
  id: number
  title: string
  titleCN: string
  year: number
  director: string
  rating: number
  genres: string[]
  duration: number
  description: string
  tagline: string
  photo: string
  backdrop: string
} {
  return {
    id: tmdb.id,
    title: tmdb.original_title,
    titleCN: tmdb.title,
    year: tmdb.release_date
      ? new Date(tmdb.release_date).getFullYear()
      : 0,
    director: '',
    rating: Math.round(tmdb.vote_average * 10) / 10,
    genres: (tmdb.genre_ids ?? []).map(getGenreName),
    duration: 0,
    description: tmdb.overview,
    tagline: '',
    photo: tmdb.poster_path ?? '',
    backdrop: tmdb.backdrop_path ?? '',
  }
}

/** Enrich a minimal Movie with full detail (director, runtime, backdrop) */
export function enrichMovieWithDetail(
  movie: ReturnType<typeof tmdbToMovieMinimal>,
  detail: TMDbMovieDetail
): ReturnType<typeof tmdbToMovieMinimal> {
  const director =
    detail.credits?.crew?.find((c) => c.job === 'Director')?.name ?? ''
  return {
    ...movie,
    director,
    duration: detail.runtime ?? 0,
    genres:
      detail.genres?.map((g) => g.name) ?? movie.genres,
    description: detail.overview ?? movie.description,
    tagline: detail.tagline ?? '',
    photo: detail.poster_path ?? movie.photo,
    backdrop: detail.backdrop_path ?? movie.backdrop,
  }
}

/** Build a full Movie directly from a detail response (no existing data needed) */
export function tmdbDetailToMovie(detail: TMDbMovieDetail): Movie {
  return {
    id: detail.id,
    title: detail.original_title,
    titleCN: detail.title,
    year: detail.release_date
      ? new Date(detail.release_date).getFullYear()
      : 0,
    director:
      detail.credits?.crew?.find((c) => c.job === 'Director')?.name ?? '',
    rating: Math.round(detail.vote_average * 10) / 10,
    genres: detail.genres?.map((g) => g.name) ?? [],
    duration: detail.runtime ?? 0,
    description: detail.overview ?? '',
    tagline: detail.tagline ?? '',
    photo: detail.poster_path ?? '',
    backdrop: detail.backdrop_path ?? '',
  }
}
