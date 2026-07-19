import type { Movie, WatchStatus } from '../types/movie'
import { imgUrl } from '../utils/movie'
import GenreTag from './GenreTag'
import ActionButtons from './ActionButtons'
import SimilarMovieRow from './SimilarMovieRow'
import styles from './MovieDetail.module.css'

export default function MovieDetail({
  movie,
  status,
  onToggle,
  allMovies,
  onBack,
  onMovieClick
}: {
  movie: Movie
  status: WatchStatus
  onToggle: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  allMovies: Movie[]
  onBack: () => void
  onMovieClick: (id: number) => void
}) {
  const similar = allMovies
    .filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.includes(g)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)

  return (
    <div className={styles.wrap}>
      <div style={{ padding: '20px 0 0' }}>
        <button className={styles.backBtn} onClick={onBack}>
          ← 返回
        </button>
      </div>

      <div className={styles.hero}>
        <img
          src={imgUrl(movie.backdrop, 1280) || imgUrl(movie.photo, 500)}
          alt={movie.titleCN}
          className={styles.heroImg}
        />
        <div className={styles.heroGradient} />
        <div className={styles.heroContent}>
          <div className={styles.heroGenres}>
            {movie.genres.map(g => (
              <GenreTag key={g} label={g} />
            ))}
          </div>
          <h1 className={styles.heroTitle}>{movie.titleCN}</h1>
          <p className={styles.heroSub}>{movie.title}</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.metaBar}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginRight: '12px' }}>
            <span className={styles.ratingScore}>{movie.rating}</span>
            <span className={styles.ratingMax}>/10</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.metaGrid}>
            <div>
              <div className={styles.metaLabel}>年份</div>
              <div className={styles.metaValue}>{movie.year}</div>
            </div>
            <div>
              <div className={styles.metaLabel}>时长</div>
              <div className={styles.metaValue}>{movie.duration} 分钟</div>
            </div>
            <div>
              <div className={styles.metaLabel}>导演</div>
              <div className={styles.metaValue}>{movie.director}</div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <ActionButtons id={movie.id} status={status} onToggle={onToggle} />
        </div>

        {movie.tagline && (
          <p className={styles.tagline}>"{movie.tagline}"</p>
        )}

        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>剧情简介</h2>
            <div className={styles.sectionLine} />
          </div>
          <p className={styles.description}>{movie.description}</p>
        </div>

        {similar.length > 0 && (
          <div>
            <div className={styles.sectionHeader} style={{ marginBottom: '4px' }}>
              <h2 className={styles.sectionTitle}>相似推荐</h2>
              <div className={styles.sectionLine} />
            </div>
            <div>
              {similar.map(m => (
                <SimilarMovieRow key={m.id} movie={m} onClick={() => onMovieClick(m.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
