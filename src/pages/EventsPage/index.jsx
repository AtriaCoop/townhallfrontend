import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { authenticatedFetch } from "@/utils/authHelpers";
import Icon from "@/icons/Icon";
import styles from "./EventsPage.module.scss";

export default function EventsPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [searchEvent, setSearchEvent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMyEvents, setShowMyEvents] = useState(true);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Mock events data for now - replace with actual API call when available
  const mockEvents = [
    {
      id: 1,
      title: "Community Garden Volunteer Day",
      date: "2025-02-15",
      time: "9:00 AM - 12:00 PM",
      location: "Vancouver Community Garden",
      description: "Join us for a morning of gardening and community building.",
      admin: "Sarah Chen",
      isEnrolled: true,
    },
    {
      id: 2,
      title: "Food Justice Workshop",
      date: "2025-02-20",
      time: "2:00 PM - 4:00 PM",
      location: "VFJC Community Center",
      description: "Learn about food justice initiatives in our community.",
      admin: "John Doe",
      isEnrolled: false,
    },
    {
      id: 3,
      title: "Monthly Coalition Meeting",
      date: "2025-02-28",
      time: "6:00 PM - 8:00 PM",
      location: "Online - Zoom",
      description: "Monthly meeting to discuss coalition updates and plans.",
      admin: "Admin Team",
      isEnrolled: true,
    },
    {
      id: 4,
      title: "Urban Farming Introduction",
      date: "2025-03-05",
      time: "10:00 AM - 1:00 PM",
      location: "Downtown Farm",
      description: "Learn the basics of urban farming techniques.",
      admin: "Mike Johnson",
      isEnrolled: false,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = events
    .filter((event) =>
      event.title.toLowerCase().includes(searchEvent.toLowerCase())
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const myEvents = filteredEvents.filter((event) => event.isEnrolled);
  const allEvents = filteredEvents;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
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

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`${styles.calendarDay} ${isToday ? styles.today : ""}`}
        >
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
          <button
            className={styles.calendarNavBtn}
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
          >
            <Icon name="chevronLeft" size={20} />
          </button>
          <h3 className={styles.calendarMonthTitle}>{formatMonthYear(currentMonth)}</h3>
          <button
            className={styles.calendarNavBtn}
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
          >
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
        <div className={styles.calendarWeekDays}>
          {weekDays.map((day) => (
            <div key={day} className={styles.weekDay}>
              {day}
            </div>
          ))}
        </div>
        <div className={styles.calendarGrid}>{days}</div>
      </div>
    );
  };

  const handleParticipate = (eventId) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, isEnrolled: true } : event
      )
    );
  };

  const handleUnenroll = (eventId) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, isEnrolled: false } : event
      )
    );
  };

  const renderEventCard = (event, showActions = true) => {
    const { month, day } = formatDate(event.date);
    return (
      <div key={event.id} className={styles.eventCard}>
        <div className={styles.eventDate}>
          <span className={styles.eventMonth}>{month}</span>
          <span className={styles.eventDay}>{day}</span>
        </div>
        <div className={styles.eventInfo}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          <div className={styles.eventMeta}>
            <span className={styles.eventTime}>
              <Icon name="clock" size={14} />
              {event.time}
            </span>
            <span className={styles.eventLocation}>
              <Icon name="pin" size={14} />
              {event.location}
            </span>
          </div>
          <p className={styles.eventDescription}>{event.description}</p>
          {event.admin && (
            <p className={styles.eventAdmin}>
              <span>Admin:</span> {event.admin}
            </p>
          )}
        </div>
        {showActions && (
          <div className={styles.eventActions}>
            <button className={styles.messageButton}>
              Message Admin
            </button>
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
        )}
      </div>
    );
  };

  return (
    <div className={styles.eventsPage}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Events</h1>
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
          {/* My Upcoming Events Section */}
          {showMyEvents && myEvents.length > 0 && (
            <section className={styles.eventsSection}>
              <h2 className={styles.sectionTitle}>My upcoming Events</h2>
              <div className={styles.eventsGrid}>
                {myEvents.map((event) => renderEventCard(event, true))}
              </div>
            </section>
          )}

          {/* Calendar View */}
          {showCalendarView && (
            <section className={styles.eventsSection}>
              {renderCalendar()}
            </section>
          )}

          {/* All Upcoming Events Section */}
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
                allEvents.map((event) => renderEventCard(event, true))
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

          {/* Event Details Modal */}
          {selectedEvent && (
            <div className={styles.eventModal} onClick={() => setSelectedEvent(null)}>
              <div className={styles.eventModalContent} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.modalCloseBtn}
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Close"
                >
                  <Icon name="close" size={20} />
                </button>
                <h3 className={styles.modalTitle}>Event Details</h3>
                <div className={styles.modalEventInfo}>
                  <h4>{selectedEvent.title}</h4>
                  <div className={styles.modalMeta}>
                    <p><Icon name="clock" size={16} /> {selectedEvent.time}</p>
                    <p><Icon name="pin" size={16} /> {selectedEvent.location}</p>
                    <p><strong>Admin:</strong> {selectedEvent.admin}</p>
                  </div>
                  <p className={styles.modalDescription}>{selectedEvent.description}</p>
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.messageButton}>Message Admin</button>
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
