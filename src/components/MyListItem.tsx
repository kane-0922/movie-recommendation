import type { Movie, WatchStatus } from '../types/movie'
import { imgUrl } from '../utils/movie'
import GenreTag from './GenreTag'
import ActionButtons from './ActionButtons'
import styles from './MyListItem.module.css'

export default function MyListItem({
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
      <div className={styles.cover}>
        <img
          src={imgUrl(movie.photo, 185)}
          alt={movie.titleCN}
          className={styles.coverImg}
        />
      </div>
      <div className={styles.body}>
        <div>
          <h3 className={styles.titleCN}>{movie.titleCN}</h3>
          <p className={styles.titleEn}>{movie.title}</p>
          <div className={styles.meta}>
            <span className={styles.rating}>★ {movie.rating}</span>
            <span className={styles.dot}>·</span>
            <span>{movie.year}</span>
            <span className={styles.dot}>·</span>
            <span>{movie.director || ''}</span>
          </div>
          <div className={styles.genres}>
            {movie.genres.map(g => (
              <GenreTag key={g} label={g} />
            ))}
          </div>
        </div>
        <ActionButtons id={movie.id} status={status} onToggle={onToggle} />
      </div>
    </div>
  )
}
