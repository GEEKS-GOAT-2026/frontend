"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BottomNav from "../../components/BottomNav";
import {
  ApplicationResponse,
  ClubDetail,
  getClub,
  getJoinedClubs,
  getMyApplications,
  getMyInfo,
} from "../../lib/api";

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

function hasPendingApplication(applications: ApplicationResponse[], clubId: number) {
  return applications.some(
    (application) => {
      if (application.clubId !== clubId) {
        return false;
      }

      const status = application.status.toLowerCase();
      const completedStatuses = [
        "accepted",
        "approved",
        "approve",
        "member",
        "rejected",
        "reject",
        "cancelled",
        "canceled",
        "left",
      ];

      if (completedStatuses.some((completedStatus) => status.includes(completedStatus))) {
        return false;
      }

      return ["pending", "waiting", "wait", "applied", "submitted", "review"].some(
        (pendingStatus) => status.includes(pendingStatus)
      );
    }
  );
}

function hasLocalPendingApplication(clubId: number) {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(`pendingApplication:${clubId}`) === "true";
}

function isManagedClub(
  managedClubs: { clubId: number; role: string }[] | undefined,
  clubId: number
) {
  return (
    managedClubs?.some(
      (club) =>
        club.clubId === clubId &&
        (club.role.toUpperCase().includes("PRESIDENT") || club.role.includes("회장"))
    ) ?? false
  );
}

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams<{ clubId: string }>();
  const clubId = Number(params.clubId);
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isApplicationPending, setIsApplicationPending] = useState(false);
  const [isClubPresident, setIsClubPresident] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
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
        const [clubResult, myClubResult, applicationResult, userResult] = await Promise.allSettled([
          getClub(clubId),
          getJoinedClubs(),
          getMyApplications(),
          getMyInfo(),
        ]);

        if (clubResult.status === "rejected") {
          throw clubResult.reason;
        }

        const joined =
          myClubResult.status === "fulfilled" &&
          myClubResult.value.some((myClub) => myClub.id === clubId);
        const applicationPending =
          applicationResult.status === "fulfilled"
            ? hasPendingApplication(applicationResult.value, clubId)
            : hasLocalPendingApplication(clubId);

        if (
          typeof window !== "undefined" &&
          (joined || (applicationResult.status === "fulfilled" && !applicationPending))
        ) {
          localStorage.removeItem(`pendingApplication:${clubId}`);
        }

        setClub(clubResult.value);
        setIsJoined(joined);
        setIsApplicationPending(!joined && applicationPending);
        setIsClubPresident(
          userResult.status === "fulfilled" &&
            isManagedClub(userResult.value.managedClubs, clubId)
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

    router.push(`/clubs/${clubId}/apply`);
  };

  const handleManageClick = () => {
    setIsManageModalOpen(true);
  };

  const handleMemberManageClick = () => {
    router.push(`/clubpresidentpage?clubId=${clubId}`);
  };

  const handleWriteClick = () => {
    router.push(`/clubpresidentpage/write?clubId=${clubId}`);
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
            <div className={`${styles.introCard} ${isJoined ? styles.myClubIntroCard : ""}`}>
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

          {isClubPresident ? (
            <button
              type="button"
              className={`${styles.joinButton} ${styles.manageButton}`}
              onClick={handleManageClick}
            >
              동아리 관리
            </button>
          ) : !isJoined ? (
            <button
              type="button"
              className={styles.joinButton}
              disabled={!activeRecruitment || isApplicationPending}
              onClick={handleJoinClick}
            >
              {isApplicationPending
                ? "가입신청 대기중"
                : activeRecruitment
                  ? "가입하기"
                  : "현재 모집중이 아닙니다"}
            </button>
          ) : null}
        </>
      )}

      {isManageModalOpen && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => setIsManageModalOpen(false)}
        >
          <section
            className={styles.manageModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="manage-modal-title">동아리 관리</h2>
            <p>관리할 메뉴를 선택하세요.</p>

            <div className={styles.manageModalActions}>
              <button type="button" onClick={handleMemberManageClick}>
                인원관리
              </button>
              <button type="button" onClick={handleWriteClick}>
                글쓰기
              </button>
            </div>

            <button
              type="button"
              className={styles.closeModalButton}
              onClick={() => setIsManageModalOpen(false)}
            >
              닫기
            </button>
          </section>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
