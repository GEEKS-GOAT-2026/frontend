"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BottomNav from "../../../components/BottomNav";
import {
  ClubMember,
  getClubMembers,
  getMyInfo,
  transferPresident,
} from "../../../lib/api";

import styles from "./page.module.css";

function getClubIdFromQuery(searchParams: URLSearchParams) {
  const rawClubId = searchParams.get("clubId");
  const clubId = rawClubId ? Number(rawClubId) : NaN;

  return Number.isFinite(clubId) ? clubId : null;
}

function getClubNameFromQuery(searchParams: URLSearchParams) {
  return searchParams.get("clubName") ?? "동아리";
}

function isPresidentRole(role: string) {
  const normalizedRole = role.toUpperCase();

  return (
    normalizedRole.includes("PRESIDENT") ||
    normalizedRole.includes("CHAIR") ||
    role.includes("회장")
  );
}

function getMemberMajor(member: ClubMember) {
  return member.department || member.major || "학과 정보 없음";
}

function getMemberStudentId(member: ClubMember) {
  return member.studentNumber || member.studentId || "학번 정보 없음";
}

function TransferPresidentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = getClubIdFromQuery(searchParams);
  const clubName = getClubNameFromQuery(searchParams);
  const [myEmail, setMyEmail] = useState("");
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingMemberId, setProcessingMemberId] = useState<number | null>(null);
  const [memberToTransfer, setMemberToTransfer] = useState<ClubMember | null>(null);
  const [transferCountdown, setTransferCountdown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      if (!clubId) {
        setError("동아리 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const user = await getMyInfo();
        const targetClub = user.managedClubs?.find(
          (club) => club.clubId === clubId && isPresidentRole(club.role)
        );

        if (!targetClub) {
          setError("회장 권한이 있는 동아리만 양도할 수 있습니다.");
          setMembers([]);
          return;
        }

        const memberData = await getClubMembers(clubId, {
          status: "member",
          keyword: "",
        });

        setMyEmail(user.email);
        setMembers(memberData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "재원 목록을 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadMembers();
  }, [clubId]);

  useEffect(() => {
    if (!memberToTransfer) {
      return;
    }

    const timerId = window.setInterval(() => {
      setTransferCountdown((currentCount) => {
        if (currentCount <= 1) {
          window.clearInterval(timerId);
          return 0;
        }

        return currentCount - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [memberToTransfer]);

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return members
      .filter((member) => member.email !== myEmail)
      .filter((member) => {
        if (!keyword) {
          return true;
        }

        return [
          member.name,
          getMemberMajor(member),
          getMemberStudentId(member),
          member.email,
          member.phone ?? "",
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword));
      });
  }, [members, myEmail, search]);

  const openTransferModal = (member: ClubMember) => {
    setTransferCountdown(3);
    setMemberToTransfer(member);
  };

  const closeTransferModal = () => {
    setMemberToTransfer(null);
    setTransferCountdown(0);
  };

  const handleTransfer = async () => {
    if (!clubId || !memberToTransfer || transferCountdown > 0) {
      return;
    }

    try {
      setProcessingMemberId(memberToTransfer.id);
      await transferPresident(clubId, memberToTransfer.email);
      alert("회장 권한 양도가 완료되었습니다.");
      router.replace("/myclub/manage");
    } catch (err) {
      alert(err instanceof Error ? err.message : "회장 권한 양도에 실패했습니다.");
    } finally {
      setProcessingMemberId(null);
      closeTransferModal();
    }
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
          <h1>회장 권한 양도</h1>
          <p>{clubName} 재원 중 양도할 회원을 선택하세요.</p>
        </div>
      </header>

      <section className={styles.searchSection}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="이름, 학과, 이메일 검색"
        />
      </section>

      {isLoading && <p className={styles.statusText}>재원 목록을 불러오는 중입니다.</p>}
      {error && <p className={styles.statusText}>{error}</p>}

      {!isLoading && !error && filteredMembers.length === 0 && (
        <p className={styles.statusText}>양도할 수 있는 재원이 없습니다.</p>
      )}

      <section className={styles.memberList} aria-label="회장 권한 양도 재원 목록">
        {filteredMembers.map((member) => (
          <article key={member.id} className={styles.memberCard}>
            <div className={styles.profileImage}>
              {member.image ? (
                <img src={member.image} alt={member.name} />
              ) : (
                <span>{member.name.slice(0, 1) || "?"}</span>
              )}
            </div>

            <div className={styles.memberInfo}>
              <h2>{member.name || "이름 정보 없음"}</h2>
              <p>{getMemberMajor(member)}</p>
              <p>{getMemberStudentId(member)}</p>
              <p>{member.email || "이메일 정보 없음"}</p>
              <p>{member.phone || "연락처 정보 없음"}</p>
            </div>

            <button
              type="button"
              className={styles.transferButton}
              disabled={processingMemberId === member.id || !member.email}
              onClick={() => openTransferModal(member)}
            >
              {processingMemberId === member.id ? "양도 중" : "양도하기"}
            </button>
          </article>
        ))}
      </section>

      {memberToTransfer && (
        <div className={styles.modalOverlay} role="presentation">
          <section
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-president-title"
          >
            <strong id="transfer-president-title">회장 권한 양도</strong>
            <p>
              {memberToTransfer.name} 회원에게 {clubName} 회장 권한을 정말
              양도하시겠습니까?
            </p>
            <small className={styles.warningText}>
              양도 후 현재 계정은 회장 권한을 잃게 됩니다.
            </small>
            {transferCountdown > 0 && (
              <small className={styles.countdownText}>
                {transferCountdown}초 후 양도하기 버튼을 누를 수 있습니다.
              </small>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelModalButton}
                disabled={processingMemberId === memberToTransfer.id}
                onClick={closeTransferModal}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.confirmTransferButton}
                disabled={
                  processingMemberId === memberToTransfer.id ||
                  transferCountdown > 0
                }
                onClick={handleTransfer}
              >
                {processingMemberId === memberToTransfer.id
                  ? "양도 중"
                  : transferCountdown > 0
                    ? `${transferCountdown}초`
                    : "양도하기"}
              </button>
            </div>
          </section>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

export default function TransferPresidentPage() {
  return (
    <Suspense fallback={null}>
      <TransferPresidentContent />
    </Suspense>
  );
}
