import type { WatchStatus } from '../types/movie'
import styles from './ActionButtons.module.css'

export default function ActionButtons({
  id,
  status,
  onToggle,
  compact = false
}: {
  id: number
  status: WatchStatus
  onToggle: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  compact?: boolean
}) {
  const wantActive = status === 'want'
  const watchedActive = status === 'watched'

  return (
    <div className={styles.row}>
      <button
        onClick={e => {
          e.stopPropagation()
          onToggle(id, 'want')
        }}
        className={`${styles.btn} ${compact ? styles.compact : ''} ${wantActive ? styles.active : ''}`}>
        {wantActive ? '★ 想看' : '☆ 想看'}
      </button>
      <button
        onClick={e => {
          e.stopPropagation()
          onToggle(id, 'watched')
        }}
        className={`${styles.btn} ${compact ? styles.compact : ''} ${watchedActive ? styles.active : ''}`}>
        {watchedActive ? '● 看过' : '○ 看过'}
      </button>
    </div>
  )
}
