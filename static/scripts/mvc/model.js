/**
 * Events data is stored here
 * This file serves as a configuration file for the application,
 * it contains all data for the application. This file also contains some UI elements
 * This script also converts data from event form into data ready to be transmitted to the server
 *
 */

// EVENT_CONFIG is event config object
const EVENT_CONFIG = {};
EVENT_CONFIG.lastRequestResolved = true;
EVENT_CONFIG.noEventsMsg = "No events were found in this day!";
EVENT_CONFIG.requestNotResolvedMsg = "Still resolving a request";
EVENT_CONFIG.requestFailureMsgs = {};
EVENT_CONFIG.requestFailureMsgs["internal"] = "Request Failed!";
EVENT_CONFIG.requestFailureMsgs["date"] = "Invalid date selected!";
EVENT_CONFIG.formNames = [
  "name",
  "recurring",
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "ampm",
  "notes",
];
// Object containing all components needed for event
EVENT_CONFIG.eventsSectionTitle = document.querySelector(".section-title");
EVENT_CONFIG.eventsPlaceholder = document.querySelector(".events-container");
EVENT_CONFIG.noEventsMsgElement = null;
EVENT_CONFIG.eventPopupForm = document.querySelector(".event-popup-form");
EVENT_CONFIG.eventForm = document.getElementById("event-form");
EVENT_CONFIG.addEventBtn = document.querySelector(".add-button");
EVENT_CONFIG.submitEventBtn = document.getElementById("submit-event-button");
EVENT_CONFIG.cancelEventBtn = document.getElementById("cancel-event-button");
EVENT_CONFIG.formErrorBox = document.querySelector(".event-form-errors");
EVENT_CONFIG.errorBox = EVENT_CONFIG.eventsPlaceholder;
EVENT_CONFIG.eventFormTitle = document.querySelector(".event-form-title");
EVENT_CONFIG.eventFormElements = getFormElements(
  EVENT_CONFIG.formNames,
  EVENT_CONFIG.eventForm
);
EVENT_CONFIG.recentEventId = 0;
EVENT_CONFIG.formAction = "add";

/**
 * Converts a database event to an object containing all different components as properties
 * @param {Object} DBevent
 */
function convertDBEvent(DBevent) {
  const eventDate = new Date(DBevent.timestamp);
  let eventHour =
    eventDate.getHours() > 12
      ? eventDate.getHours() - 12
      : eventDate.getHours();
  eventHour = eventHour == 0 ? 12 : eventHour;
  let ampm = eventDate.getHours() > 12 ? "pm" : "am";

  const event = {};

  event.id = DBevent.id;
  event.name = DBevent.name;
  event.recurring = DBevent.recurring;
  event.notes = DBevent.notes;
  event.year = eventDate.getFullYear();
  event.month = eventDate.getMonth() + 1;
  event.day = eventDate.getDate();
  event.hour = eventHour;
  event.minute = eventDate.getMinutes();
  event.ampm = ampm;

  return event;
}

/**
 * construct an object from the values of eventElements that is ready to be submitted to the database
 * @param {Object} eventElements
 */
function elementsToDBEvent(eventElements) {
  let eventHour =
    eventElements.ampm.value == "pm"
      ? Number(eventElements.hour.value) + 12
      : eventElements.hour.value;
  eventHour = eventHour == 24 ? 0 : eventHour;
  const eventDate = new Date(
    eventElements.year.value,
    eventElements.month.value - 1,
    eventElements.day.value,
    eventHour,
    eventElements.minute.value
  ).getTime();

  if (!eventDate) return false;

  const dbValues = {};
  dbValues.name = eventElements.name.value;
  dbValues.recurring = eventElements.recurring.checked ? 1 : 0;
  dbValues.notes = eventElements.notes.value;
  dbValues.timestamp = eventDate;

  return dbValues;
}
