"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BottomNav from "../../../components/BottomNav";
import {
  ClubActivityRecord,
  ClubDetail,
  getClub,
  getClubActivityRecords,
} from "../../../lib/api";

import styles from "./page.module.css";

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

export default function ClubActivitiesPage() {
  const router = useRouter();
  const params = useParams<{ clubId: string }>();
  const clubId = Number(params.clubId);
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [activities, setActivities] = useState<ClubActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivities = async () => {
      if (!Number.isFinite(clubId)) {
        setError("동아리 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const [clubData, activityData] = await Promise.all([
          getClub(clubId),
          getClubActivityRecords(clubId),
        ]);
        setClub(clubData);
        setActivities(activityData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "활동기록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadActivities();
  }, [clubId]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.logoButton} onClick={() => router.back()}>
          <img src="/logo.png" alt="dongne logo" />
        </button>
        <div>
          <h1>동네(동아리 활동기록)</h1>
          <p>동아리의 다양한 활동을 확인해보세요.</p>
        </div>
      </header>

      {isLoading && <p className={styles.statusText}>활동기록을 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && activities.length === 0 && (
        <p className={styles.statusText}>
          {club ? `${club.name}에 등록된 활동기록이 없습니다.` : "등록된 활동기록이 없습니다."}
        </p>
      )}

      <section className={styles.activityList} aria-label="동아리 활동기록 목록">
        {activities.map((activity) => (
          <article key={activity.id} className={styles.activityCard}>
            <div className={styles.activityImage}>
              {activity.imageUrl && <img src={activity.imageUrl} alt={`${activity.title} 이미지`} />}
            </div>

            <div className={styles.activityContent}>
              <p className={styles.period}>
                {formatDate(activity.startDate)} ~ {formatDate(activity.endDate)}
              </p>
              <h2>{activity.title}</h2>
              <p className={styles.description}>{activity.description}</p>
            </div>

            <span className={styles.chevron} aria-hidden="true">
              ›
            </span>
          </article>
        ))}
      </section>

      <BottomNav />
    </main>
  );
}
