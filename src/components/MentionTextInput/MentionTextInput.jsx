import { useMentionInput } from '@/hooks/useMentionInput'
import React from 'react'
import DynamicAvatar from '../DynamicAvatar/DynamicAvatar'

const MentionTextInput = ({ 
    placeholder = "Type your message...",
    onSubmit,
    inputClassName = "",
    formClassName = "",
    buttonContainerClassName = "",
    buttonClassName = "",
    mentionWrapperClassName = "",
    mentionClassName = "",
    mentionChipClassName = "",
    showSubmitButton = true,
    submitButtonText = "POST"
  }) => {

    // Destructure values from custom hook
    const {input, divRef, showMentionUI, mentionResults, handleInput, handleMentionSelect, clearInput} = useMentionInput("", mentionChipClassName)

    // Uses the onSubmit function that was given
    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(input);
            clearInput();
        }
    };

  return (
    <>
        <form className={formClassName} onSubmit={handleSubmitForm}>
            <div
            ref={divRef}
            contentEditable
            className={inputClassName}
            onInput={handleInput}
            placeholder={placeholder}
            />
            {showSubmitButton && (
            <div className={buttonContainerClassName}>
                <button type="submit" className={buttonClassName}>
                {submitButtonText}
                </button>
            </div>
            )}
        </form>
        
        {/* Mention Dropdown */}
        {showMentionUI && mentionResults.length > 0 && (
            <div className={mentionWrapperClassName}>
                {mentionResults.map(user => (
                    <div 
                    key={user.id} 
                    className={mentionClassName} 
                    onClick={() => handleMentionSelect(user)}
                    >
                    <DynamicAvatar 
                        fullName={user.full_name} 
                        profileImage={user.profile_image} 
                    />
                    <p>{user.full_name}</p>
                    </div>
                ))}
            </div>
        )}
    </>  
    )
}

export default MentionTextInput