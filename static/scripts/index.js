// When event update request is successfull
function eventUpdated(DBeventValues) {
  togglePopupWindow(EVENT_CONFIG.eventPopupForm);
  pupupMessage("Event updated successfully!");
  EVENT_CONFIG.recentEventId = DBeventValues.id;
  const updatedEventElement = EVENT_CONFIG.eventsPlaceholder.querySelector(
    `#event-${DBeventValues.id}`
  );
  if (updatedEventElement)
    updateEventElement(updatedEventElement, DBeventValues, true);
  resetEventForm();
}

// When the create event request is successfull
function eventCreated(DBeventValues, eventId) {
  togglePopupWindow(EVENT_CONFIG.eventPopupForm);
  pupupMessage("Event created successfully!");
  EVENT_CONFIG.recentEventId = eventId;
  DBeventValues.id = eventId;
  const eventDate = new Date(DBeventValues.timestamp);
  // If event created the same day as active calendar date, just update the UI
  if (
    stdDateFormat(eventDate) == stdDateFormat(CALENDAR_CONFIG.activeDate) ||
    (DBeventValues.recurring == 1 &&
      eventDate.getMonth() == CALENDAR_CONFIG.activeDate.getMonth() &&
      eventDate.getDate() == CALENDAR_CONFIG.activeDate.getDate())
  ) {
    EVENT_CONFIG.eventsPlaceholder.insertAdjacentHTML(
      "afterbegin",
      eventHTML(DBeventValues)
    );
  } else {
    CALENDAR_CONFIG.activeDate = eventDate;
    bindCalendarControls(eventDate);
    cellClicked(eventDate);
  }
  resetEventForm();
}

// When delete event request is successfull
function eventDeleted(eventElement) {
  // Event will stay in the frontend, it will just be hidden
  eventElement?.classList.add("deleted");
}
