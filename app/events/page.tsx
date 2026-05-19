"use client";

import { useEffect, useState } from "react";
import BottomNavigation from "../components/BottomNavigation";
import styles from "../components/PlaceholderPage.module.css";
import { apiFetch, ClubEvent, EventPage } from "../lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const eventPage = await apiFetch<EventPage>("/api/events?page=0&size=20");
        setEvents(eventPage.content);
      } catch (error) {
        console.warn("Failed to load events:", error);
        setError("행사 목록을 불러오지 못했습니다. 로그인 상태와 백엔드 실행 상태를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    void loadEvents();
  }, []);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>events</h1>

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
          <p className={styles.emptyText}>등록된 행사가 없습니다.</p>
        )}
      </section>

      <BottomNavigation />
    </main>
  );
}
