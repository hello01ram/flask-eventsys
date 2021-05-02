/**
 * This scripts serves as the base controller
 * It is responsible for the sending ajax request to create, read, update and delete events
 * It parses the request to ensure its success
 * It renders errors (if any), and show results if request is successfull
 */

/***********************************************************************/
/***************** Events application functions ************************/
/***********************************************************************/

// render calendar, update the day cell clicked to today, and, request today's events
function getSomedayEvents(date) {
  renderCalendar(date, cellClicked);
  cellClicked(date);
}

// Request all events at a certain date period (one day events)
function getEventsRequest(timestamp) {
  if (!getDayEvents(timestamp, renderEvents)) {
    window.alert(REQUEST_FAILED_MSG);
    return;
  }

  const titleMsg = `Events for ${stdDateFormat(new Date(timestamp))} ${
    isToday(new Date(timestamp)) ? "(Today)" : ""
  }`;

  EVENT_CONFIG.eventsSectionTitle.innerHTML = titleMsg;
}

// When form is submitted for adding event
function addEventRequest() {
  const eventValues = elementsToDBEvent(EVENT_CONFIG.eventFormElements);
  if (!eventValues) {
    EVENT_CONFIG.lastRequestResolved = true;
    renderErrors(
      { Date: EVENT_CONFIG.requestFailureMsgs.date },
      EVENT_CONFIG.formErrorBox
    );
    return;
  }
  if (!createEvent(eventValues, eventCreated.bind({}, eventValues))) {
    window.alert(REQUEST_FAILED_MSG);
    return;
  }
}

// when form is submitted for updating
function updateEventRequest() {
  const eventValues = elementsToDBEvent(EVENT_CONFIG.eventFormElements);
  if (!eventValues) {
    EVENT_CONFIG.lastRequestResolved = true;
    renderErrors(
      { Date: EVENT_CONFIG.requestFailureMsgs.date },
      EVENT_CONFIG.formErrorBox
    );
    return;
  }
  eventValues.id = Number(EVENT_CONFIG.eventForm.getAttribute("data-id"));
  if (!eventValues.id) {
    EVENT_CONFIG.lastRequestResolved = true;
    renderErrors(
      { Internal: EVENT_CONFIG.requestFailureMsgs.internal },
      EVENT_CONFIG.formErrorBox
    );
  }
  if (!updateEvent(eventValues, eventUpdated.bind({}, eventValues))) {
    window.alert(REQUEST_FAILED_MSG);
    return;
  }
}

// when event is deleted
function deleteEventRequest(eventElement) {
  const deleteConfirmed = window.confirm(
    "Are you sure you want to delete event?"
  );
  if (!deleteConfirmed) return;
  const eventId = eventElement.getAttribute("data-id");
  if (
    !deleteEvent(
      eventId,
      function () {
        eventElement?.classList.add("deleted");
      }.bind({}, eventElement)
    )
  ) {
    window.alert(REQUEST_FAILED_MSG);
    return;
  }
}

/**********************************************************************/
/******************** Event actions (CRUD) ****************************/
/**********************************************************************/
// Gets events happening at a certain year
function getYearEvents(year, callbackFunc) {
  if (!EVENT_CONFIG.lastRequestResolved) {
    window.alert(EVENT_CONFIG.requestNotResolvedMsg);
    return false;
  }
  EVENT_CONFIG.lastRequestResolved = false;
  new HTTP({
    url: "/api/events/year",
    params: { year },
    callback: parseEventResponse.bind({}, callbackFunc),
    run: true,
  });

  return true;
}
// Get events happening in a day at a certain date
function getDayEvents(timestamp, callbackFunc) {
  if (!EVENT_CONFIG.lastRequestResolved) {
    window.alert(EVENT_CONFIG.requestNotResolvedMsg);
    return false;
  }
  EVENT_CONFIG.lastRequestResolved = false;
  // `/api/events/period`
  new HTTP({
    url: "/api/events/day",
    params: { timestamp },
    callback: parseEventResponse.bind({}, callbackFunc),
    run: true,
  });

  return true;
}

