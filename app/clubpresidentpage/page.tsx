"use client";

import { useEffect, useState } from "react";

import BottomNavigation from "../components/BottomNavigation";
import { apiFetch, apiRequest, ClubMember } from "../lib/api";
import styles from "./page.module.css";

const CLUB_ID = 1;

export default function ClubPresidentPage() {

  const [activeTab, setActiveTab] =
    useState<"member" | "applicant">(
      "member"
    );

  const [search, setSearch] =
    useState("");

  const [members, setMembers] =
    useState<ClubMember[]>([]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const query = new URLSearchParams({
          status: activeTab,
        });

        if (search.trim()) {
          query.set("keyword", search.trim());
        }

        const data = await apiFetch<ClubMember[]>(
          `/api/clubs/${CLUB_ID}/members?${query.toString()}`
        );

        setMembers(data);
      } catch (error) {
        console.warn("Failed to load club members:", error);
        setMembers([]);
      }
    };

    void loadMembers();
  }, [activeTab, search]);

  // 수락
  const handleAccept = async (id: number) => {
    try {
      await apiRequest<ClubMember>(
        `/api/clubs/${CLUB_ID}/members/${id}/accept`,
        { method: "PATCH" }
      );

      setMembers((prev) =>
        prev.filter((member) => member.id !== id)
      );
    } catch (error) {
      console.warn("Failed to accept applicant:", error);
    }
  };

  // 거절
  const handleReject = async (id: number) => {
    try {
      await apiRequest<void>(
        `/api/clubs/${CLUB_ID}/members/${id}`,
        { method: "DELETE" }
      );

      setMembers((prev) =>
        prev.filter(
          (member) => member.id !== id
        )
      );
    } catch (error) {
      console.warn("Failed to reject applicant:", error);
    }
  };

  const filteredMembers =
    members.filter((member) => {

      const matchTab =
        member.status === activeTab;

      const matchSearch =
        member.name.includes(search);

      return matchTab && matchSearch;
    });

  return (
    <main className={styles.container}>

      {/* 상단 */}
      <header className={styles.header}>

        <div className={styles.logoWrap}>

          <img
            src="/logo.png"
            alt="동네 로고"
            className={styles.logo}
          />

          <span className={styles.logoText}>
            동네(회장계정)
          </span>

        </div>

      </header>

      {/* 검색 */}
      <section className={styles.searchSection}>

        <div className={styles.searchBar}>

          <button className={styles.backButton}>
            ←
          </button>

          <input
            type="text"
            placeholder="사람 이름"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className={styles.searchInput}
          />

          <button className={styles.searchButton}>
            🔍
          </button>

        </div>

      </section>

      {/* 탭 */}
      <section className={styles.tabSection}>

        <button
          className={
            activeTab === "member"
              ? styles.activeTab
              : styles.tabButton
          }
          onClick={() =>
            setActiveTab("member")
          }
        >
          재원목록
        </button>

        <button
          className={
            activeTab === "applicant"
              ? styles.activeTab
              : styles.tabButton
          }
          onClick={() =>
            setActiveTab("applicant")
          }
        >
          신청인원목록
        </button>

      </section>

      {/* 회원 목록 */}
      <section className={styles.memberList}>

        {filteredMembers.map((member) => (

          <div
            key={member.id}
            className={styles.memberCard}
          >

            {/* 프로필 */}
            <div className={styles.profileImage}>

              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                />
              ) : (
                <div className={styles.emptyImage}>
                  ✕
                </div>
              )}

            </div>

            {/* 정보 */}
            <div className={styles.memberInfo}>

              <h3>{member.name}</h3>

              <p>{member.major}</p>

              <p>{member.email}</p>

              <p>{member.birth}</p>

              <p>{member.phone}</p>

            </div>

            {/* 신청목록 버튼 */}
            {activeTab === "applicant" && (

              <div className={styles.buttonWrap}>

                <button
                  className={styles.acceptButton}
                  onClick={() =>
                    handleAccept(member.id)
                  }
                >
                  수락
                </button>

                <button
                  className={styles.rejectButton}
                  onClick={() =>
                    handleReject(member.id)
                  }
                >
                  거절
                </button>

              </div>
            )}

          </div>
        ))}

      </section>

      <BottomNavigation />

    </main>
  );
}
