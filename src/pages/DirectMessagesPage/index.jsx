import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { authenticatedFetch } from "@/utils/authHelpers";
import ChatModal from "@/components/ChatModal/ChatModal";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import Icon from "@/icons/Icon";
import styles from "./DirectMessagesPage.module.scss";

export default function DirectMessagesPage({
  currentUserId,
  setHasNewDm,
  unreadMap,
  setUnreadMap,
}) {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_ID;

  const [csrfToken, setCsrfToken] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchUser, setSearchUser] = useState("");

  const filteredChats = chats
    .filter((chat) =>
      chat.name.toLowerCase().includes(searchUser.toLowerCase())
    )
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  useEffect(() => {
    const fetchCsrf = async () => {
      const res = await fetch(`${BASE_URL}/auth/csrf/`, {
        credentials: "include",
      });
      const data = await res.json();
      setCsrfToken(data.csrfToken);
    };
    fetchCsrf();
  }, [BASE_URL]);

  useEffect(() => {
    const fetchChats = async () => {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = Number(userData.id);
      const res = await authenticatedFetch(
        `${BASE_URL}/chats/?user_id=${userId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const chatsFromServer = data?.data || [];

      const processedChats = chatsFromServer.map((chat) => {
        const otherUser = chat.participants.find((p) => p.id !== userId);
        return {
          ...chat,
          name: otherUser?.full_name || "Unknown",
          title: otherUser?.title || "VFJC Member",
          imageSrc: otherUser?.profile_image
            ? otherUser.profile_image.startsWith("http")
              ? otherUser.profile_image
              : `https://res.cloudinary.com/${CLOUD_NAME}/${otherUser.profile_image}`
            : "/assets/ProfileImage.jpg",
          time: new Date(chat.created_at).toLocaleString(),
          lastMessage: chat.last_message || "Start a conversation...",
        };
      });

      setChats(processedChats);

      // Auto-open chat when navigating from a profile page (?chatWith=userId)
      const chatWithId = Number(router.query.chatWith);
      if (chatWithId) {
        const match = processedChats.find((c) =>
          c.participants.some((p) =>
            (typeof p === "object" ? p.id : p) === chatWithId
          )
        );
        if (match) setActiveChat(match);
      }
    };

    fetchChats();
  }, [BASE_URL, CLOUD_NAME, router.query.chatWith]);

  const handleStartChat = async (user) => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = Number(userData.id);

    // Check if a chat with this user already exists in local state
    const existingChat = chats.find((chat) => {
      const participantIds = chat.participants.map((p) =>
        typeof p === "object" ? p.id : p
      );
      return (
        participantIds.includes(currentUserId) &&
        participantIds.includes(user.id)
      );
    });

    if (existingChat) {
      setActiveChat(existingChat);
      setShowModal(false);
      return;
    }

    try {
      const res = await authenticatedFetch(`${BASE_URL}/chats/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `chat-${currentUserId}-${user.id}`,
          participants: [currentUserId, user.id],
        }),
      });

      const data = await res.json();
      const chatData = data?.data;
      if (!chatData?.id) return;

      // Process the backend response the same way fetchChats does
      const otherUser = chatData.participants.find((p) => p.id !== currentUserId);

      const chatObj = {
        ...chatData,
        name: otherUser?.full_name || user.full_name || "Unknown",
        title: otherUser?.title || user.title || "VFJC Member",
        imageSrc: otherUser?.profile_image
          ? otherUser.profile_image.startsWith("http")
            ? otherUser.profile_image
            : `https://res.cloudinary.com/${CLOUD_NAME}/${otherUser.profile_image}`
          : "/assets/ProfileImage.jpg",
        time: chatData.created_at || new Date().toISOString(),
        lastMessage: "Start a conversation...",
      };

      setChats((prev) => [...prev, chatObj]);
      setActiveChat(chatObj);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const handleChatClick = (chat) => {
    setActiveChat(chat);
    setUnreadMap((prev) => {
      const updatedMap = { ...prev, [chat.id]: 0 };
      const anyUnread = Object.values(updatedMap).some((count) => count > 0);
      setHasNewDm(anyUnread);
      return updatedMap;
    });
  };

  const handleDeleteChat = async (chatId) => {
    if (!csrfToken || csrfToken.length < 10) {
      console.error("Invalid CSRF token:", csrfToken);
      return;
    }

    try {
      const res = await authenticatedFetch(`${BASE_URL}/chats/${chatId}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        if (activeChat?.id === chatId) {
          setActiveChat(null);
        }
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  return (
    <div className={styles.messagesPage}>
      {/* Conversations List Panel */}
      <div className={`${styles.conversationsPanel} ${activeChat ? styles.hideOnMobile : ''}`}>
        <div className={styles.panelHeader}>
          <h1 className={styles.panelTitle}>Messages</h1>
          <button
            className={styles.newChatButton}
            onClick={() => setShowModal(true)}
            aria-label="New chat"
          >
            <Icon name="plus" size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <Icon name="search" size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search conversations..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
        </div>

        {/* Chat List */}
        <div className={styles.chatList}>
          {chats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`${styles.chatItem} ${activeChat?.id === chat.id ? styles.active : ''}`}
                onClick={() => handleChatClick(chat)}
              >
                <img
                  src={chat.imageSrc}
                  alt={chat.name}
                  className={styles.chatAvatar}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/ProfileImage.jpg";
                  }}
                />
                <div className={styles.chatInfo}>
                  <div className={styles.chatHeader}>
                    <span className={styles.chatName}>{chat.name}</span>
                    <span className={styles.chatTime}>
                      {new Date(chat.time).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={styles.chatPreview}>{chat.lastMessage}</p>
                </div>
                {unreadMap[chat.id] > 0 && (
                  <span className={styles.unreadBadge} />
                )}
                <button
                  className={styles.removeChatButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                  aria-label="Remove conversation"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <Icon name="message" size={48} />
              <h3>No conversations yet</h3>
              <p>Start chatting with other VFJC members!</p>
              <button
                className={styles.startChatButton}
                onClick={() => setShowModal(true)}
              >
                Start a Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window Panel */}
      <div className={`${styles.chatPanel} ${activeChat ? styles.showOnMobile : ''}`}>
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            onClose={() => setActiveChat(null)}
            setUnreadMap={setUnreadMap}
            setHasNewDm={setHasNewDm}
          />
        ) : (
          <div className={styles.noChatSelected}>
            <Icon name="message" size={64} />
            <h2>Chat with your Volunteer Orgs!</h2>
            <p>Select a conversation or start a new one to begin messaging.</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showModal && (
        <ChatModal
          currUserId={(() => {
            const userData = JSON.parse(localStorage.getItem("user"));
            return userData.id ? userData.id : -1;
          })()}
          onClose={() => setShowModal(false)}
          title="New Chat"
          onUserSelect={handleStartChat}
        />
      )}
    </div>
  );
}
