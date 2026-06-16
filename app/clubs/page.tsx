"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BottomNav from "../components/BottomNav";
import ClubCard from "../components/ClubCard";
import SearchHeader from "../components/SearchHeader";
import { Club, getClubs } from "../lib/api";

import styles from "./page.module.css";

const PAGE_SIZE = 20;

const categories = [
  { label: "전체", value: "" },
  { label: "IT/개발", value: "IT/개발" },
  { label: "공연", value: "공연" },
  { label: "체육", value: "체육" },
  { label: "문화", value: "문화" },
  { label: "예술", value: "예술" },
  { label: "봉사", value: "봉사" },
  { label: "취미", value: "취미" },
];

export default function ClubsPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadClubs = useCallback(
    async (nextPage: number, reset = false) => {
      if (isLoading || (!hasNext && !reset)) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await getClubs({
          page: nextPage,
          size: PAGE_SIZE,
          keyword,
          category,
          hasActiveRecruitment: onlyRecruiting ? true : undefined,
        });

        setClubs((prev) => (reset ? data.content : [...prev, ...data.content]));
        setPage(data.page + 1);
        setHasNext(data.hasNext);
      } catch (err) {
        setError(err instanceof Error ? err.message : "동아리 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [category, hasNext, isLoading, keyword, onlyRecruiting]
  );

  useEffect(() => {
    const loadFirstPage = async () => {
      setIsLoading(true);
      setError("");
      setClubs([]);
      setPage(0);
      setHasNext(true);

      try {
        const data = await getClubs({
          page: 0,
          size: PAGE_SIZE,
          keyword,
          category,
          hasActiveRecruitment: onlyRecruiting ? true : undefined,
        });

        setClubs(data.content);
        setPage(data.page + 1);
        setHasNext(data.hasNext);
      } catch (err) {
        setError(err instanceof Error ? err.message : "동아리 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadFirstPage();
  }, [category, keyword, onlyRecruiting]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - 200) {
        void loadClubs(page);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadClubs, page]);

  return (
    <main className={styles.container}>
      <SearchHeader
        placeholder="동아리 이름을 검색하세요"
        value={keyword}
        onChange={setKeyword}
      />

      <section className={styles.filterSection} aria-label="동아리 필터">
        <div className={styles.categoryWrap}>
          {categories.map((item) => (
            <button
              key={item.label}
              type="button"
              className={category === item.value ? styles.activeChip : ""}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className={styles.recruitingToggle}>
          <input
            type="checkbox"
            checked={onlyRecruiting}
            onChange={(event) => setOnlyRecruiting(event.target.checked)}
          />
          모집중인 동아리만 보기
        </label>
      </section>

      {error && <p className={styles.statusText}>{error}</p>}
      {!isLoading && !error && clubs.length === 0 && (
        <p className={styles.statusText}>검색 결과가 없습니다.</p>
      )}

      <section className={styles.clubList}>
        {clubs.map((club) => (
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
      </section>

      {isLoading && <p className={styles.statusText}>동아리를 불러오는 중입니다.</p>}

      <BottomNav />
    </main>
  );
}
