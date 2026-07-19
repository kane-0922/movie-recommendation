import type { Movie } from '../types/movie'
import GenreTag from './GenreTag'
import styles from './SimilarMovieRow.module.css'

export default function SimilarMovieRow({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  return (
    <div className={styles.row} onClick={onClick}>
      <div className={styles.info}>
        <span className={styles.titleCN}>{movie.titleCN}</span>
        <span className={styles.meta}>
          {movie.year} · {movie.director}
        </span>
      </div>
      <div className={styles.right}>
        {movie.genres.slice(0, 2).map(g => (
          <GenreTag key={g} label={g} />
        ))}
        <span className={styles.rating}>★ {movie.rating}</span>
        <span className={styles.arrow}>›</span>
      </div>
    </div>
  )
}
