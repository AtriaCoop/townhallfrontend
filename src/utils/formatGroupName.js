/**
 * Converts a slug-format group name to a readable, title-cased string.
 * e.g. "atria-questions-and-support" → "Atria Questions and Support"
 *      "wg-climate-resilient-local-food-systems" → "WG Climate Resilient Local Food Systems"
 */
export function formatGroupName(slugName) {
  if (!slugName) return '';

  const lowercaseWords = new Set(['and', 'or', 'the', 'a', 'an', 'as', 'for', 'of', 'in', 'on', 'to']);
  const uppercaseWords = new Set(['wg']);

  return slugName
    .split('-')
    .map((word, index) => {
      if (uppercaseWords.has(word.toLowerCase())) return word.toUpperCase();
      if (index > 0 && lowercaseWords.has(word.toLowerCase())) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
