import type { Movie, WatchStatus } from '../types/movie'
import MyListItem from '../components/MyListItem'
import styles from './MyListPage.module.css'

export default function MyListPage({
  wantList,
  watchedList,
  myFilter,
  onSetFilter,
  status,
  onToggleStatus,
  onMovieClick,
  onNavigateHome
}: {
  wantList: Movie[]
  watchedList: Movie[]
  myFilter: 'want' | 'watched'
  onSetFilter: (f: 'want' | 'watched') => void
  status: Record<number, WatchStatus>
  onToggleStatus: (id: number, t: Exclude<WatchStatus, 'none'>) => void
  onMovieClick: (id: number) => void
  onNavigateHome: () => void
}) {
  const myList = myFilter === 'want' ? wantList : watchedList

  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <p className={styles.label}>MY LIST</p>
        <h1 className={styles.title}>我的片单</h1>
      </div>

      <div className={styles.filters}>
        <button
          onClick={() => onSetFilter('want')}
          className={`${styles.filterBtn} ${myFilter === 'want' ? styles.filterBtnActive : ''}`}>
          ♡ 想看{wantList.length > 0 ? ` (${wantList.length})` : ''}
        </button>
        <button
          onClick={() => onSetFilter('watched')}
          className={`${styles.filterBtn} ${myFilter === 'watched' ? styles.filterBtnActive : ''}`}>
          ● 看过{watchedList.length > 0 ? ` (${watchedList.length})` : ''}
        </button>
      </div>

      {myList.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>{myFilter === 'want' ? '♡' : '●'}</div>
          <p className={styles.emptyText}>还没有标记想看的电影</p>
          <p className={styles.emptyHint}>在今日推荐中标记你感兴趣的电影</p>
          <button className={styles.browseBtn} onClick={onNavigateHome}>
            去看今日推荐 →
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {myList.map(m => (
            <MyListItem key={m.id} movie={m} status={status[m.id] ?? 'none'} onToggle={onToggleStatus} onClick={() => onMovieClick(m.id)} />
          ))}
        </div>
      )}
    </main>
  )
}
