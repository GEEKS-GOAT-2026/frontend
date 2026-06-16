"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BottomNav from "../../components/BottomNav";
import { ClubDetail, getClub, getJoinedClubs } from "../../lib/api";

import styles from "./page.module.css";

function getRecruitmentPeriod(club: ClubDetail, recruitmentId: number) {
  const recruitment = club.recruitments.find((item) => item.id === recruitmentId);

  if (!recruitment) {
    return "";
  }

  if (recruitment.alwaysOpen) {
    return "상시모집";
  }

  if (recruitment.startDate && recruitment.endDate) {
    return `${recruitment.startDate} ~ ${recruitment.endDate}`;
  }

  return recruitment.active ? "모집중" : "모집마감";
}

function getClubTags(club: ClubDetail) {
  const activeRecruitment = club.recruitments.find((recruitment) => recruitment.active);

  return [
    club.category,
    activeRecruitment ? getRecruitmentPeriod(club, activeRecruitment.id) : club.recruitmentDisplayText,
    activeRecruitment?.title,
  ].filter(Boolean);
}

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams<{ clubId: string }>();
  const clubId = Number(params.clubId);
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const activeRecruitment = useMemo(
    () => club?.recruitments.find((recruitment) => recruitment.active) ?? null,
    [club]
  );

  useEffect(() => {
    const loadClub = async () => {
      if (!Number.isFinite(clubId)) {
        setError("동아리 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const [clubResult, joinedResult] = await Promise.allSettled([
          getClub(clubId),
          getJoinedClubs(),
        ]);

        if (clubResult.status === "rejected") {
          throw clubResult.reason;
        }

        setClub(clubResult.value);
        setIsJoined(
          joinedResult.status === "fulfilled" &&
            joinedResult.value.some((joinedClub) => joinedClub.id === clubId)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "동아리 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadClub();
  }, [clubId]);

  const handleJoinClick = () => {
    if (!activeRecruitment) {
      return;
    }

    alert("지원서 작성 화면은 준비 중입니다.");
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.logoButton} onClick={() => router.back()}>
          <img src="/logo.png" alt="dongne logo" />
        </button>
        <div>
          <h1>동네(동아리 상세)</h1>
          <p>나에게 맞는 동아리를 찾아보세요.</p>
        </div>
      </header>

      {isLoading && <p className={styles.statusText}>동아리 정보를 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && club && (
        <>
          <section className={styles.summaryCard}>
            <div className={styles.clubImage}>
              {club.profileImg && <img src={club.profileImg} alt={`${club.name} 로고`} />}
            </div>

            <div className={styles.summaryContent}>
              <div className={styles.titleRow}>
                <h2>{club.name}</h2>
                {!isJoined && (
                  <span className={activeRecruitment ? styles.openBadge : styles.closedBadge}>
                    {activeRecruitment ? "가입가능" : "모집마감"}
                  </span>
                )}
              </div>

              <div className={styles.tagWrap}>
                {getClubTags(club).map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.introSection}>
            <div className={styles.sectionTop}>
              <h2>동아리 소개</h2>
              <button type="button">더보기→</button>
            </div>
            <div className={`${styles.introCard} ${isJoined ? styles.joinedIntroCard : ""}`}>
              <p>{club.activityDescription || club.description || "아직 등록된 동아리 소개가 없습니다."}</p>
            </div>
          </section>

          <section className={styles.quickMenu} aria-label="동아리 상세 메뉴">
            <button
              type="button"
              className={styles.quickCard}
              onClick={() => router.push(`/clubs/${club.id}/activities`)}
            >
              <span className={styles.iconBox}>↺</span>
              <strong>활동기록</strong>
            </button>
            <button
              type="button"
              className={styles.quickCard}
              onClick={() =>
                router.push(
                  `/events?clubId=${club.id}&clubName=${encodeURIComponent(club.name)}`
                )
              }
            >
              <span className={styles.iconBox}>▣</span>
              <strong>행사</strong>
            </button>
            <button
              type="button"
              className={styles.quickCard}
              onClick={() => router.push(`/clubs/${club.id}/notices`)}
            >
              <span className={styles.iconBox}>!</span>
              <strong>공지</strong>
            </button>
          </section>

          {!isJoined && (
            <button
              type="button"
              className={styles.joinButton}
              disabled={!activeRecruitment}
              onClick={handleJoinClick}
            >
              {activeRecruitment ? "가입하기" : "현재 모집중이 아닙니다"}
            </button>
          )}
        </>
      )}

      <BottomNav />
    </main>
  );
}
