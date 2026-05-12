"use client";

import styles from "./page.module.css";

import {
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import { auth, provider } from "../firebase";

export default function LoginPage() {

  // 로그인 버튼 클릭
  const handleGoogleLogin = async () => {

    try {

      // 기존 로그인 제거
      await signOut(auth);

      // 계정 선택 강제
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // 구글 로그인 시작
      await signInWithRedirect(
        auth,
        provider
      );

    } catch (error) {

      console.error(error);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>

        {/* 로고 */}
        <img
          src="/logo.png"
          alt="동네 로고"
          className={styles.logo}
        />

        {/* 제목 */}
        <h1 className={styles.title}>
          동네
          <br />
          <span>(동아리 네트워크)</span>
        </h1>

        {/* 로그인 버튼 */}
        <button
          className={styles.googleButton}
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className={styles.googleIcon}
          />

          <span>Sign in with Google</span>
        </button>

        {/* 안내 문구 */}
        <p className={styles.notice}>
          인하대 계정으로만 로그인이 가능합니다
        </p>

      </div>
    </main>
  );
}