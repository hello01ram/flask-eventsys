# flask-eventsys
 A simple Flask application for creating calendar events.
 The application has a calendar which you can click on and the app gets all events happening at that day. 
 You can create new events with name and date, and, you can also choose whether an event recurring (Someone's birthday). And, you can update and delete events. 
 
 Another page is for year events. You can write the year you want and the application gets you all events happening at that year. 

 The application uses APIs to do most of it's functionalities asynchronously. 

 There are many ways to go about doing the application. I used the callback way of doing the HTTP requests (I think a better way would be using promises).

 The tools I used to build the application: 

 * Backend: 
   * Server-side language: Python
   * Framework: Flask 
   * Template engine: Flask default (Jinja)

 * Database: 
   * Sqlite database

 * Frontend: 
   * HTML
   * CSS
   * JavaScript
