"use client";

import { ChangeEvent, FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BottomNav from "../../../components/BottomNav";
import { createEvent } from "../../../lib/api";

import styles from "../activity/page.module.css";

type EventForm = {
  title: string;
  eventDate: string;
  location: string;
  imageUrl: string;
  description: string;
};

const initialForm: EventForm = {
  title: "",
  eventDate: "",
  location: "",
  imageUrl: "",
  description: "",
};

function getClubIdFromQuery(searchParams: URLSearchParams) {
  const rawClubId = searchParams.get("clubId");
  const clubId = rawClubId ? Number(rawClubId) : NaN;

  return Number.isFinite(clubId) ? clubId : null;
}

function EventWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = getClubIdFromQuery(searchParams);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [imageName, setImageName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateForm = (field: keyof EventForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 첨부할 수 있습니다.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("대표 이미지는 3MB 이하로 선택해주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      updateForm("imageUrl", result);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    updateForm("imageUrl", "");
    setImageName("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setIsSaving(true);
      await createEvent(clubId, {
        title: form.title.trim(),
        eventDate: form.eventDate,
        location: form.location.trim(),
        imageUrl: form.imageUrl.trim(),
        description: form.description.trim(),
        published: true,
      });
      alert("행사글이 저장되었습니다.");
      router.replace(`/events?clubId=${clubId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "행사글 저장에 실패했습니다.");
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
          <h1>행사글 작성</h1>
          <p>동아리 행사를 작성하고 공유하세요.</p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.modeTabs} aria-label="행사글 작성 모드">
          <span className={styles.activeTab}>행사</span>
          <span>공개</span>
          <span>임시저장 가능</span>
        </div>

        <label className={styles.field}>
          <span>제목</span>
          <input
            value={form.title}
            onChange={(event) => updateForm("title", event.target.value)}
            placeholder="예: 6월 정기 공연 안내"
            required
          />
        </label>

        <label className={styles.field}>
          <span>행사 일시</span>
          <input
            type="date"
            value={form.eventDate}
            onChange={(event) => updateForm("eventDate", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>장소</span>
          <input
            value={form.location}
            onChange={(event) => updateForm("location", event.target.value)}
            placeholder="학생회관 소강당"
            required
          />
        </label>

        <div className={styles.uploadBox}>
          <span>대표 이미지</span>
          <label className={styles.imagePicker}>
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="대표 이미지 미리보기" />
            ) : (
              <strong>+ 포스터 또는 행사 이미지 첨부</strong>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
          {imageName && (
            <div className={styles.imageMeta}>
              <span>{imageName}</span>
              <button type="button" onClick={clearImage}>
                삭제
              </button>
            </div>
          )}
        </div>

        <label className={styles.field}>
          <span>본문</span>
          <textarea
            value={form.description}
            onChange={(event) => updateForm("description", event.target.value)}
            placeholder="행사 소개, 참여 방법, 준비물, 문의 연락처를 입력합니다."
            required
          />
        </label>

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

export default function EventWritePage() {
  return (
    <Suspense fallback={null}>
      <EventWriteContent />
    </Suspense>
  );
}
