import styles from "./SortBy.module.scss";

export default function SortBy({onSelect}) {
  return (
    <div className={styles.container}>
      Sort By:{" "}
      <select className={styles.sortby_dropdown} onChange={(e) => onSelect(e.target.value)}>
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="most_reactions">Most Reactions</option>
        <option value="least_reactions">Least Reactions</option>
        <option value="most_comments">Most Comments</option>
        <option value="least_comments">Least Commentns</option>
      </select>
    </div>
  );
}
