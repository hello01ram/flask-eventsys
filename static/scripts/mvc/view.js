/**
 * This file has all functions and code related to the UI of the application
 * The file also contains all the events listeners to varius elements in the app
 * Whenever an element is clicked or submitted, a function here will fire and most probably,
 * call another function in the controller script
 */

const INITAL_DATE = new Date(
  TODAY.getFullYear(),
  TODAY.getMonth(),
  TODAY.getDate()
);

getSomedayEvents(INITAL_DATE);
initEventListeners();

function initEventListeners() {
  // Show form when add button clicked
  EVENT_CONFIG.addEventBtn.addEventListener("click", () => {
    resetEventForm();
    togglePopupWindow(EVENT_CONFIG.eventPopupForm, "click", true);
  });
  EVENT_CONFIG.eventsPlaceholder.addEventListener("click", eventClicked);
  EVENT_CONFIG.eventForm.addEventListener("submit", submitEventForm);
  EVENT_CONFIG.eventForm.addEventListener("reset", () => {
    resetEventForm("add");
  });
}

// Event form submitted, check whether for add event or update event
function submitEventForm(e) {
  e.preventDefault();
  if (!EVENT_CONFIG.lastRequestResolved) {
    window.alert(EVENT_CONFIG.requestNotResolvedMsg);
    return;
  }
  const formErrors = checkEmptyElements(EVENT_CONFIG.eventFormElements, [
    "notes",
  ]);
  // // if there is an empty value
  if (Object.keys(formErrors).length) {
    renderErrors(
      formErrors,
      EVENT_CONFIG.formErrorBox,
      EVENT_CONFIG.eventFormElements
    );
    return false;
  }

  if (EVENT_CONFIG.formAction == "add") addEventRequest();
  else if (EVENT_CONFIG.formAction == "update") updateEventRequest();
}

// Reset form to default (add event form) or, if 'update' is passed, then it will
// convert it to update event
function resetEventForm(action = "add") {
  EVENT_CONFIG.eventForm.reset();
  EVENT_CONFIG.eventForm.removeAttribute("data-id");
  removeErrors(EVENT_CONFIG.formErrorBox, EVENT_CONFIG.eventFormElements);
  if (action == "update") {
    EVENT_CONFIG.eventFormTitle.innerText = "Update Event";
    EVENT_CONFIG.submitEventBtn.innerText = "Update Event";
    EVENT_CONFIG.cancelEventBtn.innerText = "Cancel";
    EVENT_CONFIG.formAction = action;
  } else if (action == "add") {
    EVENT_CONFIG.eventFormTitle.innerText = "Add Event";
    EVENT_CONFIG.submitEventBtn.innerText = "Add Event";
    EVENT_CONFIG.cancelEventBtn.innerText = "Clear";
    EVENT_CONFIG.formAction = action;
  }
}

// When a click event occurs on the events container, get the element that was clicked
function eventClicked(e) {
  const elementClicked = e.target;
  eventRequested = elementClicked.closest(".event");
  if (!eventRequested) return;

  if (e.target.nodeName != "BUTTON") {
    eventRequested.classList.toggle("show-details");
    return;
  }
  const eventId = eventRequested.getAttribute("data-id");
  if (!eventId) {
    window.alert("Not a valid event");
    return;
  }

  if (elementClicked.name == "update") {
    // Update requested
    if (!getEvent(eventId, loadEventIntoForm)) return;
  } else if (elementClicked.name == "delete") {
    // Delete requested
    deleteEventRequest(eventRequested);
  }
}

// Loads event data into form ready to submitted for update
function loadEventIntoForm(DBevent) {
  resetEventForm("update");
  EVENT_CONFIG.eventForm.setAttribute("data-id", DBevent.id);
  const event = convertDBEvent(DBevent);
  for (key in event) {
    if (key == "recurring")
      EVENT_CONFIG.eventFormElements[key].checked = event[key] ? true : false;
    if (key in EVENT_CONFIG.eventFormElements)
      EVENT_CONFIG.eventFormElements[key].value = event[key];
  }
  togglePopupWindow(EVENT_CONFIG.eventPopupForm, "click", true);
}

// When a clendar cell is clicked, this function executes with the cell date
function cellClicked(date) {
  if (!date) {
    renderErrors(
      EVENT_CONFIG.requestFailureMsgs["Date"],
      EVENT_CONFIG.eventsPlaceholder
    );
    return;
  }
  getEventsRequest(date.getTime());
}

/*****************************************************************/
/*********************** UI Componenets **************************/
/*****************************************************************/

// Functions to help with the UI (Creating event elements, updating, etc)
/**
 * Passed an event object, will create the html neccessary for it and return it as a string
 * @param {Object} dbEvent
 * @returns string
 */
function eventHTML(dbEvent, classes) {
  const eventDate = new Date(dbEvent.timestamp);
  let htmlClasses = "";
  let actionPlaceholder = "";
  if (EVENT_CONFIG.recentEventId == dbEvent.id) {
    if (EVENT_CONFIG.formAction == "update") {
      actionPlaceholder = '<span class="action-notice">Updated</span>';
      htmlClasses = "updated";
    }
    if (EVENT_CONFIG.formAction == "add") {
      actionPlaceholder = '<span class="action-notice">New</span>';
      htmlClasses = "added";
    }
  }
  let html = `
        <section class="event snake-animation ${htmlClasses} ${
    classes ? classes : ""
  }" id="event-${dbEvent.id}" data-id="${dbEvent.id}">
          <h3 class="event-title row">
            ${dbEvent.name}${actionPlaceholder} 
            ${dbEvent.recurring ? '<span class="recurring">Yearly</span>' : ""}
          </h3>
          <div class="details row">
            <p class="date"><b>When</b>: ${stdDateFormat(eventDate)}</p>
            <p class="time"><b>At</b>: ${stdTimeFormat(eventDate)}</p>
          </div>
          <div class="tools">
            <div class="notes">
              <p><b>Notes: </b>${
                dbEvent.notes ? dbEvent.notes : "no notes for this event"
              }</p>
            </div>
            <div class="buttons row">
              <button name="update" class="submit-btn">Update</button>
              <button name="delete" class="delete-btn">Delete</button>
            </div>
          </div>
        </section>
      `;
  EVENT_CONFIG.recentEventId = 0;
  return html;
}

function updateEventElement(eventElement, event, keepClasses = false) {
  let classes = eventElement.classList.contains("show-details")
    ? " show-details "
    : "";
  classes += " updated";
  const parser = new DOMParser();
  const parseEvent = parser.parseFromString(
    eventHTML(event, classes),
    "text/html"
  );
  const updatedEvent = parseEvent.getElementById(`event-${event.id}`);
  eventElement.parentNode.replaceChild(updatedEvent, eventElement);
  return updatedEvent;
}

function renderEvents(events) {
  let html = "";
  if (events.length == 0) {
    html = `<h3 class="no-events-msg">${EVENT_CONFIG.noEventsMsg}</h3>`;
  } else {
    for (let event of events) {
      html += eventHTML(event);
    }
  }
  EVENT_CONFIG.eventsPlaceholder.innerHTML = html;
  EVENT_CONFIG.noEventsMsgElement = document.querySelector(".no-events-msg");
}
