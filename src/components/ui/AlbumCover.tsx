import styles from "./AlbumCover.module.css";

export function AlbumCover({
  code,
  label,
  imageUrl,
  size = "md",
}: {
  code: string;
  label: string;
  imageUrl?: string;
  size?: "sm" | "md";
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized RSS-hosted image on a static export site
      <img
        src={imageUrl}
        alt={label}
        className={size === "sm" ? `${styles.cover} ${styles.sm}` : styles.cover}
      />
    );
  }

  return (
    <div
      className={size === "sm" ? `${styles.cover} ${styles.placeholder} ${styles.sm}` : `${styles.cover} ${styles.placeholder}`}
      role="img"
      aria-label={label}
    >
      <span className={styles.code}>{code}</span>
    </div>
  );
}
