import Navigation from "@/components/Navigation/Navigation"
import styles from '@/pages/DirectMessagesPage/DirectMessagesPage.module.scss'
import ChatCard from "@/components/ChatCard/ChatCard"
import ChatModal from "@/components/ChatModal/ChatModal"
import ChatWindow from "@/components/ChatWindow/ChatWindow"
import { useState, useEffect } from 'react';

export default function DirectMessagesPage() {

    const [showModal, setShowModal] = useState(false);
    const [activeChat, setActiveChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const stored = localStorage.getItem('chatList');
        if (stored) {
          setChats(JSON.parse(stored));
        }
      }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('chatList', JSON.stringify(chats));
        }
    }, [chats, isClient]);

    const handleStartChat = (user) => {
        const alreadyExists = chats.some(chat => chat.name === user.full_name);
        if (!alreadyExists) {
          setChats(prev => [
            ...prev,
            {
              name: user.full_name,
              title: user.title || "VFJC Member",
              time: "Just now",
              imageSrc: user.profile_image || "/default.jpg",
            }
          ]);
        }
        setActiveChat({
          name: user.full_name,
          title: user.title || "VFJC Member",
          time: "Just now",
          imageSrc: user.profile_image || "/default.jpg",
        });
        setShowModal(false);
      };      

    const handleChatClick = (chat) => {
        setActiveChat(chat);
    }

    return (
        <div className={styles.container}>
            <Navigation />

            {/* HOME CONTENT CONTAINER */}
            <div className={styles.homeContainer}>
                <div className={styles.titleContainer}>
                    <h1 className={styles.title}>Direct Messages 
                        <button className={styles.titleButton} onClick={() => setShowModal(true)}>
                            New Chat
                        </button> 
                    </h1>
                    <p>
                        You can use this messaging feature to have individual conversations with fellow VFJC members.
                    </p>
                </div>

                {showModal && (
                    <ChatModal 
                        onClose={() => setShowModal(false)}
                        title="New Chat"
                        onUserSelect={handleStartChat}
                    />
                )}

                <input className={styles.searchBar} type="search" placeholder="Search By Name"/>

                <div className={styles.chatList}>
                    {chats.length > 0 ? (
                        chats.map((chat, idx) => (
                        <div key={idx} onClick={() => handleChatClick(chat)}>
                            <ChatCard
                            name={chat.name}
                            title={chat.title}
                            time={chat.time}
                            imageSrc={chat.imageSrc}
                            />
                        </div>
                        ))
                    ) : (
                        <p className={styles.noChatsMessage}>No chats yet...</p>
                    )}
                </div>

            </div>

            {activeChat && (
                <ChatWindow 
                    chat={activeChat} 
                    onClose={() => setActiveChat(null)} 
                />
            )}
        </div>
    )
}
