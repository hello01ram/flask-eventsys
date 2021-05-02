/**
 * This is a simple library to run http requests (GET and POST) using XMLHttpRequest object
 *
 * It consists of a single class that can be initiated and configured easily
 */

class HTTP {
  /**
   * Creates a new XMLHttpRequest object and, if run set to true, runs it
   * It takes an object of configuration:
   * url: Required. The url used as endpoint
   * method: the request HTTP method (default 'GET')
   * params: Object containing parameters
   * headers: Object containing HTTP headers
   * callback: a callback function to run if the request is successfull
   * run: If set to true and there is a callback, it will start the request
   * @param {String} method
   * @param {String} url
   * @param {String} params
   * @param {Function} callback
   * @param {Boolean} run
   */
  constructor({ ...args }) {
    this._xhr = new XMLHttpRequest();
    this.url = args.url; // endpoint to request
    this.method = args.method ? args.method : "GET"; // HTTP method (e.g GET)
    this.params = args.params ? args.params : {}; // object that will be used as parameters
    this.headers = args.headers ? args.headers : {}; // Any key value pairs as HTTP headers
    this.readyState = this._xhr.readyState; // The request readyState (e.g 0, 1, .., 4)
    this.status; // HTTP status (e.g 200)
    this.response = "";
    this.responseHeaders = {};
    this.requestSuccess = true;
    this.callback = args.callback; // function will be called once the request is successful
    if (args.run) {
      // if run is true, run the request and listen for a response
      this.getResponse(this.callback);
    }
  }

  /**
   * an easy way to change parameters like 'method', 'url', 'headers', etc, by providing an object with property names and values
   * @param {Object} settings
   */
  config(settings = {}) {
    for (let setting in settings) {
      this[setting] = settings[setting];
    }
  }

  /**
   * Set HTTP headers by using using the 'params' property keys and values
   *
   * Note that 'Content-type' header is automatically set to "application/x-www-form-urlencoded" if the method is 'POST'
   */
  _setHeaders() {
    if (this.method == "POST" && !this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    for (let header in this.headers)
      this._xhr.setRequestHeader(header, this.headers[header]);
  }

  /**
   * Creates a valid parameter format to be send to the server
   */
  _prepareParams() {
    // Creates a valid parameter format
    // Parameters are stored in the _params property
    let params = "";
    for (let param in this.params)
      params += `${param}=${encodeURI(this.params[param])}&`;
    params = params.substr(0, params.length - 1);
    return params;
  }

  /**
   * Opens the HTTP request
   *
   * If GET request, it will add the parameters automatically to the URL
   */
  _open() {
    if (this.method == "GET") {
      let params = this._prepareParams();
      if (params) this.url += `?${params}`;
    }
    this._xhr.open(this.method, this.url, true);
    this.readyState = this._xhr.readyState;
  }

  /**
   * Send an HTTP request
   * @param {Function} callback
   */
  send() {
    this._open();
    this._setHeaders();
    let params = this._prepareParams();
    if (this.method == "POST" && params) {
      this._xhr.send(params);
      return;
    }
    this._xhr.send();
  }

  /**
   * The method send the request and listen for a response
   *
   * The callback is called once a response is ready and results are passed to it
   * @param {Function} callback
   */
  getResponse(callback) {
    this.send();
    if (callback) this.callback = callback;
    this._xhr.onreadystatechange = function () {
      this.readyState = this._xhr.readyState;
      this.status = this._xhr.status;
      if (this.readyState == 4 && this.status == 200) {
        this.requestSuccess = true;
        this.response = this._xhr.responseText;
        this.responseHeaders = this._xhr.getAllResponseHeaders();
        this.callback(this);
      } else if (this.readyState == 4 && this.status != 200) {
        this.requestFailed();
        this.callback(this);
      }
    }.bind(this);

    this._xhr.onerror = this.requestFailed.bind(this);
  }

  requestFailed() {
    this.requestSuccess = false;
  }

  getJSON() {
    return JSON.parse(this.response);
  }
}
