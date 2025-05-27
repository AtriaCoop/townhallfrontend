import styles from './ChatWindow.module.scss';

export default function ChatWindow({ chat, onClose }) {
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
                <div className={styles.messageIncoming}>Hey there!</div>
                <div className={styles.messageOutgoing}>Hi! What's up?</div>
                <div className={styles.messageIncoming}>Just checking in.</div>
            </div>

            <div className={styles.inputArea}>
                <input type="text" placeholder="Type your message..." />
                <button>Send</button>
            </div>
        </div>
    );
}
