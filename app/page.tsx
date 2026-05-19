"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/main");
  }, [router]);

  return (
    <main className="route-loading">
      <p>로딩중...</p>
    </main>
  );
}
