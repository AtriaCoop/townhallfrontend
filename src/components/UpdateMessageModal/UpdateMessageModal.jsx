import { useState, useRef, useEffect } from 'react';
import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';
import styles from './UpdateMessageModal.module.scss'

export default function UpdateMessageModal({ msg, onCancel }) {
    const id = msg.id;
    const [inputText, setInputText] = useState(msg.text || "");
    const [selectedImage, setSelectedImage] = useState(msg.image_content || null);
    const postImageRef = useRef(null);
    
    const handleUpdate = async () => {
        if (!inputText.trim() && !selectedImage) return;

        const formData = new FormData();
        formData.append("message_id", id);
        formData.append("content", inputText);
        if (selectedImage) formData.append("image_content", selectedImage);
            
              const res = await authenticatedFetch(`${BASE_URL}/chats/messages/${id}/`, {
                method: "PATCH",
                body: formData,
              });
            
              const data = await res.json();
            
              if (data.success) {
                setInputText('');
                setSelectedImage(null);
              } else {
                console.error("Message update failed:", data.error);
              }
    };

    useEffect(() => {
      if (!selectedImage) return;

      const objectUrl = URL.createObjectURL(selectedImage);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImage]);

    var ret = <></>;

    if (selectedImage) {
      ret = (
        <div className={styles.modalOverlay}>
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
        </div>
      );
    } else {
      ret = (
              <div className={styles.modalOverlay}>
                <input
                    type="text"
                    defaultValue={msg.text}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                />
                <button
                  onClick={() => {
                    handleUpdate();
                    onCancel();
                  }}
                >
                  Update
                </button>
                <button onClick={onCancel}>Cancel</button>
          </div>
      );
    }

    return (
        ret
    );
}