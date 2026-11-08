// Centralized RSVP messages for easier maintenance and future localization.
export const RSVP_COPY = {
  helperJoin: "You'll be added to the Upcoming Events.",
  helperJoined: "You're going. This event is in My Events.",
  toastJoined: (title) =>
    `You're going to "${title}". It now appears under Upcoming Events.`,
  toastLeft: (title) =>
    `You've been removed from "${title}". It's no longer in the My Events.`,
  toastError: "Something went wrong. Please try again.",
};
