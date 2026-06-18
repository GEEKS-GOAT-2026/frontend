"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BottomNav from "../components/BottomNav";
import ClubCard from "../components/ClubCard";
import SearchHeader from "../components/SearchHeader";
import { Club, getJoinedClubs } from "../lib/api";

import styles from "./page.module.css";

function getClubTags(club: Club) {
  return [club.category, club.recruitmentDisplayText]
    .filter(Boolean)
    .map((tag) => `#${tag}`);
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
        const data = await getJoinedClubs();
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
