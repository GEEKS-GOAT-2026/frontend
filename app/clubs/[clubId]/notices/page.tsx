"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BottomNav from "../../../components/BottomNav";
import { ClubDetail, ClubNotice, getClub, getClubNotices } from "../../../lib/api";

import styles from "./page.module.css";

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

export default function ClubNoticesPage() {
  const router = useRouter();
  const params = useParams<{ clubId: string }>();
  const clubId = Number(params.clubId);
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [notices, setNotices] = useState<ClubNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotices = async () => {
      if (!Number.isFinite(clubId)) {
        setError("동아리 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const [clubData, noticeData] = await Promise.all([
          getClub(clubId),
          getClubNotices(clubId),
        ]);
        setClub(clubData);
        setNotices(noticeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "공지사항을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotices();
  }, [clubId]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.logoButton} onClick={() => router.back()}>
          <img src="/logo.png" alt="dongne logo" />
        </button>
        <div>
          <h1>동네(동아리 공지사항)</h1>
        </div>
      </header>

      {isLoading && <p className={styles.statusText}>공지사항을 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && notices.length === 0 && (
        <p className={styles.statusText}>
          {club ? `${club.name}에 등록된 공지사항이 없습니다.` : "등록된 공지사항이 없습니다."}
        </p>
      )}

      <section className={styles.noticeList} aria-label="동아리 공지사항 목록">
        {notices.map((notice) => (
          <article key={notice.id} className={styles.noticeCard}>
            <div className={styles.badgeSlot}>
              {notice.badge && (
                <span className={notice.pinned ? styles.importantBadge : styles.newBadge}>
                  {notice.badge}
                </span>
              )}
            </div>

            <div className={styles.noticeContent}>
              <h2>{notice.title}</h2>
              <p>{notice.content}</p>
            </div>

            <time className={styles.dateText}>{formatDate(notice.noticeDate)}</time>

            <span className={styles.chevron} aria-hidden="true">
              ›
            </span>
          </article>
        ))}
      </section>

      <BottomNav />
    </main>
  );
}
