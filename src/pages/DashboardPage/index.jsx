import Navigation from "@/components/Navigation/Navigation";
import styles from "@/pages/DashboardPage/DashboardPage.module.scss";

export default function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <Navigation />

      <div className={styles.content}>
        <h1 className={styles.title}>My Dashboard</h1>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Upcoming Events</h2>
            <div className={styles.calendar}>📅 Calendar View Placeholder</div>
          </div>

          <div className={styles.card}>
            <h2>Activity Overview</h2>
            <div className={styles.graph}>📈 Graph Placeholder (e.g. posts, messages, tasks)</div>
          </div>

          <div className={styles.cardWide}>
            <h2>New Opportunities</h2>
            <ul className={styles.opportunityList}>
              <li>🌱 Community Garden Organizer - Aug 5</li>
              <li>🍱 Food Prep Volunteer - Aug 7</li>
              <li>📦 Donation Drive Helper - Aug 10</li>
            </ul>
          </div>

          <div className={styles.card}>
            <h2>My Organizations</h2>
            <ul>
              <li>🥕 Vancouver Food Justice Coalition</li>
              <li>🌍 Climate Youth Collective</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
