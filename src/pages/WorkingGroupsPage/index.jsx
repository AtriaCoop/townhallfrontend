import styles from "@/pages/WorkingGroupsPage/WorkingGroupsPage.module.scss";
import MessageBubble from "@/components/MessageBubble/MessageBubble";
import JoinGroupModal from "@/components/JoinGroupModal/JoinGroupModal";
import MessageModal from "@/components/MessageModal/MessageModal";
import UpdateMessageModal from "@/components/UpdateMessageModal/UpdateMessageModal";
import CreateGroupChatModal from "@/components/CreateGroupChatModal/CreateGroupChatModal";
import ListMembersModal from "@/components/ListMembersModal/ListMembersModal";
import MessageInput from "@/components/MessageInput/MessageInput";
import { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import Icon from "@/icons/Icon";
import { authenticatedFetch } from "@/utils/authHelpers";
import { BASE_URL } from "@/constants/api";
import { formatGroupName } from "@/utils/formatGroupName";
import { formatRelativeTime, formatExactTime } from "@/utils/formateDatetime";

export default function WorkingGroupsPage() {
  const socketRef = useRef(null);
  const messageContainerRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState({id: null, name: null, participants: []});
  const [groupMessages, setGroupMessages] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUserId(Number(userData.id));
    }
  }, []);

  useEffect(() => {
    if (!activeGroup?.name || !currentUserId) return;

    const fetchGroupMessages = async () => {
      const res = await authenticatedFetch(
        `${BASE_URL}/groups/${activeGroup.name}/messages/`  // TODO: change endpoint in BE to use groupId
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

      setGroupMessages((prev) => ({ ...prev, [activeGroup.name]: formatted }));
    };

    fetchGroupMessages();
  }, [activeGroup, currentUserId]);

  useEffect(() => {
    if (!activeGroup?.name || !currentUserId) return;

    const socketUrl = `${process.env.NEXT_PUBLIC_WS_BASE}/ws/groups/${activeGroup.name}/`;
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
        if (!updated[activeGroup.name]) updated[activeGroup.name] = [];
        updated[activeGroup.name] = [...updated[activeGroup.name], newMsg];
        return updated;
      });
    };

    socketRef.current.onclose = () => {
      console.log(`WebSocket closed for group: ${activeGroup.name}`);
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

    const fetchGroups = async () => {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = Number(userData.id);
      const res = await authenticatedFetch(
        `${BASE_URL}/chats/?user_id=${userId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const chatsFromServer = data?.data || [];

      const customGroups = chatsFromServer.flatMap((c) => (c.is_group ? [{ id: c.id, name: c.name, participants: c.participants.map((p) => p.id) }] : []));
      setJoinedGroups(prev => [
        ...prev.filter(group => group.id < 0),
        ...customGroups,
      ]);
    }
    fetchGroups();

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

  const handleJoinGroup = (group) => {
    const participantIds = group.id > 0 ? group.participants : [];
    if (!joinedGroups.some((joinedGroup) => joinedGroup.id === group.id)) {
      setJoinedGroups((prev) => [...prev, {id: group.id, name: group.name, participants: participantIds}]);
    }
    setActiveGroup({id: group.id, name: group.name, participants: participantIds});
    setShowModal(false);
  };

  const handleChatClick = () => {
    setShowModal(true);
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup) return;

    if (activeGroup && activeGroup.id > 0) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const newParticipants = activeGroup.participants.filter((participant) => participant !== Number(userData.id));
      
      const response = await authenticatedFetch(`${BASE_URL}/chats/${activeGroup.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_ids:  newParticipants
        }),
      });

      const data = await response.json();
      if (
        !response.ok &&
        data.message?.includes("Chat must have at least two participants.")
      ) {
        alert("Cannot leave a group with only one participant. Group is hidden.");
      }
    }

    const updatedGroups = joinedGroups.filter((group) => group.id !== activeGroup.id);
    setJoinedGroups(updatedGroups);
    setActiveGroup(updatedGroups[0] || {id: null, name: null, participants: []});
    localStorage.setItem("joinedGroups", JSON.stringify(updatedGroups));
    if (updatedGroups.length === 0) localStorage.removeItem("activeGroup");
  };

  // Derive unique participants from fetched messages
  const activeParticipants = useMemo(() => {
    const msgs = groupMessages[activeGroup.name] || [];
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
    formData.append("group_name", activeGroup.name);
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
        updated[activeGroup.name] = [...(updated[activeGroup.name] || []), newMsg];
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
          updated[activeGroup.name] = (updated[activeGroup.name] || []).filter(
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
      updated[activeGroup.name] = (updated[activeGroup.name] || []).map((m) =>
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

  const handleGroupSelect = (group) => {
    setActiveGroup(group);
  };

  const handleBackToGroups = () => {
    setActiveGroup({id: null, name: null, participants: []});
  };

  const handleCreateGroup = async (groupName, selectedUsers) => {
    try {
      const res = await authenticatedFetch(`${BASE_URL}/chats/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${groupName}`,
          participants: [currentUserId, ...selectedUsers.map((user) => user.id)],
          is_group: true,
        }),
      });

      const data = await res.json();
      const chatData = data?.data;
      if (!chatData?.id) return;
      
      handleJoinGroup({id: chatData.id, name: chatData.name, participants: chatData.participants.map((participant) => participant.id)});
      setShowCreateGroupModal(false);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  }

  const showMembersList = () => {
    setShowMembersModal(true);
  };

  return (
    <div className={styles.container}>
      {/* Working Groups Sidebar */}
      <div className={`${styles.workingGroupsSidebar} ${activeGroup?.name ? styles.hideOnMobile : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Working Groups</h2>
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
                className={`${styles.chatItem} ${group.id === activeGroup.id ? styles.chatItemActive : ''}`}
                onClick={() => handleGroupSelect(group)}
              >
                {formatGroupName(group.name)}
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`${styles.chatWrapper} ${activeGroup?.id ? styles.showChatOnMobile : ''}`}>
        {activeGroup?.id ? (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <button className={styles.backButton} onClick={handleBackToGroups} aria-label="Back to groups">
                <Icon name="arrowleft" size={20} />
              </button>
              <div className={styles.headerLeft}>
                <h2 className={styles.chatTitle}>{formatGroupName(activeGroup.name)}</h2>
                {(activeGroup?.participants?.length > 0 || activeParticipants.length > 0) && (
                  <span className={styles.memberCount}>
                    {activeGroup.id > 0 ? activeGroup.participants.length : (activeParticipants.length + 1)} participants
                  </span>
                )}
              </div>
              <div className={styles.chatIcons}>
                {/* Members List */}
                <button className={styles.iconButton} onClick={showMembersList} >
                  <Icon name="members" />
                </button>
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
              {(groupMessages[activeGroup.name] || [])
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
                    <div key={msg.id} className={styles.messageIncomingGroup}>
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
            <h2>Join a Working Group</h2>
            <p>Select a group from the sidebar or join a new one to start chatting.</p>
          </div>
        )}

      </div>

      {showModal && (
        <JoinGroupModal
          onClose={() => setShowModal(false)}
          onJoinGroup={handleJoinGroup}
          onCreatingAGroup={() => {
            setShowModal(false);
            setShowCreateGroupModal(true);
          }}
          title="Join Groups"
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupChatModal
          onClose={() => setShowCreateGroupModal(false)}
          onCreateGroup={handleCreateGroup}
          currUserId={currentUserId}
          title="New Working Group"
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

      {showMembersModal && (
        <ListMembersModal
          onClose={() => setShowMembersModal(false)}
          memberIds={activeGroup?.participants || []}
        />
      )}
    </div>
  );
}
