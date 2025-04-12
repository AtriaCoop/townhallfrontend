import Navigation from "@/components/Navigation/Navigation"
import styles from '@/pages/MembersPage/MembersPage.module.scss'
import MemberCard from "@/components/MemberCard/MemberCard"


export default function MembersPage() {

    const members = [
        {
            name: "Ryan Yee",
            title: "Tester · Atria",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Tester · Atria",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Tester · Atria",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Tester · Atria",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Tester · Atria",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Tester · Atria",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Tester · Atria",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Tester · Atria",
            imageSrc: "/assets/members/aldo.png",
        },
        // Add more here...
    ];

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
                <input className={styles.searchBar} type="search" placeholder="Enter Name To Search By"/>

                <div className={styles.memberList}>
                    {members.map((member, idx) => (
                        <MemberCard
                            key={idx}
                            name={member.name}
                            title={member.title}
                            imageSrc={member.imageSrc}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}