"use client";

import { useRouter } from "next/navigation";
import BottomNavigation from "../components/BottomNavigation";
import styles from "../components/PlaceholderPage.module.css";
import { clearAuthToken } from "../lib/api";

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
      <h1 className={styles.title}>mypage</h1>
      <button className={styles.logoutButton} onClick={handleLogout}>
        로그아웃
      </button>
      <BottomNavigation />
    </main>
  );
}
