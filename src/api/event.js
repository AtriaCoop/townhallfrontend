import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';

export async function fetchAllEvents() {
  const response = await authenticatedFetch(`${BASE_URL}/event/`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch events");
  return data.events;
}

export async function createEvent(eventData) {
  const response = await authenticatedFetch(`${BASE_URL}/event/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to create event");
  return data.event;
}

export async function participateInEvent(eventId) {
  const response = await authenticatedFetch(`${BASE_URL}/event/${eventId}/participate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to participate");
  return data.event;
}

export async function unenrollFromEvent(eventId) {
  const response = await authenticatedFetch(`${BASE_URL}/event/${eventId}/unenroll/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to unenroll");
  return data.event;
}

export async function updateEvent(eventId, eventData) {
  const response = await authenticatedFetch(`${BASE_URL}/event/${eventId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to update event");
  return data.event;
}

export async function deleteEvent(eventId) {
  const response = await authenticatedFetch(`${BASE_URL}/event/${eventId}/`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete event");
  }
}
