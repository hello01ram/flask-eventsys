/**
 * This file is created to extend and/or overide some functionalities in other base files
 */

const eventYearControl = document.querySelector("#events-year");
let activeYear = Number(eventYearControl.value);
EVENT_CONFIG.noEventsMsg = "No events were found in this year";

requestYearEvents(activeYear);

function requestYearEvents(year) {
  eventYearControl.disabled = false;
  EVENT_CONFIG.eventsSectionTitle.innerText = `${year} year events`;
  if (!getYearEvents(year, renderEvents)) {
    window.alert(REQUEST_FAILED_MSG);
    return;
  }
}

eventYearControl.addEventListener("change", function () {
  let requestedYear = Number(this.value);
  if (requestedYear < 1800 || requestedYear > 2100) {
    window.alert(`Requested year ${requestedYear} is invalid!`);
    return;
  }
  EVENT_CONFIG.eventsSectionTitle.innerHTML = `<span class="loading">Loading events for year ${requestedYear} ...</span>`;
  this.disabled = true;
  setTimeout(() => {
    requestYearEvents(requestedYear);
  }, 800);
});

/***********************************************************/
/******************** UI functions *************************/
/***********************************************************/
// When the create event request is successfull
function eventCreated(DBeventValues, eventId) {
  togglePopupWindow(EVENT_CONFIG.eventPopupForm);
  pupupMessage("Event created successfully!");
  EVENT_CONFIG.recentEventId = eventId;
  DBeventValues.id = eventId;
  const eventDate = new Date(DBeventValues.timestamp);
  // If event created the same day as active calendar date, just update the UI
  if (DBeventValues.recurring == 1 || eventDate.getFullYear() == activeYear) {
    EVENT_CONFIG.eventsPlaceholder.insertAdjacentHTML(
      "afterbegin",
      eventHTML(DBeventValues)
    );
  }
  if (EVENT_CONFIG.noEventsMsgElement)
    EVENT_CONFIG.eventsPlaceholder.removeChild(EVENT_CONFIG.noEventsMsgElement);
  resetEventForm();
}

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

// When delete event request is successfull
function eventDeleted(eventElement) {
  // Event will stay in the frontend, it will just be hidden
  eventElement?.classList.add("deleted");
}
