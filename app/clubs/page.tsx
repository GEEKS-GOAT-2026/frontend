"use client";

import { useCallback, useEffect, useState } from "react";
import BottomNavigation from "../components/BottomNavigation";
import { apiFetch, Club, ClubPage } from "../lib/api";
import styles from "./page.module.css";

export default function ClubsPage() {

  const [clubs, setClubs] = useState<Club[]>([]);
  const [category] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("category") ?? "";
  });
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [recruitmentFilter, setRecruitmentFilter] =
    useState<"all" | "open" | "closed">("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const categories = [
    { label: "전체", value: "" },
    { label: "학술", value: "학술" },
    { label: "예술", value: "예술" },
    { label: "문화", value: "문화" },
    { label: "체육", value: "체육" },
    { label: "봉사", value: "봉사" },
    { label: "IT/개발", value: "IT/개발" },
  ];

  const loadClubs = useCallback(async (nextPage: number, reset = false) => {
    if (loading || (!hasNext && !reset)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        page: String(nextPage),
        size: "10",
      });

      if (keyword.trim()) {
        query.set("keyword", keyword.trim());
      }

      if (selectedCategory) {
        query.set("category", selectedCategory);
      }

      if (recruitmentFilter !== "all") {
        query.set(
          "hasActiveRecruitment",
          recruitmentFilter === "open" ? "true" : "false"
        );
      }

      const clubPage = await apiFetch<ClubPage>(`/api/clubs?${query.toString()}`);

      setClubs((prev) =>
        reset ? clubPage.content : [...prev, ...clubPage.content]
      );
      setPage(clubPage.page + 1);
      setHasNext(clubPage.hasNext);
    } catch (error) {
      console.warn("Failed to load clubs:", error);
      setError("동아리 목록을 불러오지 못했습니다. 로그인 상태와 백엔드 실행 상태를 확인해주세요.");
      setClubs((prev) => (reset ? [] : prev));
    } finally {
      setLoading(false);
    }
  }, [hasNext, keyword, loading, recruitmentFilter, selectedCategory]);

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
        void loadClubs(page);
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

  }, [loadClubs, page]);

  const handleSearch = () => {
    setPage(0);
    setHasNext(true);
    void loadClubs(0, true);
  };

  const handleCategoryFilter = (nextCategory: string) => {
    setSelectedCategory(nextCategory);
    setPage(0);
    setHasNext(true);
  };

  const handleRecruitmentFilter = (nextFilter: "all" | "open" | "closed") => {
    setRecruitmentFilter(nextFilter);
    setPage(0);
    setHasNext(true);
  };

  useEffect(() => {
    // Initial/filter data is intentionally loaded from the backend API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadClubs(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, recruitmentFilter]);

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
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className={styles.searchInput}
          />

          <button className={styles.searchButton} onClick={handleSearch}>
            🔍
          </button>

        </div>

      </header>

      <section className={styles.filterSection}>
        <div className={styles.filterWrap}>
          {categories.map((item) => (
            <button
              key={item.label}
              className={
                selectedCategory === item.value
                  ? styles.activeFilter
                  : styles.filterButton
              }
              onClick={() => handleCategoryFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.filterWrap}>
          <button
            className={
              recruitmentFilter === "all"
                ? styles.activeFilter
                : styles.filterButton
            }
            onClick={() => handleRecruitmentFilter("all")}
          >
            전체
          </button>

          <button
            className={
              recruitmentFilter === "open"
                ? styles.activeFilter
                : styles.filterButton
            }
            onClick={() => handleRecruitmentFilter("open")}
          >
            가입가능
          </button>

          <button
            className={
              recruitmentFilter === "closed"
                ? styles.activeFilter
                : styles.filterButton
            }
            onClick={() => handleRecruitmentFilter("closed")}
          >
            모집마감
          </button>
        </div>
      </section>

      {/* 동아리 목록 */}
      <section className={styles.clubList}>

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
          <p className={styles.emptyText}>동아리 목록을 불러오는 중입니다.</p>
        )}

        {error && !loading && (
          <p className={styles.emptyText}>{error}</p>
        )}

        {clubs.length === 0 && !loading && !error && (
          <p className={styles.emptyText}>조건에 맞는 동아리가 없습니다.</p>
        )}

      </section>

      <BottomNavigation />

    </main>
  );
}
