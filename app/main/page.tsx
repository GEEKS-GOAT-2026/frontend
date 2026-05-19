"use client";

import { useRouter } from "next/navigation";

import styles from "./page.module.css";

export default function MainPage() {

  const router = useRouter();

  const clubs = [1, 2, 3];

  const events = [1, 2, 3];

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
          <button>전체</button>
          <button>학술</button>
          <button>예술, 문화</button>
          <button>스포츠</button>
          <button>봉사</button>
          <button>소모임</button>
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
              key={event}
              className={styles.eventCard}
            >

              <div className={styles.eventImage} />

              <div className={styles.eventContent}>

                <p className={styles.eventClub}>
                  동아리 이름
                </p>

                <h3>행사이름</h3>

                <div className={styles.eventInfo}>
                  <span>행사요일</span>
                  <span>행사장소</span>
                </div>

              </div>

              <div className={styles.arrow}>
                ›
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNav}>

        <div
          className={styles.navItem}
          onClick={() => router.push("/main")}
        >
          <img src="/main.svg" />
          <p>home</p>
        </div>

        <div
          className={styles.navItem}
          onClick={() => router.push("/clubs")}
        >
          <img src="/clubs.svg" />
          <p>clubs</p>
        </div>

        <div
          className={styles.navItem}
          onClick={() => router.push("/events")}
        >
          <img src="/events.svg" />
          <p>events</p>
        </div>

        <div
          className={styles.navItem}
          onClick={() => router.push("/apply")}
        >
          <img src="/apply.svg" />
          <p>apply</p>
        </div>

        <div
          className={styles.navItem}
          onClick={() => router.push("/mypage")}
        >
          <img src="/mypage.svg" />
          <p>mypage</p>
        </div>

      </nav>

    </main>
  );
}