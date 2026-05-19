"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./BottomNavigation.module.css";

const navItems = [
  { label: "home", href: "/main", icon: "/main.svg" },
  { label: "clubs", href: "/clubs", icon: "/clubs.svg" },
  { label: "events", href: "/events", icon: "/events.svg" },
  { label: "apply", href: "/apply", icon: "/apply.svg" },
  { label: "mypage", href: "/mypage", icon: "/mypage.svg" },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        return (
          <div
            key={item.href}
            className={styles.navItem}
            onClick={() => router.push(item.href)}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <img src={item.icon} alt="" />
            <p>{item.label}</p>
          </div>
        );
      })}
    </nav>
  );
}
