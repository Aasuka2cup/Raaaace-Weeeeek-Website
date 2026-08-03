"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import type { SearchRecord } from "@/app/search-index.json/route";

import styles from "./SearchOverlay.module.css";

export function SearchOverlay() {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetched lazily on first open rather than on every page load — the index
  // is small, but there's no reason to pay for it on pages nobody searches
  // from.
  useEffect(() => {
    if (!isOpen || records) return;
    fetch("/search-index.json")
      .then((response) => response.json())
      .then((data: SearchRecord[]) => setRecords(data))
      .catch(() => setRecords([]));
  }, [isOpen, records]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => !current);
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const fuse = useMemo(() => {
    if (!records) return null;
    return new Fuse(records, {
      keys: [
        { name: "title", weight: 2 },
        { name: "description", weight: 1 },
        { name: "tags", weight: 1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [records]);

  const results = useMemo(() => {
    if (!fuse || query.trim().length === 0) return [];
    return fuse.search(query).slice(0, 12).map((result) => result.item);
  }, [fuse, query]);

  function close() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(true)}
        aria-label={messages.searchHint}
      >
        {messages.searchLabel}
      </button>

      {isOpen ? (
        <div className={styles.backdrop} onClick={close}>
          <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder={messages.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            {query.trim().length > 0 ? (
              results.length > 0 ? (
                <ul className={styles.results}>
                  {results.map((record) => (
                    <li key={record.id}>
                      <Link href={record.url} className={styles.result} onClick={close}>
                        <span className={styles.resultType}>
                          {record.type === "blog" ? messages.homeBlogTitle : messages.homePodcastTitle}
                        </span>
                        <span className={styles.resultTitle}>{record.title}</span>
                        <span className={styles.resultDescription}>{record.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>{messages.searchNoResults}</p>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
