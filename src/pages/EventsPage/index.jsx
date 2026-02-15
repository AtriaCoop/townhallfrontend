import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Icon from "@/icons/Icon";
import { fetchAllEvents, createEvent, participateInEvent, unenrollFromEvent, updateEvent, deleteEvent } from "@/api/event";
import { getStoredUser } from "@/utils/getStoredUser";
import { authenticatedFetch } from "@/utils/authHelpers";
import { BASE_URL } from "@/constants/api";
import styles from "./EventsPage.module.scss";

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [searchEvent, setSearchEvent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMyEvents, setShowMyEvents] = useState(true);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [createError, setCreateError] = useState("");

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [editEvent, setEditEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [editError, setEditError] = useState("");

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const eventsData = await fetchAllEvents();
        setEvents(eventsData);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setIsLoading(false);
      }

      try {
        const user = getStoredUser();
        if (user?.id) {
          setCurrentUserId(user.id);
          const response = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`);
          if (response.ok) {
            const data = await response.json();
            setIsStaff(data.user?.is_staff || false);
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }
    loadData();
  }, []);

  // Helpers
  const isEventAdmin = (event) => {
    return currentUserId && event.admin?.id === currentUserId;
  };

  const getDateBadge = (dateString) => {
    const eventDate = new Date(dateString + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (eventDate.getTime() === today.getTime()) return { label: "Today", type: "today" };
    if (eventDate.getTime() === tomorrow.getTime()) return { label: "Tomorrow", type: "tomorrow" };
    if (eventDate > today && eventDate < weekEnd) return { label: "This Week", type: "thisWeek" };
    if (eventDate < today) return { label: "Past", type: "past" };
    return null;
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const filteredEvents = events
    .filter((event) =>
      event.title.toLowerCase().includes(searchEvent.toLowerCase())
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const myEvents = filteredEvents.filter((event) => event.isEnrolled);
  const allEvents = filteredEvents;

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateString);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Handlers
  const handleParticipate = async (eventId) => {
    try {
      const updatedEvent = await participateInEvent(eventId);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, ...updatedEvent } : event
        )
      );
    } catch (err) {
      console.error("Error participating:", err);
    }
  };

  const handleUnenroll = async (eventId) => {
    try {
      const updatedEvent = await unenrollFromEvent(eventId);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, ...updatedEvent } : event
        )
      );
    } catch (err) {
      console.error("Error unenrolling:", err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
      setCreateError("Please fill in all required fields.");
      return;
    }

    try {
      const created = await createEvent(newEvent);
      setEvents((prev) => [...prev, created]);
      setShowCreateModal(false);
      setNewEvent({ title: "", description: "", date: "", time: "", location: "" });
    } catch (err) {
      setCreateError(err.message || "Failed to create event.");
      console.error("Error creating event:", err);
    }
  };

  const openEditModal = (event) => {
    setEditEventId(event.id);
    setEditEvent({
      title: event.title,
      description: event.description || "",
      date: event.date,
      time: event.time,
      location: event.location,
    });
    setEditError("");
    setShowEditModal(true);
    setSelectedEvent(null);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editEvent.title || !editEvent.date || !editEvent.time || !editEvent.location) {
      setEditError("Please fill in all required fields.");
      return;
    }

    try {
      const updated = await updateEvent(editEventId, editEvent);
      setEvents((prev) =>
        prev.map((event) => (event.id === editEventId ? { ...event, ...updated } : event))
      );
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message || "Failed to update event.");
      console.error("Error updating event:", err);
    }
  };

  const openDeleteConfirm = (eventId) => {
    setDeleteTargetId(eventId);
    setShowDeleteConfirm(true);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(deleteTargetId);
      setEvents((prev) => prev.filter((event) => event.id !== deleteTargetId));
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // Render helpers
  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={day} className={`${styles.calendarDay} ${isToday ? styles.today : ""}`}>
          <span className={styles.dayNumber}>{day}</span>
          <div className={styles.dayEvents}>
            {dayEvents.slice(0, 2).map((event, idx) => (
              <button
                key={event.id}
                className={`${styles.eventChip} ${styles[`eventChip${(idx % 3) + 1}`]}`}
                onClick={() => setSelectedEvent(event)}
                title={event.title}
              >
                {event.title.length > 10 ? event.title.substring(0, 10) + "..." : event.title}
              </button>
            ))}
            {dayEvents.length > 2 && (
              <span className={styles.moreEvents}>+{dayEvents.length - 2} more</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <button className={styles.calendarNavBtn} onClick={() => navigateMonth(-1)} aria-label="Previous month">
            <Icon name="chevronLeft" size={20} />
          </button>
          <h3 className={styles.calendarMonthTitle}>{formatMonthYear(currentMonth)}</h3>
          <button className={styles.calendarNavBtn} onClick={() => navigateMonth(1)} aria-label="Next month">
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
        <div className={styles.calendarWeekDays}>
          {weekDays.map((day) => (
            <div key={day} className={styles.weekDay}>{day}</div>
          ))}
        </div>
        <div className={styles.calendarGrid}>{days}</div>
      </div>
    );
  };

  const renderEventCard = (event) => {
    const { month, day } = formatDate(event.date);
    const badge = getDateBadge(event.date);
    const participantCount = event.participants?.length || 0;

    return (
      <div
        key={event.id}
        className={styles.eventCard}
        onClick={() => setSelectedEvent(event)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setSelectedEvent(event)}
      >
        <div className={styles.eventDate}>
          <span className={styles.eventMonth}>{month}</span>
          <span className={styles.eventDay}>{day}</span>
        </div>
        <div className={styles.eventInfo}>
          <div className={styles.eventTitleRow}>
            <h3 className={styles.eventTitle}>{event.title}</h3>
            {badge && (
              <span className={`${styles.dateBadge} ${styles[`dateBadge_${badge.type}`]}`}>
                {badge.label}
              </span>
            )}
          </div>
          <div className={styles.eventMeta}>
            <span className={styles.eventTime}>
              <Icon name="clock" size={14} />
              {event.time}
            </span>
            <span className={styles.eventLocation}>
              <Icon name="pin" size={14} />
              {event.location}
            </span>
            {participantCount > 0 && (
              <span className={styles.eventParticipants}>
                <Icon name="members" size={14} />
                {participantCount} going
              </span>
            )}
          </div>
          <p className={styles.eventDescription}>{event.description}</p>
          {event.admin && (
            <div className={styles.eventAdminRow}>
              {event.admin.profile_image ? (
                <img src={event.admin.profile_image} alt="" className={styles.adminAvatar} />
              ) : (
                <div className={styles.adminAvatarPlaceholder}>
                  <Icon name="user" size={12} />
                </div>
              )}
              <span className={styles.adminName}>{event.admin.full_name || "Organizer"}</span>
            </div>
          )}
        </div>
        <div className={styles.eventActions} onClick={(e) => e.stopPropagation()}>
          {isEventAdmin(event) && (
            <div className={styles.adminActions}>
              <button
                className={styles.iconButton}
                onClick={() => openEditModal(event)}
                title="Edit event"
              >
                <Icon name="pencil" size={16} />
              </button>
              <button
                className={styles.iconButton}
                onClick={() => openDeleteConfirm(event.id)}
                title="Delete event"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          )}
          {event.isEnrolled ? (
            <button
              className={styles.unenrollButton}
              onClick={() => handleUnenroll(event.id)}
            >
              Unenroll
            </button>
          ) : (
            <button
              className={styles.participateButton}
              onClick={() => handleParticipate(event.id)}
            >
              Participate
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderEventForm = (formData, setFormData, onSubmit, error, submitLabel) => (
    <form className={styles.createEventForm} onSubmit={onSubmit}>
      <div className={styles.createFormGroup}>
        <label>Title *</label>
        <input
          type="text"
          placeholder="Event title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={styles.createFormInput}
        />
      </div>
      <div className={styles.createFormGroup}>
        <label>Date *</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className={styles.createFormInput}
        />
      </div>
      <div className={styles.createFormGroup}>
        <label>Time *</label>
        <input
          type="text"
          placeholder="e.g. 9:00 AM - 12:00 PM"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className={styles.createFormInput}
        />
      </div>
      <div className={styles.createFormGroup}>
        <label>Location *</label>
        <input
          type="text"
          placeholder="Event location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className={styles.createFormInput}
        />
      </div>
      <div className={styles.createFormGroup}>
        <label>Description</label>
        <textarea
          placeholder="Describe the event..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={styles.createFormTextarea}
          rows={3}
        />
      </div>
      {error && <p className={styles.createFormError}>{error}</p>}
      <button type="submit" className={styles.participateButton}>
        {submitLabel}
      </button>
    </form>
  );

  return (
    <div className={styles.eventsPage}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Events</h1>
          {isStaff && (
            <button
              className={styles.createEventButton}
              onClick={() => setShowCreateModal(true)}
            >
              + Create Event
            </button>
          )}
        </div>
        <div className={styles.headerControls}>
          <label className={styles.toggleLabel}>
            <span>My upcoming events</span>
            <div className={styles.toggleWrapper}>
              <input
                type="checkbox"
                checked={showMyEvents}
                onChange={(e) => setShowMyEvents(e.target.checked)}
                className={styles.toggleInput}
              />
              <div className={styles.toggleTrack}>
                <div className={styles.toggleThumb} />
              </div>
            </div>
          </label>
          <label className={styles.toggleLabel}>
            <span>Calendar View</span>
            <div className={styles.toggleWrapper}>
              <input
                type="checkbox"
                checked={showCalendarView}
                onChange={(e) => setShowCalendarView(e.target.checked)}
                className={styles.toggleInput}
              />
              <div className={styles.toggleTrack}>
                <div className={styles.toggleThumb} />
              </div>
            </div>
          </label>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading events...</p>
        </div>
      ) : (
        <>
          {/* My Upcoming Events */}
          {showMyEvents && myEvents.length > 0 && (
            <section className={styles.eventsSection}>
              <h2 className={styles.sectionTitle}>My upcoming Events</h2>
              <div className={styles.eventsGrid}>
                {myEvents.map((event) => renderEventCard(event))}
              </div>
            </section>
          )}

          {/* Calendar View */}
          {showCalendarView && (
            <section className={styles.eventsSection}>
              {renderCalendar()}
            </section>
          )}

          {/* All Upcoming Events */}
          <section className={styles.eventsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All upcoming</h2>
              <div className={styles.searchWrapper}>
                <Icon name="search" size={18} className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder="Search events..."
                  value={searchEvent}
                  onChange={(e) => setSearchEvent(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.eventsGrid}>
              {allEvents.length > 0 ? (
                allEvents.map((event) => renderEventCard(event))
              ) : (
                <div className={styles.emptyState}>
                  <Icon name="calendar" size={48} />
                  <h3>No events found</h3>
                  <p>
                    {searchEvent
                      ? "Try adjusting your search terms."
                      : "Check back later for upcoming events."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Create Event Modal */}
          {showCreateModal && (
            <div className={styles.eventModal} onClick={() => setShowCreateModal(false)}>
              <div className={styles.eventModalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalCloseBtn} onClick={() => setShowCreateModal(false)} aria-label="Close">
                  <Icon name="close" size={20} />
                </button>
                <h3 className={styles.modalTitle}>Create Event</h3>
                {renderEventForm(newEvent, setNewEvent, handleCreateEvent, createError, "Create Event")}
              </div>
            </div>
          )}

          {/* Edit Event Modal */}
          {showEditModal && (
            <div className={styles.eventModal} onClick={() => setShowEditModal(false)}>
              <div className={styles.eventModalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalCloseBtn} onClick={() => setShowEditModal(false)} aria-label="Close">
                  <Icon name="close" size={20} />
                </button>
                <h3 className={styles.modalTitle}>Edit Event</h3>
                {renderEventForm(editEvent, setEditEvent, handleUpdateEvent, editError, "Save Changes")}
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className={styles.eventModal} onClick={() => setShowDeleteConfirm(false)}>
              <div className={styles.eventModalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalCloseBtn} onClick={() => setShowDeleteConfirm(false)} aria-label="Close">
                  <Icon name="close" size={20} />
                </button>
                <h3 className={styles.modalTitle}>Delete Event</h3>
                <p className={styles.deleteConfirmText}>
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
                <div className={styles.deleteConfirmActions}>
                  <button
                    className={styles.unenrollButton}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.deleteConfirmButton}
                    onClick={handleDeleteEvent}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Event Details Modal */}
          {selectedEvent && (
            <div className={styles.eventModal} onClick={() => setSelectedEvent(null)}>
              <div className={styles.eventModalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalCloseBtn} onClick={() => setSelectedEvent(null)} aria-label="Close">
                  <Icon name="close" size={20} />
                </button>
                <h3 className={styles.modalTitle}>Event Details</h3>
                <div className={styles.modalEventInfo}>
                  <h4>{selectedEvent.title}</h4>
                  <div className={styles.modalMeta}>
                    <p><Icon name="calendar" size={16} /> {formatFullDate(selectedEvent.date)}</p>
                    <p><Icon name="clock" size={16} /> {selectedEvent.time}</p>
                    <p><Icon name="pin" size={16} /> {selectedEvent.location}</p>
                  </div>
                  {selectedEvent.description && (
                    <p className={styles.modalDescription}>{selectedEvent.description}</p>
                  )}
                </div>

                {/* Organizer Section */}
                {selectedEvent.admin && (
                  <div className={styles.organizerSection}>
                    <h5 className={styles.organizerLabel}>Organizer</h5>
                    <div
                      className={styles.organizerCard}
                      onClick={() => router.push(`/ProfilePage/${selectedEvent.admin.id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      {selectedEvent.admin.profile_image ? (
                        <img src={selectedEvent.admin.profile_image} alt="" className={styles.organizerAvatar} />
                      ) : (
                        <div className={styles.organizerAvatarPlaceholder}>
                          <Icon name="user" size={18} />
                        </div>
                      )}
                      <div className={styles.organizerInfo}>
                        <span className={styles.organizerName}>{selectedEvent.admin.full_name || "Organizer"}</span>
                        {selectedEvent.admin.primary_organization && (
                          <span className={styles.organizerOrg}>{selectedEvent.admin.primary_organization}</span>
                        )}
                      </div>
                      <span className={styles.viewProfileLink}>View Profile</span>
                    </div>
                  </div>
                )}

                {/* Participants Section */}
                {selectedEvent.participants?.length > 0 && (
                  <div className={styles.participantsSection}>
                    <h5 className={styles.organizerLabel}>
                      Participants ({selectedEvent.participants.length})
                    </h5>
                    <div className={styles.participantsList}>
                      {selectedEvent.participants.slice(0, 8).map((p) => (
                        <div
                          key={p.id}
                          className={styles.participantChip}
                          onClick={() => router.push(`/ProfilePage/${p.id}`)}
                          role="button"
                          tabIndex={0}
                        >
                          {p.profile_image ? (
                            <img src={p.profile_image} alt="" className={styles.participantAvatar} />
                          ) : (
                            <div className={styles.participantAvatarPlaceholder}>
                              <Icon name="user" size={10} />
                            </div>
                          )}
                          <span>{p.full_name}</span>
                        </div>
                      ))}
                      {selectedEvent.participants.length > 8 && (
                        <span className={styles.moreParticipants}>
                          +{selectedEvent.participants.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className={styles.modalActions}>
                  {isEventAdmin(selectedEvent) && (
                    <>
                      <button
                        className={styles.editButton}
                        onClick={() => openEditModal(selectedEvent)}
                      >
                        <Icon name="pencil" size={14} />
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => openDeleteConfirm(selectedEvent.id)}
                      >
                        <Icon name="trash" size={14} />
                        Delete
                      </button>
                    </>
                  )}
                  {selectedEvent.isEnrolled ? (
                    <button
                      className={styles.unenrollButton}
                      onClick={() => {
                        handleUnenroll(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                    >
                      Unenroll
                    </button>
                  ) : (
                    <button
                      className={styles.participateButton}
                      onClick={() => {
                        handleParticipate(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                    >
                      Participate
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
