"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BottomNav from "../../../../components/BottomNav";
import { ClubNotice, getClubNotices } from "../../../../lib/api";

import styles from "./page.module.css";

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}

function getContentWithoutAttachment(content: string) {
  return content
    .split("\n")
    .filter((line) => !line.trim().startsWith("첨부파일:"))
    .join("\n")
    .trim();
}

function getAttachmentName(content: string) {
  const attachmentLine = content
    .split("\n")
    .find((line) => line.trim().startsWith("첨부파일:"));

  return attachmentLine?.replace("첨부파일:", "").trim() ?? "";
}

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams<{ clubId: string; noticeId: string }>();
  const clubId = Number(params.clubId);
  const noticeId = Number(params.noticeId);
  const [notice, setNotice] = useState<ClubNotice | null>(null);
  const [notices, setNotices] = useState<ClubNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotice = async () => {
      if (!Number.isFinite(clubId) || !Number.isFinite(noticeId)) {
        setError("공지사항 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const noticeData = await getClubNotices(clubId);
        const targetNotice = noticeData.find((item) => item.id === noticeId);

        if (!targetNotice) {
          throw new Error("공지사항을 찾을 수 없습니다.");
        }

        setNotices(noticeData);
        setNotice(targetNotice);
      } catch (err) {
        setError(err instanceof Error ? err.message : "공지사항을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotice();
  }, [clubId, noticeId]);

  const currentIndex = useMemo(
    () => notices.findIndex((item) => item.id === noticeId),
    [noticeId, notices]
  );
  const previousNotice = currentIndex > 0 ? notices[currentIndex - 1] : null;
  const nextNotice =
    currentIndex >= 0 && currentIndex < notices.length - 1
      ? notices[currentIndex + 1]
      : null;
  const body = notice ? getContentWithoutAttachment(notice.content) : "";
  const attachmentName = notice ? getAttachmentName(notice.content) : "";

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
          <h1>공지사항 상세</h1>
        </div>
      </header>

      {isLoading && <p className={styles.statusText}>공지사항을 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && notice && (
        <>
          <article className={styles.noticePanel}>
            {notice.imageUrl && (
              <div className={styles.heroImage}>
                <img src={notice.imageUrl} alt={`${notice.title} 이미지`} />
              </div>
            )}

            <div className={styles.badgeRow}>
              <span className={styles.badge}>{notice.badge || "중요"}</span>
              {notice.pinned && <span className={styles.softBadge}>상단 고정</span>}
            </div>

            <h2>{notice.title}</h2>

            <dl className={styles.metaList}>
              <div>
                <dt>작성자</dt>
                <dd>{notice.clubName}</dd>
              </div>
              <div>
                <dt>작성일</dt>
                <dd>{formatDate(notice.noticeDate)}</dd>
              </div>
              <div>
                <dt>조회수</dt>
                <dd>-</dd>
              </div>
            </dl>

            <div className={styles.divider} />

            <p className={styles.bodyText}>{body || notice.content}</p>

            {attachmentName && (
              <div className={styles.attachment}>
                <span>첨부파일</span>
                <strong>{attachmentName}</strong>
              </div>
            )}
          </article>

          {(previousNotice || nextNotice) && (
            <section className={styles.relatedBox} aria-label="이전 다음 공지사항">
              {previousNotice && (
                <button
                  type="button"
                  onClick={() => router.push(`/clubs/${clubId}/notices/${previousNotice.id}`)}
                >
                  <span>이전 공지</span>
                  <strong>{previousNotice.title}</strong>
                </button>
              )}

              {nextNotice && (
                <button
                  type="button"
                  onClick={() => router.push(`/clubs/${clubId}/notices/${nextNotice.id}`)}
                >
                  <span>다음 공지</span>
                  <strong>{nextNotice.title}</strong>
                </button>
              )}
            </section>
          )}
        </>
      )}

      <BottomNav />
    </main>
  );
}
