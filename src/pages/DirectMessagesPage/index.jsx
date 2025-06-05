import Navigation from "@/components/Navigation/Navigation"
import styles from '@/pages/DirectMessagesPage/DirectMessagesPage.module.scss'
import ChatCard from "@/components/ChatCard/ChatCard"
import ChatModal from "@/components/ChatModal/ChatModal"
import ChatWindow from "@/components/ChatWindow/ChatWindow"
import { useState, useEffect } from 'react';
import { getCookie } from "@/utils/authHelpers";

export default function DirectMessagesPage({ currentUserId }) {

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
    const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE || 'ws://127.0.0.1:8000';
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_ID;

    const [csrfToken, setCsrfToken] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeChat, setActiveChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [unreadMap, setUnreadMap] = useState({});
    const [hasNewDm, setHasNewDm] = useState(false);

    useEffect(() => {
      const fetchCsrf = async () => {
        const res = await fetch(`${BASE_URL}/auth/csrf/`, {
          credentials: 'include',
        });
        const data = await res.json();
        console.log("✅ CSRF fetched:", data);
        setCsrfToken(data.csrfToken);
      };
      fetchCsrf();
    }, []);    
    
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userSocket = new WebSocket(`${WS_BASE_URL}/ws/users/${userData.id}/`);
    
        userSocket.onmessage = (e) => {
          const data = JSON.parse(e.data);
          const { chat_id, message, sender } = data;
    
          const userData = JSON.parse(localStorage.getItem('user') || '{}');

          // Only trigger notification if the sender is NOT you
          if (sender !== userData.id && activeChat?.id !== chat_id) {
            setUnreadMap(prev => ({
              ...prev,
              [chat_id]: (prev[chat_id] || 0) + 1,
            }));
            setHasNewDm(true); // Show red dot in navbar
          }          
    
          console.log("New global message:", message);
        };
    
        return () => userSocket.close();
      }, []);

      useEffect(() => {
        const fetchChats = async () => {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const res = await fetch(`${BASE_URL}/chats/?user_id=${userData.id}`, {
            credentials: 'include',
          });
          const data = await res.json();
          const chatsFromServer = data?.data || [];
      
          // 🧠 Inject name/title/image from other user
          const processedChats = chatsFromServer.map(chat => {
            const otherUser = chat.participants.find(p => p.id !== userData.id);
            return {
              ...chat,
              name: otherUser?.full_name || 'Unknown',
              title: otherUser?.title || 'VFJC Member',
              imageSrc: otherUser?.profile_image
              ? otherUser.profile_image.startsWith('http')
                ? otherUser.profile_image
                : `https://res.cloudinary.com/${CLOUD_NAME}/${otherUser.profile_image}`
                : '/assets/ProfileImage.jpg',            
              time: new Date(chat.created_at).toLocaleString(),
            };
          });
      
          setChats(processedChats);
        };
      
        fetchChats();
      }, []);         

    const handleStartChat = async (user) => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = userData.id;

        if (!csrfToken || csrfToken.length < 10) {
          console.error("Invalid CSRF token:", csrfToken);
          return;
        }        
      
        // Check if chat already exists with this user
        const existingChat = chats.find(chat => {
          const participantIds = chat.participants.map(p => p.id);
          return participantIds.includes(currentUserId) && participantIds.includes(user.id);
        });        
      
        if (existingChat) {
          setActiveChat(existingChat);
          setShowModal(false);
          return;
        }
      
        const res = await fetch(`${BASE_URL}/chats/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            },
          credentials: 'include',
          body: JSON.stringify({
            name: `chat-${currentUserId}-${user.id}`,
            participants: [currentUserId, user.id]
          }),
        });
      
        const data = await res.json();
        console.log("Chat creation response:", data);

        const chatId = data?.data?.id;
      
        const chatObj = {
          id: chatId,
          name: user.full_name,
          title: user.title || "VFJC Member",
          time: new Date().toISOString(),
          imageSrc: user.profile_image || "/assets/ProfileImage.jpg",
          participants: [currentUserId, user.id], // ✅ Include participants for future checks
          messages: [],
        };
      
        setChats(prev => [...prev, chatObj]);
        setActiveChat(chatObj);
        setShowModal(false);
      };         

      const handleChatClick = (chat) => {
        setActiveChat(chat);
        setHasNewDm(false);
        setUnreadMap(prev => ({
          ...prev,
          [chat.id]: 0,
        }));
      };      

    const handleDeleteChat = async (chatId) => {

      if (!csrfToken || csrfToken.length < 10) {
        console.error("Invalid CSRF token:", csrfToken);
        return;
      }      

        try {
          const res = await fetch(`${BASE_URL}/chats/${chatId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
          });
      
          if (res.ok) {
            setChats(prev => prev.filter(chat => chat.id !== chatId));
            if (activeChat?.id === chatId) {
              setActiveChat(null);
            }
          } else {
            console.error("Failed to delete chat");
          }
        } catch (err) {
          console.error("Error deleting chat:", err);
        }
      };      

    return (
        <div className={styles.container}>
            <Navigation hasNewDm={hasNewDm} />

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
                            <div style={{ position: 'relative' }}>
                                <ChatCard
                                    name={chat.name}
                                    title={chat.title}
                                    time={chat.time}
                                    imageSrc={chat.imageSrc}
                                    hasNotification={unreadMap[chat.id] > 0}
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        handleDeleteChat(chat.id);
                                    }}
                                />
                            </div>
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
                    setUnreadMap={setUnreadMap}
                />
            )}
        </div>
    )
}
