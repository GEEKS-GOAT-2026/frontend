"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import styles from "./page.module.css";

type Member = {
  id: number;

  name: string;

  major: string;

  email: string;

  birth: string;

  phone: string;

  image: string;

  status: "member" | "applicant";
};

export default function ClubPresidentPage() {

  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<"member" | "applicant">(
      "member"
    );

  const [search, setSearch] =
    useState("");

  const [members, setMembers] =
    useState<Member[]>([
      {
        id: 1,
        name: "강민규",
        major: "컴퓨터공학과 24학번",
        email: "asd@gmail.com",
        birth: "2001-12-12",
        phone: "010-1234-5678",
        image: "/logo.png",
        status: "member",
      },

      {
        id: 2,
        name: "홍길동",
        major: "컴퓨터공학과 24학번",
        email: "asdasd@gmail.com",
        birth: "2001-12-12",
        phone: "010-1234-5678",
        image: "",
        status: "applicant",
      },

      {
        id: 3,
        name: "아이유",
        major: "컴퓨터공학과 23학번",
        email: "aaa@gmail.com",
        birth: "2001-12-12",
        phone: "010-1234-5678",
        image: "",
        status: "applicant",
      },

      {
        id: 4,
        name: "이찬혁",
        major: "컴퓨터공학과 25학번",
        email: "bbb@gmail.com",
        birth: "2001-12-12",
        phone: "010-1234-5678",
        image: "",
        status: "member",
      },
    ]);

  // 수락
  const handleAccept = (id: number) => {

    setMembers((prev) =>
      prev.map((member) =>

        member.id === id
          ? {
              ...member,
              status: "member",
            }
          : member
      )
    );
  };

  // 거절
  const handleReject = (id: number) => {

    setMembers((prev) =>
      prev.filter(
        (member) => member.id !== id
      )
    );
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