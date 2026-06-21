"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import ClubCard from "../components/ClubCard";
import { Club, ClubEvent, getClubs, getRecentEvents } from "../lib/api";

import styles from "./page.module.css";

const categories = [
  { label: "전체", values: [] },
  { label: "학술", values: ["학술"] },
  { label: "예술/문화", values: ["예술", "문화", "공연", "예술/문화"] },
  { label: "스포츠", values: ["체육", "스포츠"] },
  { label: "봉사", values: ["봉사"] },
  { label: "소모임", values: ["취미", "소모임"] },
];

export default function MainPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventLoading, setIsEventLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventError, setEventError] = useState("");

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const data = await getClubs({
          page: 0,
          size: 100,
          hasActiveRecruitment: true,
        });

        setClubs(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "동아리 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadClubs();
  }, []);

  const selectedCategory = categories.find(({ label }) => label === activeCategory);
  const visibleClubs = clubs
    .filter(
      (club) =>
        !selectedCategory?.values.length || selectedCategory.values.includes(club.category)
    )
    .slice(0, 3);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getRecentEvents({
          size: 3,
        });

        setEvents(data);
      } catch (err) {
        setEventError(err instanceof Error ? err.message : "행사 목록을 불러오지 못했습니다.");
      } finally {
        setIsEventLoading(false);
      }
    };

    void loadEvents();
  }, []);

  return (
    <main className={styles.container}>
      <AppHeader />

      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <h2>분야별 보기</h2>
        </div>
        <div className={styles.categoryWrap}>
          {categories.map((category) => (
            <button
              key={category.label}
              type="button"
              className={activeCategory === category.label ? styles.activeCategory : ""}
              aria-pressed={activeCategory === category.label}
              onClick={() => setActiveCategory(category.label)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <h2>모집중인 동아리</h2>
          <button type="button" onClick={() => router.push("/clubs")}>
            전체보기
          </button>
        </div>

        {isLoading && <p className={styles.statusText}>동아리를 불러오는 중입니다.</p>}
        {error && <p className={styles.statusText}>{error}</p>}
        {!isLoading && !error && visibleClubs.length === 0 && (
          <p className={styles.statusText}>현재 표시할 동아리가 없습니다.</p>
        )}

        <div className={styles.cardList}>
          {visibleClubs.map((club) => (
            <ClubCard
              key={club.id}
              title={club.name}
              description={club.description}
              category={club.category}
              imageUrl={club.profileImg}
              recruitmentText={club.recruitmentDisplayText}
              activeRecruitment={club.activeRecruitment}
              onClick={() => router.push(`/clubs/${club.id}`)}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <h2>최근 활동 및 행사</h2>
          <button type="button" onClick={() => router.push("/events")}>
            전체보기
          </button>
        </div>

        {isEventLoading && <p className={styles.statusText}>행사를 불러오는 중입니다.</p>}
        {eventError && <p className={styles.statusText}>{eventError}</p>}
        {!isEventLoading && !eventError && events.length === 0 && (
          <p className={styles.statusText}>현재 표시할 행사가 없습니다.</p>
        )}

        <div className={styles.cardList}>
          {events.map((event) => (
            <article key={event.id} className={styles.eventCard}>
              <div className={styles.eventDate}>
                <span>{event.eventDate}</span>
              </div>
              <div className={styles.eventContent}>
                <p className={styles.eventClub}>{event.clubName}</p>
                <h3>{event.title}</h3>
                <p className={styles.eventDescription}>{event.description}</p>
                {event.location && <p className={styles.eventInfo}>{event.location}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
