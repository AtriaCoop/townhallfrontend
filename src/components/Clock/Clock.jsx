import { useState, useEffect } from 'react';
import styles from './Clock.module.scss';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for Vancouver (Pacific Time)
  const vancouverTime = time.toLocaleString('en-US', {
    timeZone: 'America/Vancouver',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={styles.clock}>
      <span className={styles.time}>{vancouverTime}</span>
      <span className={styles.timezone}></span>
    </div>
  );
}
