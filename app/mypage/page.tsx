"use client";

import { useRouter } from "next/navigation";

import BottomNav from "../components/BottomNav";
import { clearAuthToken } from "../lib/api";

import styles from "./page.module.css";

export default function MyPage() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    router.replace("/login");
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>마이페이지</h1>
      <button type="button" className={styles.logoutButton} onClick={handleLogout}>
        로그아웃
      </button>
      <BottomNav />
    </main>
  );
}
