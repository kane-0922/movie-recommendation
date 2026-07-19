import styles from './GenreTag.module.css'

export default function GenreTag({ label }: { label: string }) {
  return <span className={styles.tag}>{label}</span>
}
