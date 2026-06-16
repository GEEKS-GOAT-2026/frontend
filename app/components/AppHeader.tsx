import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  title?: string;
};

export default function AppHeader({ title = "동네" }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logoWrap}>
        <img src="/logo.png" alt="dongne logo" className={styles.logo} />
        <span className={styles.logoText}>{title}</span>
      </div>
    </header>
  );
}
