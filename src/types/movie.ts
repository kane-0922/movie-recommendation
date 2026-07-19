export type WatchStatus = 'none' | 'want' | 'watched'

export interface Movie {
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
}

export interface Quote {
  text: string
  movie: string
  year: number
}
