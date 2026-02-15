import ClipLoader from "react-spinners/ClipLoader";
import styles from "./Loader.module.scss";

const Loader = ({ text = "Loading, please wait..." }) => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.card}>
        <div className={styles.spinnerWrapper}>
          <ClipLoader color="#5B99D3" size={64} />
        </div>
        <div className={styles.spinnerText}>{text}</div>
      </div>
    </div>
  );
};

export default Loader;
