"use client";

import { usePathname, useRouter } from "next/navigation";

import styles from "./BottomNav.module.css";

const navItems = [
  { href: "/main", icon: "/main.svg", label: "home" },
  { href: "/clubs", icon: "/clubs.svg", label: "clubs" },
  { href: "/events", icon: "/events.svg", label: "events" },
  { href: "/myclub", icon: "/apply.svg", label: "myclub" },
  { href: "/mypage", icon: "/mypage.svg", label: "mypage" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className={styles.bottomNav} aria-label="Primary navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <button
            key={item.href}
            type="button"
            className={`${styles.navItem} ${isActive ? styles.activeNav : ""}`}
            onClick={() => router.push(item.href)}
          >
            <img src={item.icon} alt="" className={styles.navIcon} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
