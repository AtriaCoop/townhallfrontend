import styles from './PrivacyModal.module.scss';

export default function PrivacyModal({ onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.modalTitle}>Privacy Notice</h2>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h3>Introduction</h3>
            <p>
              Atria is a collaboration platform for the Vancouver Food Justice Coalition. 
              We are committed to protecting your privacy and being transparent about how we 
              collect and use your information.
            </p>
          </section>

          <section className={styles.section}>
            <h3>Data We Collect</h3>
            <ul>
              <li><strong>Account Information:</strong> Email address, password (encrypted), full name, and profile information you provide</li>
              <li><strong>Content You Create:</strong> Posts, comments, messages, and other content you share on the platform</li>
              <li><strong>Usage Data:</strong> Information about how you interact with the platform to improve functionality</li>
              <li><strong>Profile Data:</strong> Profile images, organization affiliations, and other information you choose to share</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>How We Use Your Data</h3>
            <p>Your data is used solely to:</p>
            <ul>
              <li>Provide and maintain the platform's core functionality</li>
              <li>Enable communication and collaboration between coalition members</li>
              <li>Authenticate your account and maintain your session</li>
              <li>Improve platform features and user experience</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Cookies and Tracking</h3>
            <p>We use essential cookies for:</p>
            <ul>
              <li><strong>Authentication:</strong> To keep you logged in during your session</li>
              <li><strong>Security:</strong> To protect against unauthorized access (CSRF protection)</li>
              <li><strong>Session Management:</strong> To maintain your active session</li>
            </ul>
            <div className={styles.importantNotice}>
              <strong>We do NOT:</strong>
              <ul>
                <li>Use cookies for advertising or marketing purposes</li>
                <li>Share your data with third-party advertisers</li>
                <li>Track your activity across other websites</li>
                <li>Sell your personal information</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Data Security</h3>
            <p>
              We implement appropriate security measures to protect your information. 
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className={styles.section}>
            <h3>Your Rights</h3>
            <p>You can:</p>
            <ul>
              <li>Access and update your profile information at any time</li>
              <li>Delete your account and associated data</li>
              <li>Contact us with privacy concerns</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Contact</h3>
            <p>
              For questions about this privacy notice, please contact the Vancouver Food Justice 
              Coalition administrators.
            </p>
          </section>
        </div>

        <button className={styles.closeButtonBottom} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}