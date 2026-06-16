"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import BottomNav from "../components/BottomNav";
import { ClubEvent, getEvents } from "../lib/api";

import styles from "./page.module.css";

function EventsContent() {
  const searchParams = useSearchParams();
  const clubIdParam = searchParams.get("clubId");
  const clubName = searchParams.get("clubName") ?? "";
  const clubId = useMemo(() => {
    if (!clubIdParam) {
      return undefined;
    }

    const parsed = Number(clubIdParam);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [clubIdParam]);

  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const eventPage = await getEvents({ page: 0, size: 20, clubId });
        setEvents(eventPage.content);
      } catch (error) {
        console.warn("Failed to load events:", error);
        setError(
          "행사 목록을 불러오지 못했습니다. 로그인 상태와 백엔드 실행 상태를 확인해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadEvents();
  }, [clubId]);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{clubName ? `${clubName} 행사` : "행사"}</h1>

      <section className={styles.list}>
        {events.map((event) => (
          <article key={event.id} className={styles.card}>
            <p className={styles.meta}>{event.clubName}</p>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p className={styles.meta}>
              {event.eventDate}
              {event.location ? ` · ${event.location}` : ""}
            </p>
          </article>
        ))}

        {loading && events.length === 0 && (
          <p className={styles.emptyText}>행사 목록을 불러오는 중입니다.</p>
        )}

        {!loading && error && events.length === 0 && (
          <p className={styles.emptyText}>{error}</p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className={styles.emptyText}>
            {clubName ? `${clubName}에 등록된 행사가 없습니다.` : "등록된 행사가 없습니다."}
          </p>
        )}
      </section>

      <BottomNav />
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={null}>
      <EventsContent />
    </Suspense>
  );
}
