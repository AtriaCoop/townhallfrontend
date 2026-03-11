import { SORT_OPTIONS, SORT_LABEL } from "@/constants/sort";
import styles from "./SortBy.module.scss";

export default function SortBy({onSelect}) {
  return (
    <div className={styles.container}>
      {SORT_LABEL}{" "}
      <select className={styles.sortby_dropdown} onChange={(e) => onSelect(e.target.value)}>
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}
