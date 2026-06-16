import styles from "./ClubCard.module.css";

type ClubCardProps = {
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string | null;
  recruitmentText?: string;
  activeRecruitment?: boolean;
  showJoinButton?: boolean;
  tags?: string[];
  onClick?: () => void;
};

export default function ClubCard({
  title,
  description,
  category,
  imageUrl,
  recruitmentText,
  activeRecruitment = false,
  showJoinButton = true,
  tags,
  onClick,
}: ClubCardProps) {
  const visibleTags = tags?.filter(Boolean) ?? (category ? [category] : []);

  return (
    <article
      className={styles.clubCard}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.clubImage}>
        {imageUrl && <img src={imageUrl} alt={`${title} 로고`} />}
      </div>
      <div className={styles.clubContent}>
        <div className={styles.clubHeader}>
          <h3 className={styles.clubTitle}>{title}</h3>
          {showJoinButton && (
            <button
              type="button"
              className={styles.joinButton}
              onClick={(event) => event.stopPropagation()}
            >
              {recruitmentText ?? (activeRecruitment ? "가입 가능" : "모집 마감")}
            </button>
          )}
        </div>
        {description && <p className={styles.description}>{description}</p>}
        {visibleTags.length > 0 && (
          <div className={styles.tagWrap}>
            {visibleTags.slice(0, 4).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
