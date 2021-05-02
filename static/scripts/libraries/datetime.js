/**
 * This is the main javascript file for the Calendar application
 */

/** Calendar Starts ***********************************************/
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wedensday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Augest",
  "September",
  "October",
  "November",
  "December",
];

const TODAY = new Date();
// Maintain the value of the active day in the calendar
const CALENDAR_CONFIG = {};
// The html element that has the current active month in the calendar
CALENDAR_CONFIG.navPlaceholder = document.querySelector(
  ".calendar-placeholder .current-active-month"
);
// The html element the clandar will be placed inside
CALENDAR_CONFIG.calendarPlaceholder = document.querySelector(
  ".calendar-placeholder .month-container"
);
CALENDAR_CONFIG.activeDay;
CALENDAR_CONFIG.activeCell;

/**
 * Renders the calendar to the frontend with the start date of calendarStartDate
 * If interceptDateClicked passed, it will call the function whever a cell is clicked
 * and pass the date to the function
 * @param {Date} calendarStartDate
 * @param {*} interceptDateClicked
 */
function renderCalendar(calendarStartDate, interceptDateClicked) {
  CALENDAR_CONFIG.activeDate = calendarStartDate;
  bindCalendarControls(calendarStartDate);
  CALENDAR_CONFIG.calendarPlaceholder.addEventListener("click", (e) =>
    calendarClicked(e, interceptDateClicked)
  );
}

/** bindCalendarControls(date)
 * @param date a date object
 * @param activeDay integer of the day of the month that should be active
 * will bind click events to the next/previous buttons in the calendar
 * It looks for elements with classes "previous-month" and "next-month"
 */
function bindCalendarControls(date) {
  date = new Date(date);
  let activeDay = -1;
  document
    .querySelector(".calendar-placeholder .next-month")
    .addEventListener("click", () => {
      date.setMonth(date.getMonth() + 1);
      updateCalendar();
    });

  document
    .querySelector(".calendar-placeholder .previous-month")
    .addEventListener("click", () => {
      date.setMonth(date.getMonth() - 1);
      updateCalendar();
    });

  function updateCalendar() {
    activeDay =
      date.getFullYear() == CALENDAR_CONFIG.activeDate?.getFullYear() &&
      date.getMonth() == CALENDAR_CONFIG.activeDate?.getMonth()
        ? CALENDAR_CONFIG.activeDate.getDate()
        : -1;
    insertCalendar(date, activeDay);
  }

  updateCalendar();
  CALENDAR_CONFIG.activeCell = CALENDAR_CONFIG.calendarPlaceholder.querySelector(
    ".active"
  );
}

/** insert Calendar(date)
 * @param date is a date object
 * @param activeDay integer representing the active day on calendar, leave to default if no active day
 * the function renders a calendar to the view for the month in the date passed, it will render it to an element with class "month-container"
 * It takes care of adding the current month and year to an html element with the class "current-active-month"
 */
function insertCalendar(date, activeDay = -1) {
  CALENDAR_CONFIG.navPlaceholder.innerHTML = `${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()}`;
  CALENDAR_CONFIG.calendarPlaceholder.innerHTML = calendarHTML(date, activeDay);
}

/** calendarHTML(date, day)
 * @param date date object, will be used to render days of the month in the date
 * @param day an integer representing the a day that should be given the "active" class, such as today's date for example
 * Givin a date, the function will create html calendar for the month (It will set the day to first of the month!)
 */
function calendarHTML(date, day = -1) {
  date = new Date(date);
  date.setDate(1);
  let year = date.getFullYear();
  let month = date.getMonth();
  let monthStartDay = date.getDay();
  let html = "";

  html += `<div class="month" data-year="${year}" data-month="${month}">`;

  // Create week days (sun - sat)
  html += `<div class="row week-days">`;
  for (let i = 0; i < 7; ++i)
    html += `
      <div class="week-day cell">
        <p>${DAYS[i].substr(0, 3)}</p>
      </div>
    `;
  html += `</div>`;

  // increments month day and check if it is still as the month supplied
  while (date.getMonth() == month) {
    // If month doesn't start at sunday, add empty day cells
    if (date.getDate() == 1 && monthStartDay != 0) {
      html += `<div class="row">`;
      for (let i = 0; i < monthStartDay; i++) {
        html += `<div class="day cell disabled"></div>`;
      }
    } else html += `<div class="row">`;
    // Create week day cells (sun 0 - sat 6)
    for (let i = date.getDay(); i < 7 && date.getMonth() == month; ++i) {
      html += `
          <div class="day cell button ${
            day == date.getDate() ? "active" : ""
          } ${isToday(date) ? "today" : ""}" data-day="${date.getDate()}">
            <span>${date.getDate()}</span>
          </div>
        `;
      date.setDate(date.getDate() + 1);
    }
    html += "</div>";
  }

  html += `</div>`;
  return html;
}

// returns the date of the day clicked in the calendar
function calendarClicked(e, interceptDateClicked) {
  if (
    !e.target.closest(".day") ||
    !e.target.closest(".day").getAttribute("data-day")
  ) {
    return;
  }
  // Remove the active class from the previously clicked element and adds it to the newly clicked
  CALENDAR_CONFIG.calendarPlaceholder
    .querySelector(".day.active")
    ?.classList.remove("active");
  CALENDAR_CONFIG.activeCell = e.target.closest(".day");
  CALENDAR_CONFIG.activeCell?.classList.add("active");

  // Parse the year, month and day from the clicked element in the calendar
  let year = CALENDAR_CONFIG.activeCell
    .closest(".month")
    .getAttribute("data-year");
  let month = CALENDAR_CONFIG.activeCell
    .closest(".month")
    .getAttribute("data-month");
  let day = CALENDAR_CONFIG.activeCell.getAttribute("data-day");

  const dateClicked = new Date(year, month, day);
  if (!dateClicked) interceptDateClicked(false);
  else {
    CALENDAR_CONFIG.activeDate = dateClicked;
    if (interceptDateClicked) interceptDateClicked(dateClicked);
  }
}

/** Calendar ends  **********************************************/

/**
 * Checks if the date passed is equal to today
 * @param {Date} someday
 */
function isToday(someday) {
  if (
    TODAY.getFullYear() == someday.getFullYear() &&
    TODAY.getMonth() == someday.getMonth() &&
    TODAY.getDate() == someday.getDate()
  )
    return true;
  return false;
}

/**
 * Passed a date object, will create standard date format for the application
 * @param {Date} date
 * @returns
 */
function stdDateFormat(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Passed a date object, will create standard time format for the application
 * @param {Date} date
 * @returns
 */
function stdTimeFormat(date) {
  let eventHour = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
  eventHour = eventHour == 0 ? 12 : eventHour;
  return `${eventHour}:${String(date.getMinutes()).padEnd(2, 0)}${
    date.getHours() > 12 ? "pm" : "am"
  }`;
}
