import ClipLoader from "react-spinners/ClipLoader";
import styles from './Loader.module.scss';
const Loader = () => {

  return (
  <div className={styles.loaderContainer}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ClipLoader color="#015e22" size={150} />
      <div className={styles.spinnerText}>Loading, please wait...</div>
    </div>
  </div>
  );
};

export default Loader;