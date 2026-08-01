"use client";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import { Card } from "@/components/ui/Card";
import { WireframeSphere } from "@/components/ui/WireframeSphere";

import styles from "./page.module.css";

export default function Home() {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.wireframeWrap}>
          <WireframeSphere size={760} />
        </div>
        <span className={styles.eyebrow}>{messages.homeEyebrow}</span>
        <h1 className={styles.title}>{messages.homeTitle}</h1>
        <p className={styles.subtitle}>{messages.homeSubtitle}</p>
      </section>

      <section className={styles.cards}>
        <Card
          href="/f1-fantasy"
          eyebrow="F1"
          title={messages.homeF1Title}
          description={messages.homeF1Description}
          cta={messages.homeF1Cta}
        />
        <Card
          href="/podcast"
          eyebrow="Audio"
          title={messages.homePodcastTitle}
          description={messages.homePodcastDescription}
          cta={messages.homePodcastCta}
        />
        <Card
          href="/blog"
          eyebrow="Writing"
          title={messages.homeBlogTitle}
          description={messages.homeBlogDescription}
          cta={messages.homeBlogCta}
        />
      </section>
    </main>
  );
}
