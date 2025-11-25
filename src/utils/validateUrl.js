export function validateUrl(url, platform) {
  if (!url) return null;

  try {
    new URL(url); // this will throw an exeption if url is not valid

    const patterns = {
      linkedin_url: /^https?:\/\/(www\.)?linkedin\.com\//i,
      x_url: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i,
      facebook_url: /^https?:\/\/(www\.)?facebook\.com\//i,
      instagram_url: /^https?:\/\/(www\.)?instagram\.com\//i,
    };

    if (patterns[platform] && !patterns[platform].test(url)) {
      const platformNames = {
        linkedin_url: "LinkedIn",
        x_url: "X/Twitter",
        facebook_url: "Facebook",
        instagram_url: "Instagram",
      };
      return `Please enter a valid ${platformNames[platform]} URL`;
    }

    return null;
  } catch {
    return "Please enter a valid URL starting with https://";
  }
}
