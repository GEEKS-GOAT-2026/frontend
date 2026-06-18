"use client";

import { ChangeEvent, FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BottomNav from "../../../components/BottomNav";
import { createClubNotice } from "../../../lib/api";

import styles from "../activity/page.module.css";

type NoticeForm = {
  title: string;
  noticeDate: string;
  content: string;
  attachmentName: string;
};

const initialForm: NoticeForm = {
  title: "",
  noticeDate: "",
  content: "",
  attachmentName: "",
};

function getClubIdFromQuery(searchParams: URLSearchParams) {
  const rawClubId = searchParams.get("clubId");
  const clubId = rawClubId ? Number(rawClubId) : NaN;

  return Number.isFinite(clubId) ? clubId : null;
}

function NoticeWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = getClubIdFromQuery(searchParams);
  const [form, setForm] = useState<NoticeForm>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const updateForm = (field: keyof NoticeForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateForm("attachmentName", file.name);
  };

  const clearAttachment = () => {
    updateForm("attachmentName", "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    const content = form.attachmentName
      ? `${form.content.trim()}\n\n첨부파일: ${form.attachmentName}`
      : form.content.trim();

    try {
      setIsSaving(true);
      await createClubNotice(clubId, {
        title: form.title.trim(),
        noticeDate: form.noticeDate,
        content,
        badge: "",
        pinned: false,
      });
      alert("공지사항이 저장되었습니다.");
      router.replace(`/clubs/${clubId}/notices`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "공지사항 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    alert("미리보기 기능은 준비 중입니다.");
  };

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
          <h1>공지사항 작성</h1>
          <p>공지사항을 작성해주세요.</p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.modeTabs} aria-label="공지사항 작성 모드">
          <span className={styles.activeTab}>공지</span>
          <span>임시저장 가능</span>
        </div>

        <label className={styles.field}>
          <span>공지명</span>
          <input
            value={form.title}
            onChange={(event) => updateForm("title", event.target.value)}
            placeholder="예: 6월 정기 공연 안내"
            required
          />
        </label>

        <label className={styles.field}>
          <span>작성일</span>
          <input
            type="date"
            value={form.noticeDate}
            onChange={(event) => updateForm("noticeDate", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>본문</span>
          <textarea
            value={form.content}
            onChange={(event) => updateForm("content", event.target.value)}
            placeholder="본문 입력"
            required
          />
        </label>

        <div className={styles.uploadBox}>
          <span>파일 첨부</span>
          <label className={styles.filePicker}>
            <strong>
              {form.attachmentName || "업로드할 파일을 드래그해주세요"}
            </strong>
            <input type="file" onChange={handleFileChange} />
          </label>
          {form.attachmentName && (
            <div className={styles.imageMeta}>
              <span>{form.attachmentName}</span>
              <button type="button" onClick={clearAttachment}>
                삭제
              </button>
            </div>
          )}
        </div>

        <div className={styles.actionRow}>
          <button type="button" className={styles.draftButton}>
            임시저장
          </button>
          <button
            type="button"
            className={styles.previewButton}
            onClick={handlePreview}
          >
            미리보기
          </button>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSaving}
        >
          {isSaving ? "저장 중" : "저장하기"}
        </button>
      </form>

      <BottomNav />
    </main>
  );
}

export default function NoticeWritePage() {
  return (
    <Suspense fallback={null}>
      <NoticeWriteContent />
    </Suspense>
  );
}
