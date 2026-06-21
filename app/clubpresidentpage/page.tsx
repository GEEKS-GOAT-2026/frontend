"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BottomNav from "../components/BottomNav";
import {
  ApplicationResponse,
  ClubMember,
  acceptClubMember,
  getClubApplications,
  getClubMembers,
  getMyInfo,
  rejectClubMember,
  updateApplicationStatus,
} from "../lib/api";

import styles from "./page.module.css";

type ActiveTab = "member" | "applicant";

function isPresidentRole(role: string) {
  const normalizedRole = role.toUpperCase();

  return (
    normalizedRole.includes("PRESIDENT") ||
    normalizedRole.includes("CHAIR") ||
    role.includes("회장")
  );
}

function getManagedClubIdFromQuery(searchParams: URLSearchParams) {
  const rawClubId = searchParams.get("clubId");
  const parsedClubId = rawClubId ? Number(rawClubId) : NaN;

  return Number.isFinite(parsedClubId) ? parsedClubId : null;
}

function getApplicantAnswers(member: ClubMember) {
  return (
    member.answers ??
    member.applicationAnswers ??
    member.application?.answers ??
    {}
  );
}

function getAnswerValue(
  answers: Record<string, unknown>,
  keys: string[],
  fallback = ""
) {
  for (const key of keys) {
    const value = getAnswerText(answers, key);

    if (value) {
      return value;
    }
  }

  return fallback;
}

