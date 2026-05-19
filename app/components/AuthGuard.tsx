"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const PUBLIC_PATHS = ["/login"];

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      setIsAllowed(false);

      const searchParams = new URLSearchParams(window.location.search);
      const incomingToken =
        searchParams.get("token") ?? searchParams.get("accessToken");

      if (incomingToken) {
        localStorage.setItem("accessToken", incomingToken);
        router.replace("/main");
        return;
      }

      const token = localStorage.getItem("accessToken");

      if (!token && !isPublicPath) {
        router.replace("/login");
        return;
      }

      if (token && pathname === "/login") {
        router.replace("/main");
        return;
      }

      setIsAllowed(true);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-token-change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-token-change", checkAuth);
    };
  }, [isPublicPath, pathname, router]);

  if (!isAllowed) {
    return (
      <main className="route-loading">
        <p>로딩중...</p>
      </main>
    );
  }

  return children;
}
