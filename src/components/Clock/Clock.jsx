import { useState, useEffect } from 'react';
import styles from './Clock.module.scss';

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [showLocalTime, setShowLocalTime] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user's local timezone
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Determine which timezone to display
  const currentTimezone = showLocalTime ? localTimezone : 'America/Vancouver';
  const label = showLocalTime ? 'Local Time:' : 'Time in Vancouver:';

  // Format time for the current timezone
  const formattedTime = time.toLocaleString('en-US', {
    timeZone: currentTimezone,
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={styles.clock}>
      <span className={styles.timezone}>{label}</span>
      <span className={styles.time}>{formattedTime}</span>
      <button 
        className={styles.segmentedControl}
        onClick={() => setShowLocalTime(!showLocalTime)}
        aria-label="Toggle between local time and Vancouver time"
        aria-pressed={showLocalTime}
      >
        <span className={styles.slider}></span>
        <span className={`${styles.segment} ${!showLocalTime ? styles.active : ''}`}>
          Vancouver
        </span>
        <span className={`${styles.segment} ${showLocalTime ? styles.active : ''}`}>
          Local
        </span>
      </button>
    </div>
  );
}
