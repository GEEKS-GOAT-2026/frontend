"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BottomNav from "../../../../components/BottomNav";
import {
  ClubActivityRecord,
  getClubActivityRecords,
} from "../../../../lib/api";

import styles from "./page.module.css";

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

function getLocation(description: string) {
  const [firstLine] = description.split("\n");

  if (firstLine?.startsWith("장소:")) {
    return firstLine.replace("장소:", "").trim();
  }

  return "";
}

function getBody(description: string) {
  const lines = description.split("\n");

  if (lines[0]?.startsWith("장소:")) {
    return lines.slice(1).join("\n").trim();
  }

  return description;
}

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams<{ clubId: string; activityId: string }>();
  const clubId = Number(params.clubId);
  const activityId = Number(params.activityId);
  const [activity, setActivity] = useState<ClubActivityRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivity = async () => {
      if (!Number.isFinite(clubId) || !Number.isFinite(activityId)) {
        setError("활동기록 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const records = await getClubActivityRecords(clubId);
        const targetActivity = records.find((record) => record.id === activityId);

        if (!targetActivity) {
          throw new Error("활동기록을 찾을 수 없습니다.");
        }

        setActivity(targetActivity);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "활동기록을 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadActivity();
  }, [activityId, clubId]);

  const location = useMemo(
    () => (activity ? getLocation(activity.description) : ""),
    [activity]
  );
  const body = useMemo(
    () => (activity ? getBody(activity.description) : ""),
    [activity]
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          ‹
        </button>
        <div>
          <h1>활동기록</h1>
          <p>동아리 활동기록을 자세히 보기</p>
        </div>
      </header>

      {isLoading && <p className={styles.statusText}>활동기록을 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && activity && (
        <article className={styles.detail}>
          <div className={styles.heroImage}>
            {activity.imageUrl ? (
              <img src={activity.imageUrl} alt={`${activity.title} 이미지`} />
            ) : (
              <strong>활동기록 이미지</strong>
            )}
          </div>

          <span className={styles.badge}>활동기록</span>
          <h2>{activity.title}</h2>

          <p className={styles.meta}>
            {activity.clubName} · {formatDate(activity.startDate)}
            {activity.endDate && ` ~ ${formatDate(activity.endDate)}`}
            {location && ` · ${location}`}
          </p>

          <section className={styles.bodySection}>
            <h3>활동기록 소개</h3>
            <p>{body || activity.description}</p>
          </section>
        </article>
      )}

      <BottomNav />
    </main>
  );
}
