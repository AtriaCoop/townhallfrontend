import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authenticatedFetch } from "@/utils/authHelpers";
import Icon from "@/icons/Icon";
import styles from "./MembersPage.module.scss";

export default function MembersPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const filteredMembers = members
    .filter((member) =>
      member.full_name?.toLowerCase().includes(searchMember.toLowerCase())
    )
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await authenticatedFetch(`${BASE_URL}/user`);
        const data = await res.json();
        setMembers(data.data || []);
      } catch (err) {
        console.error("Error fetching members", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, [BASE_URL]);

  return (
    <div className={styles.membersPage}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Members</h1>
          <p className={styles.pageDescription}>
            Explore and connect with people across the coalition community.
          </p>
        </div>
        <div className={styles.searchWrapper}>
          <Icon name="search" size={18} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search members..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
          />
        </div>
      </header>

      {/* Members Grid */}
      <div className={styles.membersGrid}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading members...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className={styles.memberCard}
              onClick={() => router.push(`/ProfilePage/${member.id}`)}
            >
              <img
                src={member.profile_image || "/assets/ProfileImage.jpg"}
                alt={member.full_name}
                className={styles.memberAvatar}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/ProfileImage.jpg";
                }}
              />
              <div className={styles.memberInfo}>
                <h3 className={styles.memberName}>
                  {member.full_name || "Unnamed"}
                </h3>
                <p className={styles.memberMeta}>
                  {member.title || "VFJC Member"}
                </p>
                {member.primary_organization && (
                  <p className={styles.memberOrg}>
                    {member.primary_organization}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <Icon name="members" size={48} />
            <h3>No members found</h3>
            <p>
              {searchMember
                ? "Try adjusting your search terms."
                : "No members to display yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
