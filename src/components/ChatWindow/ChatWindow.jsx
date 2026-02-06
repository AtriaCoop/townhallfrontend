import styles from './ChatWindow.module.scss';
import { useState, useEffect, useRef } from 'react';
import EmojiPickerButton from '@/components/EmojiPickerButton/EmojiPickerButton';
import Icon from '@/icons/Icon';
import { authenticatedFetch } from '@/utils/authHelpers';
import MessageModal from '@/components/MessageModal/MessageModal'
import UpdateMessageModal from '../UpdateMessageModal/UpdateMessageModal';


{/* Detected links and hyperlinks it */}
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

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState(chat.messages || []);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showUpdateMessageModal, setShowUpdateMessageModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const handleMessageClick = (msg) => {
      setShowMessageModal(true);
      console.log("msg: ", msg);
      setSelectedMessage(msg);
    };

    const handleEditClick = () => {
      setShowMessageModal(false);
      setShowUpdateMessageModal(true);
    };

    const socketRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const postImageRef = useRef(null);
    
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
            const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/chats/${chat.id}/messages/`);
            const data = await res.json();
      
            const formatted = data.messages.map((m) => ({
              text: m.content,
              sender: m.user?.id,
              id: m.id
            }));
      
            setMessages(formatted); // Replace with saved messages
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
          console.log("Incoming WebSocket data:", data);
          setMessages((prev) => [...prev, { text: data.message, sender: data.sender_id, id: data.id }]);
        };
    
        socketRef.current.onclose = () => {
          console.log('WebSocket closed');
        };
    
        return () => {
          socketRef.current.close();
        };
    }, [chat.id]);

    const handleSend = async () => {
      if (!inputText.trim() && !selectedImage) return;
    
      const formData = new FormData();
      formData.append("chat_id", chat.id);
      formData.append("content", inputText);
      if (selectedImage) formData.append("image_content", selectedImage);
    
      const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE}/chats/send/`, {
        method: "POST",
        body: formData,
      });
    
      const data = await res.json();
    
      if (data.success) {
        // Only send text if there's actual content
        if (data.data.content?.trim()) {
          socketRef.current.send(
            JSON.stringify({
              message: data.data.content,
              sender: data.data.sender,
            })
          );
        }
      
        // Only send image if it exists
        if (data.data.image) {
          socketRef.current.send(
            JSON.stringify({
              message: `<img src="${data.data.image}" alt="image" />`,
              sender: data.data.sender,
            })
          );
        }
      
        setInputText('');
        setSelectedImage(null);
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

                    {/* Three-dot button */}
                    <button
                      className={styles.optionsButton}
                      onClick={() => handleMessageClick(msg)}
                    >
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showMessageModal && (
              <MessageModal
                // {/* TODO: implement the delete message function */}
                onEdit={handleEditClick}
                onClose={() => setShowMessageModal(false)}
              />
            )}

            {showUpdateMessageModal && (
              <UpdateMessageModal
                msg={selectedMessage}
                onCancel={() => setShowUpdateMessageModal(false)}

              />
            )}

            <div className={styles.inputArea}>
            <EmojiPickerButton onSelect={(emoji) => setInputText(prev => prev + emoji)} />
            <button className={styles.iconButton} onClick={() => postImageRef.current.click()}>
              <Icon name="image" />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={postImageRef}
              hidden
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setSelectedImage(file);
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
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className={styles.sendButton} onClick={handleSend}>
                  <Icon name="send" />
                </button>
            </div>

        </div>
    );
}
