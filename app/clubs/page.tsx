"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import styles from "./page.module.css";

export default function ClubsPage() {

  const router = useRouter();

  const [clubs, setClubs] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  // 더미 데이터 추가
  const loadMoreClubs = () => {

    const newClubs = Array.from(
      { length: 6 },
      (_, index) => index + page * 10
    );

    setClubs((prev) => [...prev, ...newClubs]);

    setPage((prev) => prev + 1);
  };

  // 첫 로딩
  useEffect(() => {
    loadMoreClubs();
  }, []);

  // 무한 스크롤
  useEffect(() => {

    const handleScroll = () => {

      const scrollTop =
        window.scrollY;

      const windowHeight =
        window.innerHeight;

      const fullHeight =
        document.documentElement.scrollHeight;

      // 바닥 근처 도달 시
      if (
        scrollTop + windowHeight >=
        fullHeight - 200
      ) {
        loadMoreClubs();
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };

  }, [page]);

  return (
    <main className={styles.container}>

      {/* 상단 */}
      <header className={styles.header}>

        <div className={styles.topBar}>

          {/* 동네 로고 */}
          <img
            src="/logo.png"
            alt="동네 로고"
            className={styles.logo}
          />

          <input
            type="text"
            placeholder="동아리"
            className={styles.searchInput}
          />

          <button className={styles.searchButton}>
            🔍
          </button>

        </div>

      </header>

      {/* 동아리 목록 */}
      <section className={styles.clubList}>

        {clubs.map((club) => (
          <div
            key={club}
            className={styles.clubCard}
          >

            <div className={styles.clubImage} />

            <div className={styles.clubContent}>

              <div className={styles.clubHeader}>

                <h3>동아리 이름</h3>

                <button className={styles.joinButton}>
                  가입가능
                </button>

              </div>

              <div className={styles.tagWrap}>
                <span>#code</span>
                <span>#project</span>
                <span>#community</span>
                <span>#activity</span>
              </div>

            </div>

          </div>
        ))}

      </section>

      {/* 하단 네비 */}
      <nav className={styles.bottomNav}>

        <div
          className={styles.navItem}
          onClick={() => router.push("/main")}
        >
          <span>🏠</span>
          <p>home</p>
        </div>

        <div
          className={styles.navItem}
          onClick={() => router.push("/clubs")}
        >
          <span>🔍</span>
          <p>clubs</p>
        </div>

        <div
          className={styles.navItem}
          onClick={() => router.push("/events")}
        >
          <span>📅</span>
          <p>events</p>
        </div>

        <div
          className={styles.navItem}
          onClick={() => router.push("/apply")}
        >
          <span>✅</span>
          <p>apply</p>
        </div>

        <div
          className={styles.navItem}
          onClick={() => router.push("/mypage")}
        >
          <span>👤</span>
          <p>mypage</p>
        </div>

      </nav>

    </main>
  );
}