/**
 * Safely retrieves and parses the user object from localStorage.
 * Returns null if no user is stored or if the stored value is corrupted.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
