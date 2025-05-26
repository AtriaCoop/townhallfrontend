import Navigation from "@/components/Navigation/Navigation"
import styles from '@/pages/MembersPage/MembersPage.module.scss'
import MemberCard from "@/components/MemberCard/MemberCard"
import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";


export default function MembersPage() {

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
    const router = useRouter();

    const [members, setMembers] = useState([]);
    const [searchMember, setSearchMember] = useState('');

    const filteredMembers = members
    .filter((member) =>
      `${member.full_name}`.toLowerCase().includes(searchMember.toLowerCase())
    )
    // members in alphabetical order
    .sort((a, b) => {
      const nameA = `${a.full_name}`.toLowerCase();
      const nameB = `${b.full_name}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });  

    useEffect(() => {
        async function fetchMembers() {
            try {
                const response = await fetch (`${BASE_URL}/user`);
                const data = await response.json();
                setMembers(data.data || []);
            } catch (error) {
                console.error("Error fetching member data", error);
            }
        }
        fetchMembers();
    }, [BASE_URL]);

    return (
        <div className={styles.container}>
            <Navigation />

            {/* HOME CONTENT CONTAINER */}
            <div className={styles.homeContainer}>
                <div className={styles.title}>
                    <h1>Members</h1>
                    <p>
                        Connect with fellow coalition members in our community! You can browse through member profiles to see what work they are apart of and interested in. Found someone who shares your passion? Send them a message. Dive in, connect, and elevate your coalition experience!
                    </p>
                </div>
                <input
                    className={styles.searchBar}
                    type="search"
                    placeholder="Enter Name To Search By"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                />

                <div className={styles.memberList}>
                {filteredMembers.length > 0 ? (
                    filteredMembers.map((member, idx) => (
                    <MemberCard
                        key={idx}
                        name={`${member.full_name}`}
                        title={`${member.title} - ${member.primary_organization || ''}`}
                        imageSrc={member.profile_image ? `${member.profile_image}` : "/assets/ProfileImage.jpg"}
                        onClick={() => router.push(`/ProfilePage/${member.id}`)}
                    />
                    ))
                ) : (
                    <p className={styles.noResults}>No members found matching your search.</p>
                )}
                </div>
            </div>

        </div>
    )
}