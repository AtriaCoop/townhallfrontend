import React from 'react'
import styles from './DynamicAvatar.module.scss'
import Image from 'next/image'

const DynamicAvatar = ({fullName, profileImage}) => {
    const colors = ["#F44336", "#39BF47", "#9C27B0", "#3F51B5", "#2196F3", "#009688", "#FF9800"]
    
    // Using the name to pick a random color but consistent for each user
    const getColorFromName = () => {
        if (!fullName) return 
        const charCodeSum = fullName.charCodeAt(0); // just use first letter
        const index = charCodeSum % colors.length;
        return colors[index];
    }

    const initial = fullName[0]
    const color = getColorFromName()



  return (
    <div className={styles.profilePlaceholder} style={{ '--bg-color': profileImage ? 'transparent' : color }}>

        { profileImage ? (
            <Image
                src={profileImage}
                alt='user profile image'
            />
        ) : (
            <>
                {initial}
            </>
        ) }
    </div>
  )
}

export default DynamicAvatar