// Get one event using their id
function getEvent(eventID, callbackFunc) {
  if (!EVENT_CONFIG.lastRequestResolved) {
    window.alert(EVENT_CONFIG.requestNotResolvedMsg);
    return false;
  }

  EVENT_CONFIG.lastRequestResolved = false;
  // `/api/events/${eventID}`
  new HTTP({
    url: `/api/events/${eventID}`,
    callback: parseEventResponse.bind({}, callbackFunc),
    run: true,
  });

  return true;
}

// Create event using eventValues as row values
function createEvent(eventValues, callbackFunc) {
  if (!EVENT_CONFIG.lastRequestResolved) {
    window.alert(EVENT_CONFIG.requestNotResolvedMsg);
    return false;
  }

  EVENT_CONFIG.lastRequestResolved = false;
  // `/api/events/add`
  new HTTP({
    url: "/api/events/add",
    method: "POST",
    params: eventValues,
    callback: parseFormResponse.bind({}, callbackFunc),
    run: true,
  });

  return true;
}

// Update event whos id is in eventData using the data their
function updateEvent(eventData, callbackFunc) {
  if (!EVENT_CONFIG.lastRequestResolved) {
    window.alert(EVENT_CONFIG.requestNotResolvedMsg);
    return false;
  }

  EVENT_CONFIG.lastRequestResolved = false;
  // `/api/events/update/${eventID}`
  new HTTP({
    url: `/api/events/update/${eventData.id}`,
    method: "POST",
    params: eventData,
    callback: parseFormResponse.bind({}, callbackFunc),
    run: true,
  });
  return true;
}

// Delete a single event using their id
function deleteEvent(eventID, callbackFunc) {
  if (!EVENT_CONFIG.lastRequestResolved) {
    window.alert(EVENT_CONFIG.requestNotResolvedMsg);
    return false;
  }

  EVENT_CONFIG.lastRequestResolved = false;
  // `/api/events/delete/${eventID}`
  new HTTP({
    url: `/api/events/delete/${eventID}`,
    method: "GET",
    callback: parseFormResponse.bind({}, callbackFunc),
    run: true,
  });

  return true;
}

/*****************************************************************/
/************************ HELPERS  *******************************/
/*****************************************************************/

/**
 * functions to help parse request responses and check for their success
 */

/**
 * Parse the http object. If request failed (success = 0) render errors to the events placeholder element
 * If request succeded, it calls the calbackFunc callback and pass it the response
 * @param {Callback} callbackFunc
 * @param {Object} http
 * @returns
 */
function parseEventResponse(callbackFunc, http) {
  EVENT_CONFIG.lastRequestResolved = true;
  if (!http.requestSuccess) {
    renderErrors(
      { Internal: EVENT_CONFIG.requestFailureMsgs.internal },
      EVENT_CONFIG.errorBox
    );
    return;
  }

  const events = http.getJSON().success;
  if (!events) {
    renderErrors(
      { Internal: EVENT_CONFIG.requestFailureMsgs.internal },
      EVENT_CONFIG.errorBox
    );
    return;
  }
  callbackFunc(events);
}

/**
 * Parse the http object. If request failed (success = 0) render errors to the form element
 * If request succeded, it calls the calbackFunc callback and pass it the response
 * @param {CallbackFunc} callbackFunc
 * @param {Object} http
 * @returns
 */
function parseFormResponse(callbackFunc, http) {
  EVENT_CONFIG.lastRequestResolved = true;
  if (!http.requestSuccess) {
    renderErrors(
      { Internal: EVENT_CONFIG.requestFailureMsgs.internal },
      EVENT_CONFIG.formErrorBox
    );
    return;
  }

  const requestResponse = http.getJSON().success;
  if (!requestResponse) {
    renderErrors(
      { Internal: EVENT_CONFIG.requestFailureMsgs.internal },
      EVENT_CONFIG.formErrorBox
    );
    return;
  }
  callbackFunc(requestResponse);
}

function requestFailed(errorElement) {
  errorElement = errorElement ? errorElement : EVENT_CONFIG.eventsPlaceholder;
  EVENT_CONFIG.lastRequestResolved = true;
  renderErrors(
    { Internal: EVENT_CONFIG.requestFailureMsgs.internal },
    errorElement
  );
}
