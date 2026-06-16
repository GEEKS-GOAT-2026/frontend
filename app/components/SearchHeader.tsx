import styles from "./SearchHeader.module.css";

type SearchHeaderProps = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
};

export default function SearchHeader({
  value,
  placeholder = "검색어를 입력하세요",
  onChange,
}: SearchHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <img src="/logo.png" alt="dongne logo" className={styles.logo} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={styles.searchInput}
        />
        <button type="button" className={styles.searchButton} aria-label="검색">
          ?
        </button>
      </div>
    </header>
  );
}
