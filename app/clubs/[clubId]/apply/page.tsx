"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import BottomNav from "../../../components/BottomNav";
import { ClubDetail, getClub, getMyInfo, submitApplication } from "../../../lib/api";

import styles from "./page.module.css";

type ApplyForm = {
  name: string;
  major: string;
  studentId: string;
  email: string;
  phone: string;
};

const initialForm: ApplyForm = {
  name: "",
  major: "",
  studentId: "",
  email: "",
  phone: "",
};

export default function ClubApplyPage() {
  const router = useRouter();
  const params = useParams<{ clubId: string }>();
  const clubId = Number(params.clubId);
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [form, setForm] = useState<ApplyForm>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplyPage = async () => {
      if (!Number.isFinite(clubId)) {
        setError("동아리 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [clubData, userResult] = await Promise.allSettled([
          getClub(clubId),
          getMyInfo(),
        ]);

        if (clubData.status === "rejected") {
          throw clubData.reason;
        }

        setClub(clubData.value);

        if (userResult.status === "fulfilled") {
          setForm((currentForm) => ({
            ...currentForm,
            name: userResult.value.name ?? "",
            email: userResult.value.email ?? "",
          }));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "가입 신청 정보를 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplyPage();
  }, [clubId]);

  const activeRecruitment = useMemo(
    () => club?.recruitments.find((recruitment) => recruitment.active) ?? null,
    [club]
  );

  const updateForm = (field: keyof ApplyForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeRecruitment) {
      alert("현재 신청 가능한 모집 공고가 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitApplication(activeRecruitment.id, {
        name: form.name.trim(),
        major: form.major.trim(),
        studentId: form.studentId.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      localStorage.setItem(`pendingApplication:${clubId}`, "true");
      alert("가입 신청이 완료되었습니다.");
      router.replace(`/clubs/${clubId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "가입 신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>동아리 가입</h1>
        <p>{club ? `${club.name}에 가입을 신청하세요.` : "동아리 가입을 신청하세요."}</p>
      </header>

      {isLoading && <p className={styles.statusText}>가입 신청 정보를 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>신청자 이름</span>
            <input
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>학과</span>
            <input
              value={form.major}
              onChange={(event) => updateForm("major", event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>학번</span>
            <input
              value={form.studentId}
              onChange={(event) => updateForm("studentId", event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>이메일</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>전화번호</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateForm("phone", event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !activeRecruitment}
          >
            {isSubmitting ? "신청 중" : "가입 신청하기"}
          </button>
        </form>
      )}

      <BottomNav />
    </main>
  );
}
