/**
 * Shared reactions configuration
 * Single source of truth for reaction types used across the application
 */
export const REACTIONS = [
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'appreciate', emoji: '🤲', label: 'Appreciate' },
  { type: 'respect', emoji: '👌', label: 'Respect' },
  { type: 'support', emoji: '🤝', label: 'Support' },
  { type: 'inspired', emoji: '☀️', label: 'Inspired' },
  { type: 'helpful', emoji: '✅', label: 'Helpful' },
];

/**
 * Get emoji for a reaction type
 * @param {string} type - The reaction type
 * @returns {string|undefined} - The emoji or undefined if not found
 */
export const getReactionEmoji = (type) => {
  return REACTIONS.find(r => r.type === type)?.emoji;
};

/**
 * Get label for a reaction type
 * @param {string} type - The reaction type
 * @returns {string|undefined} - The label or undefined if not found
 */
export const getReactionLabel = (type) => {
  return REACTIONS.find(r => r.type === type)?.label;
};
