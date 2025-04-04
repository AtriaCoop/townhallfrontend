import styles from './LandingPage.module.scss';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img src="/assets/VFJC.png" alt="Vancouver Food Justice Coalition" className={styles.vfjcLogo} />
        <img src="/assets/atria.png" alt="Atria" className={styles.atriaLogo} />
      </div>

      <div className={styles.card}>
        <h1>
          Welcome to Atria,<br />
          the platform for coalition collaboration.
        </h1>
        <p>
          This tool will help the Vancouver Food Justice Coalition communicate, stay organized, and accomplish more together.
        </p>

        <label>Email</label>
        <input type="email" placeholder="Enter email..." />

        <label>Password</label>
        <input type="password" placeholder="Enter password..." />

        <button className={styles.signupButton}>SIGNUP</button>

        <p className={styles.loginText}>
          Already Have An Account? <span>LOG IN</span>
        </p>
      </div>
    </div>
  );
}
