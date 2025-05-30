import styles from './ChatWindow.module.scss';
import { useState, useEffect, useRef } from 'react';

export default function ChatWindow({ chat, onClose, setUnreadMap }) {

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState(chat.messages || []);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = userData.id; 

    useEffect(() => {
        const fetchMessages = async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/chats/${chat.id}/messages/`);
            const data = await res.json();
      
            const formatted = data.messages.map((m) => ({
              text: m.content,
              sender: m.user,
            }));
      
            setMessages(formatted); // Replace with saved messages
          } catch (err) {
            console.error("Failed to load past messages:", err);
          }
        };
      
        fetchMessages();
      }, [chat.id]);      

    useEffect(() => {
        const socketUrl = `ws://127.0.0.1:8000/ws/chats/${chat.id}/`;
    
        socketRef.current = new WebSocket(socketUrl);
    
        socketRef.current.onmessage = (e) => {
          const data = JSON.parse(e.data);
          setMessages((prev) => [...prev, { text: data.message, sender: data.sender }]);
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
                    {msg.text}
                    </div>
                ))}
                
                {/* Scroll to bottom */}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
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
