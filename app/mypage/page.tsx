"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BottomNav from "../components/BottomNav";
import { User, clearAuthToken, getMyInfo } from "../lib/api";

import styles from "./page.module.css";

type MenuItem = {
  title: string;
  description: string;
  danger?: boolean;
  onClick: () => void;
};

function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMyPage = async () => {
      try {
        setIsLoading(true);
        setError("");

        const userInfo = await getMyInfo();
        setUser(userInfo);
      } catch (err) {
        const storedUser = getStoredUser();

        if (storedUser) {
          setUser(storedUser);
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "마이페이지 정보를 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadMyPage();
  }, []);

  const userName = user?.name || "내 계정";
  const userEmail = user?.email || "로그인 정보를 확인하세요";

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    router.replace("/login");
  };

  const menuItems: MenuItem[] = [
    {
      title: "나의 동아리 관리",
      description: "내 동아리 관리/탈퇴/권한 확인",
      onClick: () => router.push("/myclub/manage"),
    },
    {
      title: "동아리 등록",
      description: "새 동아리 등록 신청",
      onClick: () => alert("동아리 등록 기능은 준비 중입니다."),
    },
    {
      title: "문의하기",
      description: "문의 및 오류 관련 문의",
      onClick: () => alert("문의 기능은 준비 중입니다."),
    },
    {
      title: "로그아웃",
      description: "현재 계정에서 로그아웃",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>마이페이지</h1>
      <p className={styles.subtitle}>내 계정 정보와 동아리 관리를 확인하세요.</p>

      {isLoading && (
        <p className={styles.statusText}>마이페이지 정보를 불러오는 중입니다.</p>
      )}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && (
        <>
          <section className={styles.profileCard} aria-label="내 프로필">
            <div className={styles.avatar} />
            <div className={styles.profileInfo}>
              <h2>{userName}</h2>
              <p>{userEmail}</p>
            </div>
          </section>

          <section className={styles.list} aria-label="마이페이지 메뉴">
            {menuItems.map((item) => (
              <button
                key={item.title}
                type="button"
                className={`${styles.card} ${item.danger ? styles.dangerCard : ""}`}
                onClick={item.onClick}
              >
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <b aria-hidden="true">›</b>
              </button>
            ))}
          </section>
        </>
      )}

      <BottomNav />
    </main>
  );
}
