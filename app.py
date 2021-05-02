from flask import Flask, render_template, request, jsonify
from database.database import Database, get_db, close_db
from datetime import time

app = Flask(__name__)

@app.teardown_appcontext
def close_connection(exception):
    close_db()

@app.route('/')
def index():
  return render_template('index.html', page_title = 'Homepage')


@app.route('/events')
def events():
  return render_template('events.html', page_title = 'Events')


# Events API
# Select all events
@app.route('/api/events')
def showEvents():
  db = get_db()
  todayDate = request.args.get('today')
  if not todayDate: 
    todayDate = time()
  # query = 'SELECT * FROM events WHERE date >= ? ORDER BY date ASC'
  events = db.query('events', {'timestamp': 'ASC'}).fetchall()
  return jsonify({'success': events})

# returns a single event when passed a valid event ID
@app.route('/api/events/<int:eventID>')
def event(eventID):
  db = get_db()
  event = db.exec('SELECT * FROM events WHERE id = ? LIMIT 1', [eventID]).fetchone()
  if not event: 
    return jsonify({'success': False})
  # No error with the data, process the insert 
  return jsonify({'success': event})

# Insert an event to the database 
@app.route('/api/events/add', methods=['POST'])
def addEvent():
  db = get_db()
  # add event form submitted, process input and insert a new event to db
  error = False
  eventData = {
    'name': request.form.get('name'),
    'timestamp': request.form.get('timestamp'),
    'recurring': request.form.get('recurring'),
    'notes': request.form.get('notes')
  }
  for field in eventData:
    if (not eventData[field] or not str(eventData[field]).strip()) and field not in ['notes', 'recurring']:
      error = True
  # if there is an error, return an object 
  if (error): 
    return jsonify({'success': False})
  # No error with the data, process the insert 
  rowID = db.insert('events', eventData).lastrowid
  if not rowID:
    return jsonify({'success': False})
  return jsonify({'success': rowID})


# Deletes a single event 
@app.route('/api/events/delete/<int:eventID>')
def deleteEvent(eventID):
  db = get_db()
  event = db.exec('SELECT * FROM events WHERE id = ?', [eventID]).fetchone()
  if not event: 
    return jsonify({'success': False})
  rowsDeleted = db.delete('events', {'id': eventID}).rowcount
  if rowsDeleted != 1:
    return jsonify({'success': False})
  return jsonify({'success': eventID})

# Deletes a single event 
@app.route('/api/events/update/<int:eventID>', methods=["POST"])
def updateEvent(eventID):
  db = get_db()
  event = db.exec('SELECT * FROM events WHERE id = ?', [eventID]).fetchone()
  if not event: 
    return jsonify({'success': False})
  error = False
  eventData = {
    'name': request.form.get('name'),
    'timestamp': request.form.get('timestamp'),
    'recurring': request.form.get('recurring'),
    'notes': request.form.get('notes')
  }
  for field in eventData:
    if (not eventData[field] or not str(eventData[field]).strip()) and field not in ['notes', 'recurring']:
      error = True
  # if there is an error, return an object 
  if (error): 
    return jsonify({'success': False})
  rowsUpdated = db.update('events', eventData, {'id': eventID}).rowcount
  if rowsUpdated != 1:
    return jsonify({'success': False, 'message': 'Record was not found in the database!'})
  return jsonify({'success': eventID})

@app.route('/api/events/day')
def dayEvents():
  db = get_db()
  timestamp = int(request.args.get('timestamp'))

  if (not timestamp):
    return jsonify({'success': False, 'message': 'missing a GET parameter'})

  query = """
  SELECT * FROM events 
    WHERE 
      date(timestamp / 1000, 'unixepoch', 'localtime') = date(:timestamp / 1000, 'unixepoch', 'localtime')
      OR 
      (
        recurring = 1 AND 
        strftime('%d/%m', timestamp / 1000, 'unixepoch', 'localtime') = strftime('%d/%m', :timestamp / 1000, 'unixepoch', 'localtime')
      )
    ORDER BY 
      strftime('%H', timestamp / 1000, 'unixepoch', 'localtime') ASC, 
      strftime('%M', timestamp / 1000, 'unixepoch', 'localtime') ASC
  """

  events = db.exec(query, {'timestamp': timestamp}).fetchall()
  return jsonify({'success': events})

@app.route('/api/events/year')
def yearEvents():
  db = get_db()
  year = int(request.args.get('year'))

  if (not year):
        return jsonify({'success': False, 'message': 'missing a GET parameter'})
  query = """
    SELECT * FROM events 
    WHERE
      recurring = 1
      OR
      CAST(strftime('%Y', timestamp / 1000, 'unixepoch', 'localtime') AS INTEGER) = :year
    ORDER BY
    strftime('%m', timestamp / 1000, 'unixepoch', 'localtime') ASC, 
    strftime('%d', timestamp / 1000, 'unixepoch', 'localtime') ASC, 
    strftime('%H', timestamp / 1000, 'unixepoch', 'localtime') ASC, 
    strftime('%M', timestamp / 1000, 'unixepoch', 'localtime') ASC
  """

  events = db.exec(query, {'year': year}).fetchall()
  return jsonify({'success': events})



