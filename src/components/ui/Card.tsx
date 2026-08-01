import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./Card.module.css";

export function Card({
  href,
  eyebrow,
  title,
  description,
  cta,
  external = false,
}: {
  href: string;
  eyebrow?: string;
  title: string;
  description: string;
  cta: string;
  external?: boolean;
}): ReactNode {
  const content = (
    <>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <span className={styles.cta}>{cta} →</span>
    </>
  );

  if (external) {
    return (
      <a href={href} className={styles.card} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={styles.card}>
      {content}
    </Link>
  );
}
