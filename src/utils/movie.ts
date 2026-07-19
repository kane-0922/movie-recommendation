import type { Movie, Quote } from '../types/movie'
import quotes from '../data/quotes.json'

const QUOTES: Quote[] = quotes

export const imgUrl = (path: string, w: number, _h?: number) =>
  path ? `https://image.tmdb.org/t/p/w${w}${path}` : ''

export function getDailyPicks(movies: Movie[]): Movie[] {
  const d = new Date()
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  if (movies.length === 0) return []
  const picks: Movie[] = []
  const used = new Set<number>()
  let s = seed >>> 0
  for (let i = 0; picks.length < Math.min(5, movies.length) && i < 1000; i++) {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0
    const idx = s % movies.length
    if (!used.has(idx)) {
      used.add(idx)
      picks.push(movies[idx])
    }
  }
  return picks
}

export function getDailyQuote(): Quote {
  const d = new Date()
  return QUOTES[d.getDate() % QUOTES.length]
}
