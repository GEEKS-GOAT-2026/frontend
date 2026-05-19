"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import BottomNavigation from "../components/BottomNavigation";
import { apiFetch, Club, ClubEvent, ClubPage } from "../lib/api";
import styles from "./page.module.css";

export default function MainPage() {

  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [clubsError, setClubsError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const categories = [
    { label: "전체", value: "" },
    { label: "학술", value: "학술" },
    { label: "예술, 문화", value: "문화" },
    { label: "스포츠", value: "체육" },
    { label: "봉사", value: "봉사" },
    { label: "소모임", value: "취미" },
  ];

  useEffect(() => {
    const loadMainData = async () => {
      setLoading(true);
      setClubsError("");
      setEventsError("");

      try {
        const clubPage = await apiFetch<ClubPage>(
          "/api/clubs?page=0&size=3&hasActiveRecruitment=true"
        );
        setClubs(clubPage.content);
      } catch (error) {
        console.warn("Failed to load main clubs:", error);
        setClubsError("모집중인 동아리를 불러오지 못했습니다. 로그인 상태와 백엔드 실행 상태를 확인해주세요.");
      }

      try {
        const recentEvents = await apiFetch<ClubEvent[]>("/api/events/recent?size=3");
        setEvents(recentEvents);
      } catch (error) {
        console.warn("Failed to load recent events:", error);
        setEventsError("최근 활동 및 행사를 불러오지 못했습니다. 백엔드에 행사 API가 반영됐는지 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    void loadMainData();
  }, []);

  return (
    <main className={styles.container}>

      {/* 상단 헤더 */}
      <header className={styles.header}>

        <div className={styles.logoWrap}>
          <img
            src="/logo.png"
            alt="동네 로고"
            className={styles.logo}
          />

          <span className={styles.logoText}>
            동네
          </span>
        </div>

      </header>

      {/* 분야별 보기 */}
      <section className={styles.section}>

        <div className={styles.sectionTop}>
          <h2>분야별 보기</h2>
        </div>

        <div className={styles.categoryWrap}>
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() =>
                router.push(
                  category.value
                    ? `/clubs?category=${encodeURIComponent(category.value)}`
                    : "/clubs"
                )
              }
            >
              {category.label}
            </button>
          ))}
        </div>

      </section>

      {/* 모집중인 동아리 */}
      <section className={styles.section}>

        <div className={styles.sectionTop}>
          <h2>모집중인 동아리</h2>

          <button
            onClick={() => router.push("/clubs")}
          >
            전체보기 →
          </button>
        </div>

        <div className={styles.cardList}>

          {clubs.map((club) => (
            <div
              key={club.id}
              className={styles.clubCard}
            >

              <div className={styles.clubImage}>
                {club.profileImg && (
                  <img src={club.profileImg} alt={club.name} />
                )}
              </div>

              <div className={styles.clubContent}>

                <div className={styles.clubHeader}>

                  <h3>{club.name}</h3>

                  <button className={styles.joinButton}>
                    {club.activeRecruitment
                      ? club.recruitmentDisplayText ?? "가입가능"
                      : "모집마감"}
                  </button>

                </div>

                <div className={styles.tagWrap}>
                  {club.category && <span>#{club.category}</span>}
                  {club.description && <span>{club.description}</span>}
                </div>

              </div>

            </div>
          ))}

          {loading && clubs.length === 0 && (
            <p className={styles.emptyText}>모집중인 동아리를 불러오는 중입니다.</p>
          )}

          {!loading && clubsError && clubs.length === 0 && (
            <p className={styles.emptyText}>{clubsError}</p>
          )}

          {!loading && !clubsError && clubs.length === 0 && (
            <p className={styles.emptyText}>모집중인 동아리가 없습니다.</p>
          )}

        </div>

      </section>

      {/* 최근 활동 및 행사 */}
      <section className={styles.section}>

        <div className={styles.sectionTop}>
          <h2>최근 활동 및 행사</h2>

          <button
            onClick={() => router.push("/events")}
          >
            전체보기 →
          </button>
        </div>

        <div className={styles.cardList}>

          {events.map((event) => (
            <div
              key={event.id}
              className={styles.eventCard}
            >

              <div className={styles.eventImage}>
                {event.imageUrl && (
                  <img src={event.imageUrl} alt={event.title} />
                )}
              </div>

              <div className={styles.eventContent}>

                <p className={styles.eventClub}>
                  {event.clubName}
                </p>

                <h3>{event.title}</h3>

                <div className={styles.eventInfo}>
                  <span>{event.eventDate}</span>
                  {event.location && <span>{event.location}</span>}
                </div>

              </div>

              <div className={styles.arrow}>
                ›
              </div>

            </div>
          ))}

          {loading && events.length === 0 && (
            <p className={styles.emptyText}>최근 활동 및 행사를 불러오는 중입니다.</p>
          )}

          {!loading && eventsError && events.length === 0 && (
            <p className={styles.emptyText}>{eventsError}</p>
          )}

          {!loading && !eventsError && events.length === 0 && (
            <p className={styles.emptyText}>최근 활동 및 행사가 없습니다.</p>
          )}

        </div>

      </section>

      <BottomNavigation />

    </main>
  );
}
