import styles from './ChatWindow.module.scss';
import { useState, useEffect, useRef } from 'react';
import Icon from '@/icons/Icon';
import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';
import MessageModal from '@/components/MessageModal/MessageModal';
import UpdateMessageModal from '../UpdateMessageModal/UpdateMessageModal';
import MessageInput from '@/components/MessageInput/MessageInput';
import { formatRelativeTime, formatExactTime } from '@/utils/formateDatetime';


// Formats URLs in message text as clickable links
function formatMessageWithLinks(text) {
  return (
    <p>
      {text.split(/(\s+)/).map((part, i) =>
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
}

export default function ChatWindow({ chat, onClose, setUnreadMap, setHasNewDm }) {

    const [messages, setMessages] = useState(chat.messages || []);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showUpdateMessageModal, setShowUpdateMessageModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const handleMessageClick = (msg) => {
      setShowMessageModal(true);
      setSelectedMessage(msg);
    };

    const handleEditClick = () => {
      setShowMessageModal(false);
      setShowUpdateMessageModal(true);
    };

    const handleDeleteClick = async () => {
      if (!selectedMessage) return;
      try {
        const res = await authenticatedFetch(`${BASE_URL}/chats/messages/${selectedMessage.id}/`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
        } else {
          console.error("Delete failed:", data.message);
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
      setShowMessageModal(false);
      setSelectedMessage(null);
    };

    const handleUpdateMessage = (msgId, newText) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: newText } : m))
      );
    };

    const socketRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = userData.id;

    useEffect(() => {
      if (!chat?.id) return;

      setUnreadMap(prev => {
        const updated = { ...prev, [chat.id]: 0 };
        const stillUnread = Object.entries(updated).some(([_, count]) => count > 0);
        setHasNewDm(stillUnread);
        return updated;
      });
    }, [chat?.id]);

    useEffect(() => {
        const fetchMessages = async () => {
          try {
            const res = await authenticatedFetch(`${BASE_URL}/chats/${chat.id}/messages/`);
            const data = await res.json();

            const formatted = data.messages.map((m) => ({
              text: m.content,
              sender: m.user?.id,
              id: m.id,
              timestamp: m.sent_at,
            }));

            setMessages(formatted);
          } catch (err) {
            console.error("Failed to load past messages:", err);
          }
        };

        fetchMessages();
      }, [chat.id]);

    useEffect(() => {
        const socketUrl = `${process.env.NEXT_PUBLIC_WS_BASE}/ws/chats/${chat.id}/`;

        socketRef.current = new WebSocket(socketUrl);

        socketRef.current.onmessage = (e) => {
          const data = JSON.parse(e.data);
          // Skip own messages — already added optimistically in handleSend
          if (data.sender_id === currentUserId) return;
          setMessages((prev) => [...prev, {
            text: data.message,
            sender: data.sender_id,
            id: data.id,
            timestamp: data.timestamp || new Date().toISOString(),
          }]);
        };

        socketRef.current.onclose = () => {
          console.log('WebSocket closed');
        };

        return () => {
          socketRef.current.close();
        };
    }, [chat.id]);

    const handleSend = async (inputText, selectedImage) => {
      if (!inputText.trim() && !selectedImage) return;

      const formData = new FormData();
      formData.append("chat_id", chat.id);
      formData.append("content", inputText);
      if (selectedImage) formData.append("image_content", selectedImage);

      const res = await authenticatedFetch(`${BASE_URL}/chats/send/`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Optimistic update — add message to local state immediately
        if (data.data.content?.trim()) {
          setMessages((prev) => [...prev, {
            text: data.data.content,
            sender: data.data.sender,
            id: Date.now(),
            timestamp: data.data.timestamp,
          }]);
          socketRef.current.send(
            JSON.stringify({
              message: data.data.content,
              sender: data.data.sender,
            })
          );
        }

        if (data.data.image) {
          const imgText = `<img src="${data.data.image}" alt="image" />`;
          setMessages((prev) => [...prev, {
            text: imgText,
            sender: data.data.sender,
            id: Date.now() + 1,
            timestamp: data.data.timestamp,
          }]);
          socketRef.current.send(
            JSON.stringify({
              message: imgText,
              sender: data.data.sender,
            })
          );
        }
      } else {
        console.error("Message send failed:", data.error);
      }
    };

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={styles.chatWindow}>
            <div className={styles.header}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Back to conversations">
                    <Icon name="arrowleft" size={20} />
                </button>
                <img
                    src={chat.imageSrc}
                    alt={chat.name}
                    className={styles.avatar}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/ProfileImage.jpg";
                    }}
                />
                <div>
                    <h2>{chat.name}</h2>
                    <p>{chat.title}</p>
                </div>
            </div>

            <div className={styles.messages} ref={messagesContainerRef}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.sender === currentUserId
                      ? styles.messageOutgoing
                      : styles.messageIncoming
                  }
                >
                  <div className={styles.messageContent}>
                    {msg.text.startsWith("<img") ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                    ) : (
                      formatMessageWithLinks(msg.text)
                    )}

                    {msg.sender === currentUserId && (
                      <button
                        className={styles.optionsButton}
                        onClick={() => handleMessageClick(msg)}
                      >
                        &#x22EF;
                      </button>
                    )}
                  </div>
                  {msg.timestamp && (
                    <span
                      className={styles.messageTimestamp}
                      title={formatExactTime(msg.timestamp)}
                    >
                      {formatRelativeTime(msg.timestamp)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {showMessageModal && (
              <MessageModal
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onClose={() => setShowMessageModal(false)}
              />
            )}

            {showUpdateMessageModal && (
              <UpdateMessageModal
                msg={selectedMessage}
                onCancel={() => setShowUpdateMessageModal(false)}
                onUpdate={handleUpdateMessage}
              />
            )}

            <MessageInput
              onSend={handleSend}
              placeholder="Type your message..."
            />
        </div>
    );
}
