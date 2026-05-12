"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>여기는 메인 페이지 입니다.</h1>
      <Link href="/login">
        <button>
          로그인 페이지로 이동
        </button>
      </Link>
    </main>
  );
}