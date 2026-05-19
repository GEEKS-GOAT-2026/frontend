import BottomNavigation from "../components/BottomNavigation";
import styles from "../components/PlaceholderPage.module.css";

export default function ApplyPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>apply</h1>
      <BottomNavigation />
    </main>
  );
}
