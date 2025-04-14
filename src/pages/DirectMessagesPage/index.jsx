import Navigation from "@/components/Navigation/Navigation"
import styles from '@/pages/DirectMessagesPage/DirectMessagesPage.module.scss'
import ChatCard from "@/components/ChatCard/ChatCard"


export default function DirectMessagesPage() {

        const chats = [
        {
            name: "Ryan Yee",
            title: "Atria",
            time: "5mins ago",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Atria",
            time: "5mins ago",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Atria",
            time: "5mins ago",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Atria",
            time: "5mins ago",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Atria",
            time: "5mins ago",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Atria",
            time: "5mins ago",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Atria",
            time: "5mins ago",
            imageSrc: "/assets/members/aldo.png",
        },
        {
            name: "Ryan Yee",
            title: "Atria",
            time: "5mins ago",
            imageSrc: "/assets/members/aldo.png",
        },
        // Add more here...
    ];

    return (
        <div className={styles.container}>
            <Navigation />

            {/* HOME CONTENT CONTAINER */}
            <div className={styles.homeContainer}>
                <div className={styles.titleContainer}>
                    <h1 className={styles.title}>Direct Messages <button className={styles.titleButton}>New Chat</button> </h1>
                    <p>
                        You can use this messaging feature to have individual conversations with fellow VFJC members.
                    </p>
                </div>
                <input className={styles.searchBar} type="search" placeholder="Search By Name Or Organization"/>

                <div className={styles.chatList}>
                    {chats.map((chat, idx) => (
                        <ChatCard
                            key={idx}
                            name={chat.name}
                            title={chat.title}
                            time={chat.time}
                            imageSrc={chat.imageSrc}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}