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
  