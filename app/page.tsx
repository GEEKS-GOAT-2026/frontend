"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  [key: string]: any;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/users/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // If token is invalid/expired -> clear and redirect to login
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          router.push("/login");
          return;
        }

        // Other non-OK responses: surface error to UI (no redirect)
        if (!response.ok) {
          setError(`API Error: ${response.status} ${response.statusText}`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data);
        setError(null);
      } catch (err) {
        // Network or parsing errors: show error UI, do not redirect
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <main>
        <p>로딩중...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <p>오류: {error}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>여기는 메인 페이지 입니다.</h1>
      {user && (
        <div>
          <h2>사용자 정보</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}