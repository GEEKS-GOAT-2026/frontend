"use client";

import { ChangeEvent, FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BottomNav from "../../../components/BottomNav";
import { createClubActivityRecord, uploadClubImageForPost } from "../../../lib/api";

import styles from "./page.module.css";

type ActivityForm = {
  title: string;
  activityDate: string;
  location: string;
  description: string;
};

const initialForm: ActivityForm = {
  title: "",
  activityDate: "",
  location: "",
  description: "",
};

function getClubIdFromQuery(searchParams: URLSearchParams) {
  const rawClubId = searchParams.get("clubId");
  const clubId = rawClubId ? Number(rawClubId) : NaN;

  return Number.isFinite(clubId) ? clubId : null;
}

function validateImage(file: File) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return "JPG, PNG, WebP 이미지만 첨부할 수 있습니다.";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "대표 이미지는 5MB 이하로 선택해주세요.";
  }

  return "";
}

function getSaveErrorMessage(err: unknown) {
  const message = err instanceof Error ? err.message : "활동기록 저장에 실패했습니다.";

  if (message === "Failed to fetch") {
    return "이미지 업로드 요청이 실패했습니다. 업로드 API 또는 로그인 상태를 확인해주세요.";
  }

  return message;
}

function ActivityWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = getClubIdFromQuery(searchParams);
  const [form, setForm] = useState<ActivityForm>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateForm = (field: keyof ActivityForm, value: string) => {
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

    const validationMessage = validateImage(file);

    if (validationMessage) {
      alert(validationMessage);
      event.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreviewUrl("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!clubId) {
      alert("동아리 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setIsSaving(true);
      const uploadedImage = imageFile
        ? await uploadClubImageForPost(clubId, imageFile, "ACTIVITY")
        : null;

      await createClubActivityRecord(clubId, {
        title: form.title.trim(),
        startDate: form.activityDate,
        endDate: form.activityDate,
        imageUrl: uploadedImage?.imageUrl ?? undefined,
        description: `장소: ${form.location.trim()}\n\n${form.description.trim()}`,
      });
      alert("활동기록이 저장되었습니다.");
      router.replace(`/clubs/${clubId}/activities`);
    } catch (err) {
      alert(getSaveErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => router.back()} aria-label="뒤로가기">
          ‹
        </button>
        <div>
          <h1>활동기록 작성</h1>
          <p>동아리 활동을 기록하고 공유하세요.</p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.modeTabs} aria-label="활동기록 작성 모드">
          <span className={styles.activeTab}>활동기록</span>
          <span>공개</span>
        </div>

        <label className={styles.field}>
          <span>제목</span>
          <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="예: 6월 정기 공연 안내" required />
        </label>

        <label className={styles.field}>
          <span>활동 일시</span>
          <input type="date" value={form.activityDate} onChange={(event) => updateForm("activityDate", event.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>장소</span>
          <input value={form.location} onChange={(event) => updateForm("location", event.target.value)} placeholder="학생회관 소강당" required />
        </label>

        <div className={styles.uploadBox}>
          <span>대표 이미지</span>
          <label className={styles.imagePicker}>
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="대표 이미지 미리보기" />
            ) : (
              <strong>+ 포스터 또는 행사 이미지 첨부</strong>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          </label>
          {imageFile && (
            <div className={styles.imageMeta}>
              <span>{imageFile.name}</span>
              <button type="button" onClick={clearImage}>삭제</button>
            </div>
          )}
        </div>

        <label className={styles.field}>
          <span>본문</span>
          <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="활동기록 소개, 참여방법을 입력합니다." required />
        </label>

        <button type="submit" className={styles.submitButton} disabled={isSaving}>
          {isSaving ? "저장 중" : "저장하기"}
        </button>
      </form>

      <BottomNav />
    </main>
  );
}

export default function ActivityWritePage() {
  return (
    <Suspense fallback={null}>
      <ActivityWriteContent />
    </Suspense>
  );
}
