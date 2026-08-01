import styles from "./Waveform.module.css";

const BAR_COUNT = 7;

export function Waveform({ active }: { active: boolean }) {
  return (
    <div className={active ? `${styles.waveform} ${styles.active}` : styles.waveform} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <span key={index} className={styles.bar} style={{ animationDelay: `${index * 90}ms` }} />
      ))}
    </div>
  );
}
