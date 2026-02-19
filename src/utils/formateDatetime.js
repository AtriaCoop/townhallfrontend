export const formatReadableDateTime = (input) => {
   // Convert input to a Date object if it's a string
  const dateObj = input instanceof Date ? input : new Date(input);

  // Full date
  const date = dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Shortened date (e.g., "Apr 27")
  const shortenedDate = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  // Time
  const time = dateObj.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return { date, shortenedDate, time };
}

export const formatRelativeTime = (input) => {
  const dateObj = input instanceof Date ? input : new Date(input);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffWeek < 52) return `${diffWeek}w`;
  return dateObj.toLocaleDateString();
};

export const formatExactTime = (input) => {
  const dateObj = input instanceof Date ? input : new Date(input);
  return dateObj.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