function getAnswerText(
  answers: Record<string, unknown>,
  key: string,
  fallback = ""
) {
  const value = answers[key];

  if (value === undefined || value === null) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.map(String).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getApplicantField(
  member: ClubMember,
  answers: Record<string, unknown>,
  key: "name" | "major" | "studentId" | "email" | "birth" | "phone"
) {
  const memberValue =
    key === "major"
      ? member.department || member.major
      : key === "studentId"
        ? member.studentNumber || member.studentId
        : member[key];
  const answerKeys: Record<typeof key, string[]> = {
    name: ["name"],
    major: ["department", "major"],
    studentId: ["studentNumber", "student_number", "studentId"],
    email: ["email"],
    birth: ["birth"],
    phone: ["phone"],
  };
  const answerValue = getAnswerValue(answers, answerKeys[key]);

  return answerValue || memberValue || "";
}

function getAnswerLabel(key: string) {
  const labels: Record<string, string> = {
    name: "신청자 이름",
    major: "학과",
    department: "학과",
    studentId: "학번",
    studentNumber: "학번",
    student_number: "학번",
    email: "이메일",
    birth: "생년월일",
    phone: "전화번호",
    motivation: "지원 동기",
  };

  return labels[key] ?? key;
}

function getExtraAnswers(answers: Record<string, unknown>) {
  const primaryKeys = new Set([
    "name",
    "major",
    "department",
    "studentId",
    "studentNumber",
    "student_number",
    "email",
    "birth",
    "phone",
  ]);

  return Object.entries(answers)
    .filter(([key, value]) => !primaryKeys.has(key) && value !== null && value !== "")
    .map(([key]) => [getAnswerLabel(key), getAnswerText(answers, key)] as const)
    .filter(([, value]) => value);
}

function isPendingApplication(application: ApplicationResponse) {
  return application.status.toUpperCase() === "PENDING";
}

function applicationToMember(
  application: ApplicationResponse,
  applicantMember?: ClubMember
): ClubMember {
  const answers = application.answers ?? {};

  return {
    id: applicantMember?.id ?? application.id,
    applicationId: application.id,
    clubMemberId: applicantMember?.id ?? null,
    name: getAnswerValue(answers, ["name"], applicantMember?.name ?? application.userName),
    major: getAnswerValue(answers, ["department", "major"]),
    department: getAnswerValue(
      answers,
      ["department", "major"],
      applicantMember?.department ?? applicantMember?.major ?? ""
    ),
    studentId: getAnswerValue(answers, [
      "studentNumber",
      "student_number",
      "studentId",
    ], applicantMember?.studentNumber ?? applicantMember?.studentId ?? ""),
    studentNumber: getAnswerValue(answers, [
      "studentNumber",
      "student_number",
      "studentId",
    ], applicantMember?.studentNumber ?? applicantMember?.studentId ?? ""),
    email: getAnswerValue(answers, ["email"], applicantMember?.email ?? application.userEmail),
    birth: getAnswerValue(answers, ["birth"], applicantMember?.birth ?? ""),
    phone: getAnswerValue(answers, ["phone"], applicantMember?.phone ?? ""),
    image: applicantMember?.image ?? null,
    status: application.status,
    answers,
  };
}

function ClubPresidentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>("member");
  const [search, setSearch] = useState("");
  const [clubId, setClubId] = useState<number | null>(null);
  const [clubName, setClubName] = useState("회장 계정");
  const [presidentEmail, setPresidentEmail] = useState("");
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingMemberId, setProcessingMemberId] = useState<number | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<ClubMember | null>(null);
  const [removeCountdown, setRemoveCountdown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadManagedClub = async () => {
      try {
        setError("");
        const user = await getMyInfo();
        const queryClubId = getManagedClubIdFromQuery(searchParams);
        const targetClub =
          user.managedClubs?.find((club) => club.clubId === queryClubId) ??
          user.managedClubs?.[0];

        if (!targetClub) {
          setError("관리할 수 있는 동아리가 없습니다.");
          setIsLoading(false);
          return;
        }

        setClubId(targetClub.clubId);
        setClubName(targetClub.clubName);
        setPresidentEmail(isPresidentRole(targetClub.role) ? user.email : "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "회장 계정 정보를 불러오지 못했습니다."
        );
        setIsLoading(false);
      }
    };

    void loadManagedClub();
  }, [searchParams]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!clubId) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        if (activeTab === "applicant") {
          const [applications, applicantMembers] = await Promise.all([
            getClubApplications(clubId),
            getClubMembers(clubId, {
              status: "applicant",
              keyword: "",
            }),
          ]);
          const applicantMemberMap = new Map(
            applicantMembers.map((member) => [member.email.toLowerCase(), member])
          );
          const keyword = search.trim().toLowerCase();
          const applicants = applications
            .filter(isPendingApplication)
            .map((application) =>
              applicationToMember(
                application,
                applicantMemberMap.get(application.userEmail.toLowerCase())
              )
            )
            .filter((applicant) => {
              if (!keyword) {
                return true;
              }

              return [applicant.name, applicant.department, applicant.email, applicant.phone]
                .filter(Boolean)
                .some((value) => value?.toLowerCase().includes(keyword));
            });

          setMembers(applicants);
          return;
        }

        const data = await getClubMembers(clubId, {
          status: activeTab,
          keyword: search.trim(),
        });
        setMembers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "회원 목록을 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadMembers();
  }, [activeTab, clubId, search]);

  useEffect(() => {
    if (!memberToRemove) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemoveCountdown((currentCount) => {
        if (currentCount <= 1) {
          window.clearInterval(timerId);
          return 0;
        }

        return currentCount - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [memberToRemove]);

  const openRemoveModal = (member: ClubMember) => {
    setRemoveCountdown(3);
    setMemberToRemove(member);
  };

  const closeRemoveModal = () => {
    setMemberToRemove(null);
    setRemoveCountdown(0);
  };

  const filteredMembers = useMemo(() => members, [members]);

  const handleAccept = async (memberId: number) => {
    if (!clubId) {
      return;
    }

    const targetMember = members.find((member) => member.id === memberId);
    const applicationId = targetMember?.applicationId ?? memberId;
    const clubMemberId = targetMember?.clubMemberId ?? memberId;

    try {
      setProcessingMemberId(memberId);
      if (activeTab === "applicant") {
        if (!targetMember?.clubMemberId) {
          throw new Error("신청자 회원 정보를 찾지 못했습니다.");
        }
        await updateApplicationStatus(applicationId, "ACCEPTED");
        await acceptClubMember(clubId, clubMemberId);
      } else {
        await acceptClubMember(clubId, memberId);
      }
      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== memberId)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "신청자 수락에 실패했습니다.");
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleReject = async (memberId: number) => {
    if (!clubId) {
      return;
    }

    const targetMember = members.find((member) => member.id === memberId);
    const applicationId = targetMember?.applicationId ?? memberId;
    const clubMemberId = targetMember?.clubMemberId ?? memberId;

    try {
      setProcessingMemberId(memberId);
      if (activeTab === "applicant") {
        if (!targetMember?.clubMemberId) {
          throw new Error("신청자 회원 정보를 찾지 못했습니다.");
        }
        await updateApplicationStatus(applicationId, "REJECTED");
        await rejectClubMember(clubId, clubMemberId);
      } else {
        await rejectClubMember(clubId, memberId);
      }
      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== memberId)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "신청자 거절에 실패했습니다.");
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!clubId) {
      return;
    }

    if (!memberToRemove) {
      return;
    }

    if (removeCountdown > 0) {
      return;
    }

    try {
      setProcessingMemberId(memberToRemove.id);
      await rejectClubMember(clubId, memberToRemove.id);
      setMembers((currentMembers) =>
        currentMembers.filter(
          (currentMember) => currentMember.id !== memberToRemove.id
        )
      );
      closeRemoveModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "회원 내보내기에 실패했습니다.");
    } finally {
      setProcessingMemberId(null);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <img src="/logo.png" alt="동네 로고" className={styles.logo} />
          <div>
            <span className={styles.logoText}>동네(회장계정)</span>
            <p className={styles.clubName}>{clubName}</p>
          </div>
        </div>
      </header>

      <section className={styles.searchSection}>
        <div className={styles.searchBar}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.back()}
          >
            ←
          </button>

          <input
            type="text"
            placeholder="사람 이름"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.searchInput}
          />

          <button type="button" className={styles.searchButton} aria-label="검색">
            🔍
          </button>
        </div>
      </section>

      <section className={styles.tabSection}>
        <button
          type="button"
          className={activeTab === "member" ? styles.activeTab : styles.tabButton}
          onClick={() => setActiveTab("member")}
        >
          재원목록
        </button>

        <button
          type="button"
          className={
            activeTab === "applicant" ? styles.activeTab : styles.tabButton
          }
          onClick={() => setActiveTab("applicant")}
        >
          신청인원목록
        </button>
      </section>

      {isLoading && <p className={styles.statusText}>회원 목록을 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && filteredMembers.length === 0 && (
        <p className={styles.statusText}>
          {activeTab === "member" ? "재원이 없습니다." : "신청 인원이 없습니다."}
        </p>
      )}

      <section className={styles.memberList}>
        {filteredMembers.map((member) => {
          const answers = getApplicantAnswers(member);
          const extraAnswers = getExtraAnswers(answers);
          const displayName =
            activeTab === "applicant"
              ? getApplicantField(member, answers, "name")
              : member.name;
          const displayMajor =
            activeTab === "applicant"
              ? getApplicantField(member, answers, "major")
              : member.department || member.major;
          const displayStudentId =
            activeTab === "applicant"
              ? getApplicantField(member, answers, "studentId")
              : member.studentNumber || member.studentId;
          const displayEmail =
            activeTab === "applicant"
              ? getApplicantField(member, answers, "email")
              : member.email;
          const displayBirth =
            activeTab === "applicant"
              ? getApplicantField(member, answers, "birth")
              : member.birth;
          const displayPhone =
            activeTab === "applicant"
              ? getApplicantField(member, answers, "phone")
              : member.phone;
          const isPresident =
            activeTab === "member" &&
            Boolean(presidentEmail) &&
            member.email.toLowerCase() === presidentEmail.toLowerCase();

          return (
            <div key={member.id} className={styles.memberCard}>
              <div className={styles.profileImage}>
                {member.image ? (
                  <img src={member.image} alt={displayName || member.name} />
                ) : (
                  <div className={styles.emptyImage}>✕</div>
                )}
              </div>

              <div className={styles.memberInfo}>
                <div className={styles.nameRow}>
                  <h3>{displayName || "이름 정보 없음"}</h3>
                  {isPresident && (
                    <img
                      src="/Crown.svg"
                      alt="회장"
                      className={styles.crownIcon}
                    />
                  )}
                </div>
                <p>{displayMajor || "학과 정보 없음"}</p>
                <p>{displayStudentId || "학번 정보 없음"}</p>
                <p>{displayEmail || "이메일 정보 없음"}</p>
                {activeTab === "applicant" && (
                  <p>{displayBirth || "생년월일 정보 없음"}</p>
                )}
                <p>{displayPhone || "전화번호 정보 없음"}</p>

                {activeTab === "applicant" && extraAnswers.length > 0 && (
                  <dl className={styles.answerList}>
                    {extraAnswers.map(([label, value]) => (
                      <div key={label} className={styles.answerItem}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {activeTab === "applicant" && (
                <div className={styles.buttonWrap}>
                  <button
                    type="button"
                    className={styles.acceptButton}
                    disabled={processingMemberId === member.id}
                    onClick={() => handleAccept(member.id)}
                  >
                    수락
                  </button>

                  <button
                    type="button"
                    className={styles.rejectButton}
                    disabled={processingMemberId === member.id}
                    onClick={() => handleReject(member.id)}
                  >
                    거절
                  </button>
                </div>
              )}

              {activeTab === "member" && !isPresident && (
                <div className={styles.buttonWrap}>
                  <button
                    type="button"
                    className={styles.removeButton}
                    disabled={processingMemberId === member.id}
                    onClick={() => openRemoveModal(member)}
                  >
                    내보내기
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {memberToRemove && (
        <div className={styles.modalOverlay} role="presentation">
          <section
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-member-title"
          >
            <strong id="remove-member-title">경고</strong>
            <p>
              {memberToRemove.name} 님을 정말 내보내겠습니까?
            </p>
            {removeCountdown > 0 && (
              <small className={styles.countdownText}>
                {removeCountdown}초 후 내보내기 버튼을 누를 수 있습니다.
              </small>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelModalButton}
                disabled={processingMemberId === memberToRemove.id}
                onClick={closeRemoveModal}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.confirmRemoveButton}
                disabled={
                  processingMemberId === memberToRemove.id || removeCountdown > 0
                }
                onClick={handleRemoveMember}
              >
                {processingMemberId === memberToRemove.id
                  ? "처리 중"
                  : removeCountdown > 0
                    ? `${removeCountdown}초`
                    : "내보내기"}
              </button>
            </div>
          </section>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

export default function ClubPresidentPage() {
  return (
    <Suspense fallback={null}>
      <ClubPresidentContent />
    </Suspense>
  );
}
