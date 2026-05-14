import React from 'react'
import Activities from '@/components/Activities/Activities'
import styles from './ActivityLogsPage.module.scss'

const ActivityLogsPage = () => {
    return (
        <div className={styles.activitiesPage}>
            <Activities />
        </div>
    )
}

export default ActivityLogsPage