import { useGetActivities } from '@/api/activity'
import React, { useEffect, useState } from 'react'
import {formatReadableDateTime} from '@/utils/formateDatetime'
import styles from '@/components/Activities/Activities.module.scss'


const Activities = () => {
    const [userId, setUserId] = useState(null)

    // Get user ID from localStorage safely (client-side only)
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        if (userData && userData.id) {
            setUserId(userData.id)
        }
    }, [])

    // Destructure custom Hook
    const { activities, loading, error, refetch } = useGetActivities(userId)

 

  return (
    <div className={styles.activitiesWrapper}>
        <h2>Recent Activities</h2>
            <div className={styles.timeline}>
                {activities && activities.length > 0 ? (
                    activities.map( (activity, index) => {
                        const { shortenedDate, time } = formatReadableDateTime(activity.activity.history_date);

                         // Get previous activity date
                        const prevActivity = activities[index - 1];
                        const prevDate =
                            prevActivity
                                ? formatReadableDateTime(prevActivity.activity.history_date).shortenedDate
                                : null;

                        // Only show date label if different from previous
                        const showDate = shortenedDate !== prevDate;


                        
                        return (
                            <div key={activity.id} className={styles.dateGroup}>
                                { showDate && (
                                    <div className={styles.dateLabel}>{shortenedDate}</div>
                                ) }
                                        <div  className={styles.activityCard}>
                                            <div className={styles.date}>
                                                <p>{time}</p>
                                            </div>
                                            <p className={styles.description}>{activity.description}</p>
                                        </div>
                            </div>
                            )
                    })
                ) : (
                    <div>No activities found</div>
                )}
            </div>
    </div>
  )
}

export default Activities