import { useRouter } from "next/router";
import Icon from "@/icons/Icon";
import { authenticatedFetch } from "@/utils/authHelpers";
import styles from "./SettingsPage.module.scss";
import { LANGUAGES } from "@/constants/languages";

export default function SettingsPage({ darkMode, setDarkMode }) {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

  async function handleLogout() {
    try {
      await authenticatedFetch(`${BASE_URL}/auth/logout/`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("user");
    router.push("/");
  }

  return (
    <div className={styles.settingsPage}>
      <h1 className={styles.pageTitle}>Settings</h1>

      {/* Appearance Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Appearance</h2>
        <p className={styles.cardDescription}>
          Customize how TownHall looks for you.
        </p>

        <div className={styles.themeOptions}>
          <button
            className={`${styles.themeOption} ${!darkMode ? styles.themeActive : ""}`}
            onClick={() => setDarkMode(false)}
          >
            <div className={styles.themePreview}>
              <div className={styles.themePreviewLight}>
                <div className={styles.previewBar} />
                <div className={styles.previewLine} />
                <div className={styles.previewLineShort} />
              </div>
            </div>
            <div className={styles.themeInfo}>
              <Icon name="sun" size={18} />
              <span>Light</span>
            </div>
          </button>

          <button
            className={`${styles.themeOption} ${darkMode ? styles.themeActive : ""}`}
            onClick={() => setDarkMode(true)}
          >
            <div className={styles.themePreview}>
              <div className={styles.themePreviewDark}>
                <div className={styles.previewBar} />
                <div className={styles.previewLine} />
                <div className={styles.previewLineShort} />
              </div>
            </div>
            <div className={styles.themeInfo}>
              <Icon name="moon" size={18} />
              <span>Dark</span>
            </div>
          </button>
        </div>
      </div>

      {/* Language Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Language</h2>
        <p className={styles.cardDescription}>
          Choose your preferred language for the Townhall interface
        </p>

        <div>
          {LANGUAGES.map((language) => (
            <div class={styles.languageOption}>
              <div class={styles.languageFlag}>{language.flag}</div>
              <div class={styles.languageInfo}>
                <div class={styles.languageName}>{language.name}</div>
                <div class={styles.languageNative}>{language.nativeName}</div>
              </div>
              <div class={styles.languageRadioBtn}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Account</h2>

        <div className={styles.settingsList}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <Icon name="leave" size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
