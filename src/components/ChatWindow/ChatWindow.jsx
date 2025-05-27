import styles from './ChatWindow.module.scss';
import { useState } from 'react';

export default function ChatWindow({ chat, onClose }) {

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSend = () => {
        if (inputText.trim() === '') return;

        setMessages(prev => [...prev, { text: inputText, type: 'outgoing' }]);
        setInputText('');
    }

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

            {/* dynamic rendering of fake incoming messages*/}
            <div className={styles.messages}>
                {messages.map((msg, idx) => (
                    <div
                    key={idx}
                    className={
                        msg.type === 'incoming'
                        ? styles.messageIncoming
                        : styles.messageOutgoing
                    }
                    >
                    {msg.text}
                    </div>
                ))}
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
