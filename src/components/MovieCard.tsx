import type { Movie, WatchStatus } from '../types/movie'
import { imgUrl } from '../utils/movie'
import GenreTag from './GenreTag'
import ActionButtons from './ActionButtons'
import styles from './MovieCard.module.css'

export default function MovieCard({
  movie,
  status,
  onToggle,
  onClick
}: {
  movie: Movie
  status: WatchStatus
  onToggle: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  onClick: () => void
}) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.posterWrap}>
        <img
          src={imgUrl(movie.photo, 342)}
          alt={movie.titleCN}
          className={styles.poster}
        />
        <div className={styles.ratingBadge}>★{movie.rating}</div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.titleCN}>{movie.titleCN}</h3>
        <p className={styles.titleEn}>{movie.title}</p>
        <div className={styles.genres}>
          {movie.genres.slice(0, 2).map(g => (
            <GenreTag key={g} label={g} />
          ))}
        </div>
        <div onClick={e => e.stopPropagation()}>
          <ActionButtons id={movie.id} status={status} onToggle={onToggle} compact />
        </div>
      </div>
    </div>
  )
}
