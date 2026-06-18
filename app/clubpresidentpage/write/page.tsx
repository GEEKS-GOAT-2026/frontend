"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BottomNav from "../../components/BottomNav";
import { getMyInfo } from "../../lib/api";

import styles from "./page.module.css";

type WriteOption = {
  type: "activity" | "event" | "notice";
  badge: string;
  title: string;
  description: string;
};

const writeOptions: WriteOption[] = [
  {
    type: "activity",
    badge: "기록",
    title: "활동기록 작성",
    description: "엠티, 공연, 세미나, 동아리 활동한 기록을 업로드합니다.",
  },
  {
    type: "event",
    badge: "행사",
    title: "행사글 작성",
    description: "행사 일정, 장소, 참여 방법을 포함한 모집/홍보 글을 작성합니다.",
  },
  {
    type: "notice",
    badge: "공지",
    title: "공지사항 작성",
    description: "재원들에게 전달할 중요 공지나 안내 문서를 작성합니다.",
  },
];

function getClubIdFromQuery(searchParams: URLSearchParams) {
  const rawClubId = searchParams.get("clubId");
  const clubId = rawClubId ? Number(rawClubId) : NaN;

  return Number.isFinite(clubId) ? clubId : null;
}

function ClubWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clubName, setClubName] = useState("회장 관리");

  useEffect(() => {
    const loadClubName = async () => {
      try {
        const user = await getMyInfo();
        const clubId = getClubIdFromQuery(searchParams);
        const targetClub =
          user.managedClubs?.find((club) => club.clubId === clubId) ??
          user.managedClubs?.[0];

        if (targetClub) {
          setClubName(`${targetClub.clubName} 회장 관리 모드`);
        }
      } catch {
        setClubName("회장 관리 모드");
      }
    };

    void loadClubName();
  }, [searchParams]);

  const handleSelect = (type: WriteOption["type"]) => {
    const clubId = getClubIdFromQuery(searchParams);

    if (type === "activity") {
      router.push(`/clubpresidentpage/write/activity?clubId=${clubId ?? ""}`);
      return;
    }

    if (type === "event") {
      router.push(`/clubpresidentpage/write/event?clubId=${clubId ?? ""}`);
      return;
    }

    if (type === "notice") {
      router.push(`/clubpresidentpage/write/notice?clubId=${clubId ?? ""}`);
      return;
    }

    alert("작성 폼은 준비 중입니다.");
  };

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
          <h1>글쓰기</h1>
          <p>{clubName}</p>
        </div>
      </header>

      <section className={styles.intro}>
        <strong>{clubName}</strong>
        <p>작성하려는 글의 종류를 먼저 선택하면 필요한 입력 항목을 안내합니다.</p>
      </section>

      <section className={styles.optionList} aria-label="글쓰기 종류 선택">
        {writeOptions.map((option) => (
          <article key={option.title} className={styles.optionCard}>
            <div className={styles.optionContent}>
              <span className={styles.badge}>{option.badge}</span>
              <h2>{option.title}</h2>
              <p>{option.description}</p>
            </div>
            <button
              type="button"
              className={styles.selectButton}
              onClick={() => handleSelect(option.type)}
            >
              선택
            </button>
          </article>
        ))}
      </section>

      <aside className={styles.tipBox}>
        <strong>TIP</strong>
        <p>게시 후에는 동아리 별 활동기록/행사/공지 목록에서 바로 확인합니다.</p>
      </aside>

      <BottomNav />
    </main>
  );
}

export default function ClubWritePage() {
  return (
    <Suspense fallback={null}>
      <ClubWriteContent />
    </Suspense>
  );
}
