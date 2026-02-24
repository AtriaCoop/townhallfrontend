import styles from "@/pages/GroupChatsPage/GroupChatsPage.module.scss";
import MessageBubble from "@/components/MessageBubble/MessageBubble";
import JoinGroupModal from "@/components/JoinGroupModal/JoinGroupModal";
import MessageModal from "@/components/MessageModal/MessageModal";
import UpdateMessageModal from "@/components/UpdateMessageModal/UpdateMessageModal";
import MessageInput from "@/components/MessageInput/MessageInput";
import { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import Icon from "@/icons/Icon";
import { authenticatedFetch } from "@/utils/authHelpers";
import { BASE_URL } from "@/constants/api";
import { formatGroupName } from "@/utils/formatGroupName";
import { formatRelativeTime, formatExactTime } from "@/utils/formateDatetime";

export default function GroupChatsPage() {
  const socketRef = useRef(null);
  const messageContainerRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState("");
  const [groupMessages, setGroupMessages] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUserId(Number(userData.id));
    }
  }, []);

  useEffect(() => {
    if (!activeGroup || !currentUserId) return;

    const fetchGroupMessages = async () => {
      const res = await authenticatedFetch(
        `${BASE_URL}/groups/${activeGroup}/messages/`
      );
      const data = await res.json();

      const formatted = data.messages.map((msg) => ({
        id: msg.id,
        sender_id: msg.sender,
        avatar: msg.profile_image || "/assets/ProfileImage.jpg",
        sender: msg.sender === currentUserId ? "You" : msg.full_name,
        organization: msg.organization || "",
        timestamp: msg.timestamp,
        message: msg.content,
        image: msg.image || null,
      }));

      setGroupMessages((prev) => ({ ...prev, [activeGroup]: formatted }));
    };

    fetchGroupMessages();
  }, [activeGroup, currentUserId]);

  useEffect(() => {
    if (!activeGroup || !currentUserId) return;

    const socketUrl = `${process.env.NEXT_PUBLIC_WS_BASE}/ws/groups/${activeGroup}/`;
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // Skip own messages — already added optimistically in handleSendMessage
      if (data.sender_id === currentUserId) return;

      const newMsg = {
        id: data.id || uuidv4(),
        sender_id: data.sender_id,
        avatar: data.profile_image || "/assets/ProfileImage.jpg",
        sender: data.full_name,
        organization: data.organization || "Atria",
        timestamp: new Date().toISOString(),
        message: data.message,
      };

      setGroupMessages((prev) => {
        const updated = { ...prev };
        if (!updated[activeGroup]) updated[activeGroup] = [];
        updated[activeGroup] = [...updated[activeGroup], newMsg];
        return updated;
      });
    };

    socketRef.current.onclose = () => {
      console.log(`WebSocket closed for group: ${activeGroup}`);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [activeGroup]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedGroups = JSON.parse(
      localStorage.getItem("joinedGroups") || "[]"
    );
    const storedActive = localStorage.getItem("activeGroup");

    setJoinedGroups(storedGroups);
    if (storedActive) setActiveGroup(storedActive);
  }, []);

  // Save joined groups to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("joinedGroups", JSON.stringify(joinedGroups));
  }, [joinedGroups]);

  // Save active group to localStorage when it changes
  useEffect(() => {
    if (activeGroup) {
      localStorage.setItem("activeGroup", activeGroup);
    }
  }, [activeGroup]);

  const handleJoinGroup = (groupName) => {
    if (!joinedGroups.includes(groupName)) {
      setJoinedGroups((prev) => [...prev, groupName]);
    }
    setActiveGroup(groupName);
    setShowModal(false);
  };

  const handleChatClick = () => {
    setShowModal(true);
  };

  const handleLeaveGroup = () => {
    if (!activeGroup) return;

    const updatedGroups = joinedGroups.filter((group) => group !== activeGroup);
    setJoinedGroups(updatedGroups);
    setActiveGroup(updatedGroups[0] || "");
    localStorage.setItem("joinedGroups", JSON.stringify(updatedGroups));
    if (updatedGroups.length === 0) localStorage.removeItem("activeGroup");
  };

  // Derive unique participants from fetched messages
  const activeParticipants = useMemo(() => {
    const msgs = groupMessages[activeGroup] || [];
    const seen = new Map();
    msgs.forEach((msg) => {
      if (msg.sender_id && msg.sender !== "You") {
        seen.set(msg.sender_id, { name: msg.sender, avatar: msg.avatar });
      }
    });
    return Array.from(seen.values());
  }, [groupMessages, activeGroup]);

  const handleSendMessage = async (inputText, selectedImage) => {
    if (!inputText.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append("group_name", activeGroup);
    formData.append("content", inputText);
    if (selectedImage) formData.append("image", selectedImage);

    const res = await authenticatedFetch(
      `${BASE_URL}/groups/messages/`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (data?.data) {
      const newMsg = {
        id: data.data.id,
        sender_id: data.data.sender,
        avatar: data.data.profile_image || "/assets/ProfileImage.jpg",
        sender:
          data.data.sender === currentUserId ? "You" : data.data.full_name,
        organization: data.data.organization || "Atria",
        timestamp: new Date().toISOString(),
        message: data.data.content,
        image: data.data.image,
      };

      setGroupMessages((prev) => {
        const updated = { ...prev };
        updated[activeGroup] = [...(updated[activeGroup] || []), newMsg];
        return updated;
      });

      // Broadcast via WebSocket so other users see the message in real-time
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            message: data.data.content,
            sender: data.data.sender,
          })
        );
      }
    }
  };

  const handleMessageOptionsClick = (msg) => {
    setSelectedMessage(msg);
    setShowMessageModal(true);
  };

  const handleEditClick = () => {
    setShowMessageModal(false);
    setShowUpdateModal(true);
  };

  const handleDeleteClick = async () => {
    if (!selectedMessage) return;
    try {
      const res = await authenticatedFetch(
        `${BASE_URL}/groups/messages/${selectedMessage.id}/`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setGroupMessages((prev) => {
          const updated = { ...prev };
          updated[activeGroup] = (updated[activeGroup] || []).filter(
            (m) => m.id !== selectedMessage.id
          );
          return updated;
        });
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const handleUpdateMessage = (msgId, newText) => {
    setGroupMessages((prev) => {
      const updated = { ...prev };
      updated[activeGroup] = (updated[activeGroup] || []).map((m) =>
        m.id === msgId ? { ...m, message: newText } : m
      );
      return updated;
    });
  };

  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [groupMessages, activeGroup]);

  return (
    <div className={styles.container}>
      {/* Group Chats Sidebar */}
      <div className={styles.groupChatsSidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Group Chats</h2>
          <button
            className={styles.joinButton}
            onClick={handleChatClick}
            aria-label="Join a group"
          >
            <Icon name="plus" size={20} />
          </button>
        </div>

        <div className={styles.chatList}>
          {joinedGroups.length === 0 ? (
            <p className={styles.noChats}>No groups joined yet...</p>
          ) : (
            joinedGroups.map((group, idx) => (
              <button
                key={idx}
                className={`${styles.chatItem} ${group === activeGroup ? styles.chatItemActive : ''}`}
                onClick={() => setActiveGroup(group)}
              >
                {formatGroupName(group)}
              </button>
            ))
          )}
        </div>
      </div>

      <div className={styles.chatWrapper}>
        {activeGroup ? (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.headerLeft}>
                <h2 className={styles.chatTitle}>{formatGroupName(activeGroup)}</h2>
                {activeParticipants.length > 0 && (
                  <span className={styles.memberCount}>
                    {activeParticipants.length + 1} participants
                  </span>
                )}
              </div>
              <div className={styles.chatIcons}>
                {searchMode && (
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchMode(false);
                        setSearchQuery("");
                      }
                    }}
                  />
                )}
                <button
                  className={styles.iconButton}
                  onClick={() => setSearchMode((prev) => !prev)}
                >
                  <Icon name="search" />
                </button>
                <button className={styles.iconButton} onClick={handleLeaveGroup}>
                  <Icon name="leave" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={messageContainerRef} className={styles.messageContainer}>
              {(groupMessages[activeGroup] || [])
                .filter((msg) =>
                  msg.message.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((msg) => {
                  const linkedText = (
                    <p>
                      {msg.message.split(/(\s+)/).map((part, i) =>
                        /^https?:\/\/\S+$/.test(part) ? (
                          <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                            {part}
                          </a>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  );

                  if (msg.sender === "You") {
                    return (
                      <div key={msg.id} className={styles.messageOutgoing}>
                        <div className={styles.messageContent}>
                          {linkedText}
                          {msg.image && (
                            <img src={msg.image} alt="attachment" className={styles.chatImage} />
                          )}
                          <button
                            className={styles.optionsButton}
                            onClick={() => handleMessageOptionsClick(msg)}
                          >
                            &#x22EF;
                          </button>
                        </div>
                        {msg.timestamp && (
                          <span className={styles.messageTimestamp} title={formatExactTime(msg.timestamp)}>
                            {formatRelativeTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={styles.messageIncoming}>
                      <MessageBubble
                        avatar={msg.avatar}
                        sender={msg.sender}
                        senderId={msg.sender_id}
                        organization={msg.organization}
                        timestamp={msg.timestamp}
                        message={
                          <div>
                            {linkedText}
                            {msg.image && (
                              <img src={msg.image} alt="attachment" className={styles.chatImage} />
                            )}
                          </div>
                        }
                      />
                    </div>
                  );
                })}
              <div />
            </div>

            {/* Chat Input */}
            <MessageInput
              onSend={handleSendMessage}
              placeholder="Type your message..."
            />
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <Icon name="message" size={64} />
            <h2>Join a Group Chat</h2>
            <p>Select a group from the sidebar or join a new one to start chatting.</p>
          </div>
        )}

        {showModal && (
          <JoinGroupModal
            onClose={() => setShowModal(false)}
            onJoinGroup={handleJoinGroup}
            title="Join Groups"
          />
        )}

        {showMessageModal && (
          <MessageModal
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onClose={() => {
              setShowMessageModal(false);
              setSelectedMessage(null);
            }}
          />
        )}

        {showUpdateModal && selectedMessage && (
          <UpdateMessageModal
            msg={{ id: selectedMessage.id, text: selectedMessage.message }}
            onCancel={() => {
              setShowUpdateModal(false);
              setSelectedMessage(null);
            }}
            onUpdate={handleUpdateMessage}
            apiUrl={`${BASE_URL}/groups/messages/${selectedMessage.id}/`}
          />
        )}
      </div>
    </div>
  );
}
