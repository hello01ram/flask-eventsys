const REQUEST_FAILED_MSG = "Request Failed!";

insertHeadingDate(TODAY);

/**
 * Toggles the class 'show' of a popup window
 * toggleOnClick will toggle the class when the window is clicked
 * toggleAndAddEvent is a boolean. If true, will toggle the class then add the event
 * @param {Node} popupWindow
 * @param {Boolean} toggleOnClick
 * @param {Boolean} toggleAndAddEvent
 */
function togglePopupWindow(popupWindow, toggleOnClick, toggleAndAddEvent) {
  if (!toggleOnClick || toggleAndAddEvent) popupWindow.classList.toggle("show");
  if (toggleOnClick) {
    popupWindow.onclick = (e) => {
      if (!e.target.closest(".popup-container"))
        popupWindow.classList.toggle("show");
    };
  }
}

/**
 * Creates a popup window with a message
 * When clicked outside the container, the popup disappears
 * @param {String} message
 */
function pupupMessage(message = "") {
  const popupWindow = document.createElement("div");
  popupWindow.classList.add("popup", "show");
  popupWindow.innerHTML = `<div class="popup-container">${message}</div>`;
  document.body.appendChild(popupWindow);
  popupWindow.onclick = (e) => {
    if (!e.target.closest(".popup-container")) {
      document.body.removeChild(popupWindow);
    }
  };
}

/**
 * Returns path like '/events' if no argument is passed.
 * if 'special' is passed, return true if path equal spcial, false otherwise
 * @param {string} special
 * @returns {boolean}
 */
function path(special = "") {
  if (special) return window.location.pathname == special;
  return window.location.pathname;
}

/**
 * Abstracts only the form elements (input, select, textarea, etc) that are in formNames array from form element
 * Returns an object with form element names as keys and elements as values
 * @param {Array} formNames
 * @param {Node} form
 * @returns Object of nodes
 */
function getFormElements(formNames = [], form = Node) {
  const formElements = {};
  for (let name of formNames) formElements[name] = form.elements[name];
  return formElements;
}

/**
 * Renders all errors inside of the 'error' object into 'errorBox' element
 *
 * If formElements object is passed, will add an HTML class 'error' to the corresponding
 * element that has the error
 * @param {Object} errors
 * @param {Node} errorBox
 * @param {Object} formElements
 */
function renderErrors(errors = {}, errorBox, formElements = {}) {
  if (!errorBox) return;
  let html = "";
  html += '<div class="errors-box">';
  html += "<h3>Errors in your form</h3>";
  for (let err in errors) {
    html += `<p class="error"><span>${err}</span>: ${errors[err]}</p>`;
    console.log('Here', formElements[err]);
    formElements[err]?.classList.add("error");
  }
  html += "</div>";
  errorBox.innerHTML = html;
}

/**
 * Empty the html of the errorBox, and remove the 'error' class from the elements inside of formElements
 * @param {Node} errorBox
 * @param {Object} formElements
 */
function removeErrors(errorBox = Node, formElements = {}) {
  for (let element in formElements) {
    formElements[element]?.classList?.remove("error");
  }
  errorBox.innerHTML = "";
}

/**
 * It checks for empty element values in the formElements object
 *
 * If an element with empty value is found, it is added to an errors object which is returned at the end
 *
 * Name of the element is used as key in the errors object
 *
 * skipElements array is optional and it contains the name of the elements that should be skipped (not checked)
 * @param {Object} formElements
 * @param {Object} skipElements
 * @returns Object
 */
function checkEmptyElements(formElements = {}, skipElements = []) {
  const formErrors = {};
  for (let element in formElements) {
    if (
      !skipElements.includes(element) &&
      !formElements[element]?.value.trim()
    ) {
      formErrors[element] = "Please input a value";
    }
  }
  return formErrors;
}

/** InsertHeadingDate(date)
 * @param date is a date object
 * Inserts date information to the header of the page
 * date: date object
 */
function insertHeadingDate(date) {
  date = new Date(date);
  let weekDay = DAYS[date.getDay()];

  // let dayTodayHTML = `<span class="day medium">${weekDay}</span>`;
  let dateHTML = `<span class="date">${weekDay}: ${stdDateFormat(date)}</span>`;

  document.querySelector(".date-placeholder").innerHTML = dateHTML;
}
