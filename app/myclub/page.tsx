"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BottomNav from "../components/BottomNav";
import ClubCard from "../components/ClubCard";
import SearchHeader from "../components/SearchHeader";
import { Club, getClub, getJoinedClubs, getMyInfo } from "../lib/api";

import styles from "./page.module.css";

function getClubTags(club: Club) {
  return [club.category, club.recruitmentDisplayText]
    .filter(Boolean)
    .map((tag) => `#${tag}`);
}

async function getMyClubsForView() {
  const [joinedResult, userResult] = await Promise.allSettled([
    getJoinedClubs(),
    getMyInfo(),
  ]);

  if (joinedResult.status === "rejected" && userResult.status === "rejected") {
    throw joinedResult.reason;
  }

  const clubMap = new Map<number, Club>();
  const joinedClubs = joinedResult.status === "fulfilled" ? joinedResult.value : [];
  const managedClubs =
    userResult.status === "fulfilled" ? userResult.value.managedClubs ?? [] : [];

  joinedClubs.forEach((club) => {
    clubMap.set(club.id, club);
  });

  const missingManagedClubIds = managedClubs
    .map((club) => club.clubId)
    .filter((clubId) => !clubMap.has(clubId));

  const managedClubDetails = await Promise.allSettled(
    missingManagedClubIds.map((clubId) => getClub(clubId))
  );

  managedClubDetails.forEach((result) => {
    if (result.status === "fulfilled") {
      clubMap.set(result.value.id, result.value);
    }
  });

  return Array.from(clubMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name, "ko")
  );
}

export default function MyClubPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMyClubs = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getMyClubsForView();
        setClubs(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "가입한 동아리 목록을 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadMyClubs();
  }, []);

  const filteredClubs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return clubs;
    }

    return clubs.filter((club) =>
      [club.name, club.description, club.category, club.recruitmentDisplayText]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword)
    );
  }, [clubs, keyword]);

  return (
    <main className={styles.container}>
      <SearchHeader
        placeholder="가입한 동아리를 검색하세요"
        value={keyword}
        onChange={setKeyword}
      />

      {error && <p className={styles.statusText}>{error}</p>}
      {!isLoading && !error && filteredClubs.length === 0 && (
        <p className={styles.statusText}>
          {keyword ? "검색 결과가 없습니다." : "가입한 동아리가 없습니다."}
        </p>
      )}

      <section className={styles.clubList} aria-label="내 동아리 목록">
        {filteredClubs.map((club) => (
          <ClubCard
            key={club.id}
            title={club.name}
            description={club.description}
            imageUrl={club.profileImg}
            tags={getClubTags(club)}
            showJoinButton={false}
            onClick={() => router.push(`/clubs/${club.id}`)}
          />
        ))}
      </section>

      {isLoading && <p className={styles.statusText}>동아리를 불러오는 중입니다.</p>}

      <BottomNav />
    </main>
  );
}
