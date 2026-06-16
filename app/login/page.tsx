"use client";

import styles from "./page.module.css";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://port-0-dongnea-mhfzs5l502d0035e.sel3.cloudtype.app";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const backendLoginUrl =
    process.env.NEXT_PUBLIC_BACKEND_LOGIN_URL ??
    "https://port-0-dongnea-mhfzs5l502d0035e.sel3.cloudtype.app/oauth2/authorization/google";

  useEffect(() => {
    const token = searchParams.get("token") ?? searchParams.get("accessToken");
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    // 로그인 실패 처리: error 쿼리 파라미터가 넘어오면 경고 및 콘솔 출력
    if (error && !token) {
      console.warn("OAuth login error:", error, message);
      const userMessage = message ?? "로그인에 실패했습니다. 학교 계정으로 다시 시도하세요.";
      try {
        alert(`로그인 실패: ${userMessage}`);
      } catch (e) {
        // alert가 없을 수 있는 환경을 대비해 콘솔에 추가 출력
        console.warn("Could not show alert; falling back to console.", e);
      }
      return;
    }

    // 로그인 성공 처리: token이 있으면 저장하고 API 응답을 콘솔로 출력
    if (token) {
      console.log("Received OAuth token:", token);
      localStorage.setItem("accessToken", token);
      router.replace("/main");

      try {
        alert("로그인 성공: 토큰을 저장했습니다.");
      } catch (e) {
        console.warn("Could not show alert; falling back to console.", e);
      }

      const fetchUser = async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/users/me`, {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.warn("API response not OK:", response.status);
            return;
          }

          const data = await response.json();
          
          // 사용자 정보를 localStorage에 저장
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.setItem("userId", String(data.id));
          localStorage.setItem("userName", data.name);
          localStorage.setItem("userEmail", data.email);
          
          console.log("User info saved:", data);
        } catch (err) {
          console.error("Error fetching API after login:", err);
        }
      };

      void fetchUser();
    }
  }, [router, searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = backendLoginUrl;
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
