import Navigation from "@/components/Navigation/Navigation"
import styles from '@/pages/GroupChatsPage/GroupChatsPage.module.scss'
import MessageBubble from "@/components/MessageBubble/MessageBubble";


export default function GroupChatsPage() {

    // Temporary static data (make dynamic later)
    const messages = [
        {
        id: 1,
        avatar: "/assets/evan.png",
        sender: "Evan Sidwell",
        organization: "Atria",
        timestamp: "1 month ago",
        message: "Welcome again everyone! If you have any questions about how to use the Atria tool, feel free to post those here. Or you can call me (6044177909) or email (atriacommunity@gmail.com). Have fun!"
        },
        // more messages...
    ];

    return (
        <div className={styles.container}>
            <Navigation />

            {/* Group Chats Sidebar */}
            <div className={styles.groupChatsSidebar}>
                <h2>Group Chats</h2>
                <button className={styles.joinButton}>+ JOIN A GROUP</button>

                <div className={styles.chatList}>
                    <button className={styles.chatItem}>#ATRIA Questions and Support</button>
                    <button className={styles.chatItem}>#Test</button>
                </div>
            </div>

            <div className={styles.chatWrapper}>
                {/* Chat Header */}
                <div className={styles.chatHeader}>
                    <img className={styles.groupsSvg} src="/assets/groups.svg" alt="Groups" />
                    <h2 className={styles.chatTitle}>#ATRIA Questions and Support</h2>
                    <div className={styles.chatIcons}>
                    <img src="/assets/search.svg" alt="Search" />
                    <img src="/assets/expand.svg" alt="Expand" />
                    </div>
                </div>

                {/* Message Bubble */}
                {messages.map(msg => (
                    <MessageBubble
                    key={msg.id}
                    avatar={msg.avatar}
                    sender={msg.sender}
                    organization={msg.organization}
                    timestamp={msg.timestamp}
                    message={msg.message}
                    />
                ))}

                {/* Chat Input */}
                <div className={styles.chatInputContainer}>
                    <input
                    type="text"
                    className={styles.chatInput}
                    placeholder="Enter message"
                    />
                    <button className={styles.sendButton}>
                        <img src="/assets/send.svg" alt="Send" />
                    </button>
                </div>
            </div>

        </div>
    )
}