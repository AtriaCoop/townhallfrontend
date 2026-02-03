import Navigation from "@/components/Navigation/Navigation";
import styles from "@/pages/MembersPage/MembersPage.module.scss";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authenticatedFetch } from "@/utils/authHelpers";

export default function MembersPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState("");

  const filteredMembers = members
    .filter((member) =>
      member.full_name?.toLowerCase().includes(searchMember.toLowerCase())
    )
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await authenticatedFetch(`${BASE_URL}/user`);
        const data = await res.json();
        setMembers(data.data || []);
      } catch (err) {
        console.error("Error fetching members", err);
      }
    }
    fetchMembers();
  }, [BASE_URL]);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>👥 Our Members</h1>
            <p>
              Explore and connect with people across the coalition community.
            </p>
          </div>
          <input
            type="text"
            className={styles.search}
            placeholder="Search members..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
          />
        </header>

        <section className={styles.grid}>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, idx) => (
              <div
                key={idx}
                className={styles.card}
                onClick={() => router.push(`/ProfilePage/${member.id}`)}
              >
                <img
                  src={member.profile_image || "/assets/ProfileImage.jpg"}
                  alt={member.full_name}
                  className={styles.avatar}
                />
                <div>
                  <h3>{member.full_name || "Unnamed"}</h3>
                  <p className={styles.meta}>
                    {member.title || "No title"} ·{" "}
                    {member.primary_organization || "No org"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noResults}>No members match your search.</p>
          )}
        </section>
      </div>
    </div>
  );
}
