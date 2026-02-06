import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import Icon from "@/icons/Icon";
import styles from "../Navigation/Navigation.module.scss";

export function NavLink({ item, hasNewDm }) {
  const pathname = usePathname();
  const router = useRouter();
  const { name, path, icon } = item;
  return (
    <div
      className={`${styles.link} ${pathname === path ? styles.active : ""}`}
      onClick={() => router.push(`${path}`)}
    >
      {icon && <Icon name={icon} />}
      <span className={styles.linkText}>{name}</span>
      {hasNewDm && <span className={styles.badge}>●</span>}
    </div>
  );
}
