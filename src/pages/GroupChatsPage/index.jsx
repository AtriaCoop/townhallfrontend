import Navigation from "@/components/Navigation/Navigation"
import styles from '@/pages/GroupChatsPage/GroupChatsPage.module.scss'
import MessageBubble from "@/components/MessageBubble/MessageBubble";
import JoinGroupModal from "@/components/JoinGroupModal/JoinGroupModal"
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EmojiPickerButton from '@/components/EmojiPickerButton/EmojiPickerButton';
import { FaImage } from 'react-icons/fa';
import { getCookie, fetchCsrfToken } from '@/utils/authHelpers'; 

export default function GroupChatsPage({ hasNewDm }) {

    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_ID;

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const postImageRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState('');
    const [inputText, setInputText] = useState('');
    const [groupMessages, setGroupMessages] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);
    const [searchMode, setSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // DISABLE GLOBAL SCROLL JUST FOR THIS PAGE
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
          document.body.style.overflow = '';
        };
      }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            setCurrentUserId(userData.id);
        }
    }, []);

    useEffect(() => {
        if (!activeGroup || !currentUserId) return;
      
        const fetchGroupMessages = async () => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/groups/${activeGroup}/messages/`);
          const data = await res.json();
      
          const formatted = data.messages.map((msg) => ({
            id: uuidv4(),
            avatar: msg.profile_image || "/assets/ProfileImage.jpg",
            sender: msg.sender === currentUserId ? "You" : msg.full_name,
            organization: msg.organization || "",
            timestamp: new Date(msg.timestamp).toLocaleTimeString(),
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
            console.log("Incoming WebSocket data:", data);
    
            const newMsg = {
                id: uuidv4(),
                sender_id: data.sender_id,
                avatar: data.profile_image || "/assets/ProfileImage.jpg",
                sender: data.sender_id === currentUserId ? "You" : data.full_name,
                organization: data.organization || "Atria",
                timestamp: "just now",
                message: data.message,
              };              
    
            setGroupMessages(prev => {
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
        const storedGroups = JSON.parse(localStorage.getItem("joinedGroups") || "[]");
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
            setJoinedGroups(prev => [...prev, groupName]);
        }
        setActiveGroup(groupName);
        setShowModal(false);
    };

    const handleChatClick = () => {
        setShowModal(true);
    }

    const handleLeaveGroup = () => {
        if (!activeGroup) return;
      
        // Filter out the group we're leaving
        const updatedGroups = joinedGroups.filter(group => group !== activeGroup);
        setJoinedGroups(updatedGroups);
      
        // Clear the active group
        setActiveGroup('');
      
        // Update localStorage directly (optional: redundant due to useEffect)
        localStorage.setItem("joinedGroups", JSON.stringify(updatedGroups));
        localStorage.removeItem("activeGroup");
    };

    const [selectedImage, setSelectedImage] = useState(null);

    const handleSendMessage = async () => {
        if (!inputText.trim() && !selectedImage) return;

        const csrfToken = await fetchCsrfToken();
      
        const formData = new FormData();
        formData.append("group_name", activeGroup);
        formData.append("content", inputText);
        if (selectedImage) formData.append("image", selectedImage);
      
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/groups/messages/`, {
            method: "POST",
            credentials: "include",
            headers: {
              "X-CSRFToken": csrfToken,
            },
            body: formData,
        });
      
        const data = await res.json();
        if (data?.data) {
          const newMsg = {
            id: uuidv4(),
            sender_id: data.data.sender,
            avatar: data.data.profile_image || "/assets/ProfileImage.jpg",
            sender: data.data.sender === currentUserId ? "You" : data.data.full_name,
            organization: data.data.organization || "Atria",
            timestamp: "just now",
            message: data.data.content,
            image: data.data.image,
          };
      
          setGroupMessages((prev) => {
            const updated = { ...prev };
            updated[activeGroup] = [...(updated[activeGroup] || []), newMsg];
            return updated;
          });
        }
      
        setInputText('');
        setSelectedImage(null);
      };

      useEffect(() => {
        const interval = setInterval(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100); // hammer it every 100ms
      
        // Stop after 2 seconds (enough time for images/rendering)
        const timeout = setTimeout(() => clearInterval(interval), 2000);
      
        return () => {
          clearInterval(interval);
          clearTimeout(timeout);
        };
      }, [groupMessages, activeGroup]);    

    return (
        <div className={styles.container}>
            <Navigation hasNewDm={hasNewDm} />

            {/* Group Chats Sidebar */}
            <div className={styles.groupChatsSidebar}>
                <h2>Group Chats</h2>
                <button className={styles.joinButton} onClick={handleChatClick}>+ JOIN A GROUP</button>

                <div className={styles.chatList}>
                    {joinedGroups.length === 0 ? (
                        <p className={styles.noChats}>No groups joined yet...</p>
                    ) : (
                        joinedGroups.map((group, idx) => (
                            <button 
                                key={idx}
                                className={styles.chatItem}
                                onClick={() => setActiveGroup(group)}
                            >
                                {group}
                            </button>
                        ))
                    )}
                </div>

            </div>

            <div className={styles.chatWrapper}>
                {/* Chat Header */}
                <div className={styles.chatHeader}>
                    <h2 className={styles.chatTitle}>
                        {activeGroup}
                    </h2>
                    <div className={styles.chatIcons}>
                        {searchMode && (
                            <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                setSearchMode(false);
                                setSearchQuery('');
                                }
                            }}
                            />
                        )}
                        <img
                            className={styles.search}
                            src="/assets/search.png"
                            alt="Search"
                            onClick={() => setSearchMode((prev) => !prev)}
                        />
                        <img
                            className={styles.exit}
                            src="/assets/exit.png"
                            alt="Exit"
                            onClick={handleLeaveGroup}
                        />
                    </div>
                </div>

                {showModal && (
                    <JoinGroupModal 
                        onClose={() => setShowModal(false)}
                        onJoinGroup={handleJoinGroup}
                        title="Join Groups"
                    />
                )}

                {/* Message Bubble */}
                <div className={styles.messageContainer}>
                    {(groupMessages[activeGroup] || [])
                    .filter(msg =>
                        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((msg) => (
                        <div
                        key={msg.id}
                        className={
                            msg.sender === "You"
                            ? styles.messageOutgoing
                            : styles.messageIncoming
                        }
                        >
                        <MessageBubble
                        avatar={msg.avatar}
                        sender={msg.sender}
                        organization={msg.organization}
                        timestamp={msg.timestamp}
                        message={
                            <div>
                            {/* Text with hyperlinking */}
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

                            {/* Conditionally show image */}
                            {msg.image && (
                                <img
                                src={msg.image}
                                alt="attachment"
                                className={styles.chatImage}
                                />
                            )}
                            </div>
                        }
                        />
                    </div>
                ))}
                <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className={styles.chatInputContainer}>
                <EmojiPickerButton onSelect={(emoji) => setInputText(prev => prev + emoji)} />
                <button className={styles.iconButton} onClick={() => postImageRef.current.click()}>
                    <FaImage />
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={postImageRef}
                    hidden
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if(file) setSelectedImage(file);
                    }}
                />

                {selectedImage && (
                <div className={styles.imagePreviewWrapper}>
                    <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="preview"
                    className={styles.previewImage}
                    />
                    <button
                    className={styles.removePreviewButton}
                    onClick={() => setSelectedImage(null)}
                    type="button"
                    >
                    ×
                    </button>
                </div>
                )}
                
                    <input
                        type="text"
                        className={styles.chatInput}
                        placeholder="Enter message"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className={styles.sendButton} onClick={handleSendMessage}>
                        <img src="/assets/send.png" alt="Send" />
                    </button>
                </div>
            </div>
        </div>
    )
}