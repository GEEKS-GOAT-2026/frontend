"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import BottomNav from "../../components/BottomNav";
import { ClubEvent, getEvents } from "../../lib/api";

import styles from "./page.module.css";

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

function getClubIdFromQuery(searchParams: URLSearchParams) {
  const rawClubId = searchParams.get("clubId");
  const clubId = rawClubId ? Number(rawClubId) : NaN;

  return Number.isFinite(clubId) ? clubId : undefined;
}

function EventDetailContent() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const searchParams = useSearchParams();
  const eventId = Number(params.eventId);
  const clubId = getClubIdFromQuery(searchParams);
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      if (!Number.isFinite(eventId)) {
        setError("행사 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const eventPage = await getEvents({
          page: 0,
          size: 100,
          clubId,
        });
        const targetEvent = eventPage.content.find((item) => item.id === eventId);

        if (!targetEvent) {
          throw new Error("행사를 찾을 수 없습니다.");
        }

        setEvent(targetEvent);
      } catch (err) {
        setError(err instanceof Error ? err.message : "행사를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvent();
  }, [clubId, eventId]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          ‹
        </button>
        <div>
          <h1>행사 상세</h1>
          <p>동아리 행사를 자세히 보기</p>
        </div>
      </header>

      {isLoading && <p className={styles.statusText}>행사를 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && event && (
        <article className={styles.detail}>
          <div className={styles.heroImage}>
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={`${event.title} 포스터`} />
            ) : (
              <strong>공연 포스터 이미지</strong>
            )}
          </div>

          <span className={styles.badge}>행사</span>
          <h2>{event.title}</h2>

          <p className={styles.meta}>
            {event.clubName} · {formatDate(event.eventDate)}
            {event.location && ` · ${event.location}`}
          </p>

          <section className={styles.bodySection}>
            <h3>행사 소개</h3>
            <p>{event.description}</p>
          </section>

        </article>
      )}

      <BottomNav />
    </main>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={null}>
      <EventDetailContent />
    </Suspense>
  );
}
