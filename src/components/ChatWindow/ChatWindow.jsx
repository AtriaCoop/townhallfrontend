import styles from './ChatWindow.module.scss';
import { useState, useEffect, useRef } from 'react';
import EmojiPickerButton from '@/components/EmojiPickerButton/EmojiPickerButton';
import { FaImage } from 'react-icons/fa';

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

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/chats/${chat.id}/messages/`);
            const data = await res.json();
      
            const formatted = data.messages.map((m) => ({
              text: m.content,
              sender: m.user?.id,
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
          setMessages((prev) => [...prev, { text: data.message, sender: data.sender_id, }]);
        };
    
        socketRef.current.onclose = () => {
          console.log('WebSocket closed');
        };
    
        return () => {
          socketRef.current.close();
        };
    }, [chat.id]);

    const handleSend = () => {
        if (inputText.trim() === '') return;
      
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              message: inputText,
              sender: currentUserId,
            })
          );
          setInputText('');
        } else {
          console.warn("WebSocket is not open yet.");
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages]);
    

    return (
        <div className={styles.chatWindow}>
            <div className={styles.header}>
                <img src={chat.imageSrc} alt={chat.name} className={styles.avatar} />
                <div>
                    <h2>{chat.name}</h2>
                    <p>{chat.title}</p>
                </div>
                <button className={styles.closeButton} onClick={onClose}>X</button>
            </div>

            <div className={styles.messages}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={
                            msg.sender === currentUserId
                            ? styles.messageOutgoing
                            : styles.messageIncoming
                        }
                    >
                    {formatMessageWithLinks(msg.text)}
                    </div>
                ))}
                
                {/* Scroll to bottom */}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
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
                <button onClick={handleSend}>Send</button>
            </div>

        </div>
    );
}
