"use client";

import { useEffect, useMemo, useState } from "react";

import BottomNav from "../../components/BottomNav";
import {
  Club,
  ManagedClub,
  getJoinedClubs,
  getMyInfo,
  leaveMyClub,
  transferPresident,
} from "../../lib/api";

import styles from "./page.module.css";

type ManagedClubItem = {
  id: number;
  name: string;
  description: string;
  role: "president" | "member";
};

function isPresidentRole(role: string) {
  const normalizedRole = role.toUpperCase();

  return (
    normalizedRole.includes("PRESIDENT") ||
    normalizedRole.includes("CHAIR") ||
    role.includes("회장")
  );
}

function buildManagementItems(
  joinedClubs: Club[],
  managedClubs: ManagedClub[]
): ManagedClubItem[] {
  const clubMap = new Map<number, ManagedClubItem>();

  joinedClubs.forEach((club) => {
    clubMap.set(club.id, {
      id: club.id,
      name: club.name,
      description: club.description || "가입한 동아리입니다.",
      role: "member",
    });
  });

  managedClubs.forEach((club) => {
    const currentClub = clubMap.get(club.clubId);
    const role = isPresidentRole(club.role) ? "president" : "member";

    clubMap.set(club.clubId, {
      id: club.clubId,
      name: club.clubName,
      description:
        currentClub?.description ||
        (role === "president"
          ? "회장 권한을 보유한 동아리입니다."
          : "운영 권한을 보유한 동아리입니다."),
      role,
    });
  });

  return Array.from(clubMap.values()).sort((first, second) => {
    if (first.role !== second.role) {
      return first.role === "president" ? -1 : 1;
    }

    return first.name.localeCompare(second.name, "ko");
  });
}

async function fetchMyClubManagementData() {
  const [joinedResult, userResult] = await Promise.allSettled([
    getJoinedClubs(),
    getMyInfo(),
  ]);

  if (joinedResult.status === "rejected" && userResult.status === "rejected") {
    throw joinedResult.reason;
  }

  if (userResult.status === "rejected") {
    console.warn("Failed to load managed clubs", userResult.reason);
  }

  return {
    joinedClubs: joinedResult.status === "fulfilled" ? joinedResult.value : [],
    managedClubs:
      userResult.status === "fulfilled" ? userResult.value.managedClubs ?? [] : [],
  };
}

export default function MyClubManagePage() {
  const [joinedClubs, setJoinedClubs] = useState<Club[]>([]);
  const [managedClubs, setManagedClubs] = useState<ManagedClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingClubId, setProcessingClubId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClubs = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await fetchMyClubManagementData();
        setJoinedClubs(data.joinedClubs);
        setManagedClubs(data.managedClubs);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "동아리 관리 정보를 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadClubs();
  }, []);

  const clubs = useMemo(
    () => buildManagementItems(joinedClubs, managedClubs),
    [joinedClubs, managedClubs]
  );

  const handleTransfer = async (club: ManagedClubItem) => {
    const targetEmail = window.prompt(
      `${club.name} 회장 권한을 넘겨받을 회원의 이메일을 입력하세요.`
    );

    if (!targetEmail?.trim()) {
      return;
    }

    try {
      setProcessingClubId(club.id);
      await transferPresident(club.id, targetEmail.trim());
      alert("회장 계정 양도가 완료되었습니다.");
      const data = await fetchMyClubManagementData();
      setJoinedClubs(data.joinedClubs);
      setManagedClubs(data.managedClubs);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "회장 계정 양도에 실패했습니다."
      );
    } finally {
      setProcessingClubId(null);
    }
  };

  const handleLeave = async (club: ManagedClubItem) => {
    const confirmed = window.confirm(`${club.name}에서 탈퇴하시겠습니까?`);

    if (!confirmed) {
      return;
    }

    try {
      setProcessingClubId(club.id);
      await leaveMyClub(club.id);
      localStorage.removeItem(`pendingApplication:${club.id}`);

      const data = await fetchMyClubManagementData();
      setJoinedClubs(data.joinedClubs);
      setManagedClubs(data.managedClubs);

      alert("동아리 탈퇴가 완료되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "동아리 탈퇴에 실패했습니다.");
    } finally {
      setProcessingClubId(null);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>나의 동아리 관리</h1>
      <p className={styles.subtitle}>가입 동아리를 확인하고 관리하세요.</p>

      {isLoading && <p className={styles.statusText}>동아리 정보를 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && clubs.length === 0 && (
        <p className={styles.statusText}>관리할 동아리가 없습니다.</p>
      )}

      {!isLoading && !error && clubs.length > 0 && (
        <section className={styles.list} aria-label="내 동아리 관리 목록">
          {clubs.map((club) => {
            const isPresident = club.role === "president";

            return (
              <article key={club.id} className={styles.card}>
                <span
                  className={`${styles.badge} ${
                    isPresident ? styles.presidentBadge : styles.memberBadge
                  }`}
                >
                  {isPresident ? "회장" : "회원"}
                </span>
                <h2>{club.name}</h2>
                <p>
                  {isPresident
                    ? "역할: 회장 · 회장 계정은 양도 후 탈퇴할 수 있습니다."
                    : "역할: 일반 회원 · 탈퇴하기를 누르면 회원 권한으로 이동합니다."}
                </p>
                <small>{club.description}</small>
                <button
                  type="button"
                  className={`${styles.actionButton} ${
                    isPresident ? styles.transferButton : styles.leaveButton
                  }`}
                  disabled={processingClubId === club.id}
                  onClick={() =>
                    isPresident ? handleTransfer(club) : handleLeave(club)
                  }
                >
                  {processingClubId === club.id
                    ? "처리 중"
                    : isPresident
                      ? "회장 계정 양도"
                      : "탈퇴하기"}
                </button>
              </article>
            );
          })}
        </section>
      )}

      <BottomNav />
    </main>
  );
}
