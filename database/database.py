import sqlite3
from flask import g

def make_dicts(cursor, row):
  return dict((cursor.description[idx][0], value)
    for idx, value in enumerate(row))

def get_db():
  db = getattr(g, '_database', None)
  if db is None:
    db = g._database = Database('database/database.db')
  return db

def close_db():
  db = getattr(g, '_database', None)
  if db is not None:
    db.close()

class Database:
  def __init__(self, dbname):
    """
      Connect to a sqlite database, 
      @param dbname: the name of the database to connect to
      creates two properties:
        _con: database connection
        _cur: a cursor to query
    """
    self._con = sqlite3.connect(dbname)
    self._con.row_factory = make_dicts
    self._cur = self._con.cursor()

  def close(self):
    """
      Closes a connection 
    """
    self._con.close()

  def exec(self, sql, data=[]):
    """ 
      exec(self, sql)
      @param sql: a sql query to be executed
      executes the sql query provided and return the results
      Note: this method doesn't commit
    """
    return self._cur.execute(sql, data)

  def exec_commit(self, sql, data=[]):
    """ 
      exec_commit(self, sql)
      @param sql: a sql query to be executed
      executes the sql query provided and return the results
      Note: this method commits after executing
    """
    results = self.exec(sql, data)
    self._con.commit()
    return results
  
  def query(self, table, order=None):
    """
      query(self, table)
      @param table: database table to query
      @param order: Optional. A dict containing key values where key is table columns and vlaues is the order 'DESC' or 'ASC'
      Runs a select statement and return all results
    """
    if order: 
      # All records ordered a certain way
      orderList = ', '.join([f'{key} {value}' for key, value in order.items()])
      query = f'SELECT * FROM {table} ORDER BY {orderList}'
    else: 
      query = f'SELECT * FROM {table}'
    results = self.exec(query)
    return results

  def insert(self, table, data):
    """
      insert(self, table, data)
      insert a record to the table using the data dictonary
      @param table: database table that row will be inserted into
      @param data: a dictionary containing all data that will be inserted
    """
    fields = ', '.join(list(data.keys()))
    placeholder = ', '.join(['?'] * len(data))
    values = list(data.values())
    query = f'INSERT INTO {table} ({fields}) VALUES ({placeholder})'
    return self.exec_commit(query, values)
  
  def delete(self, table, data):
    """
      delete(self, table, data)
      deletes a single record from table using data passed in data parameter
      @param table: database table
      @param data: dictionary containing that used as filters. Keys in the data are column names and values are column values
    """
    query = f'DELETE FROM {table} WHERE '
    query += [f'{key}=?' for key, value in data.items()][0]
    return self.exec_commit(query, list(data.values()))

  def update(self, table, data, filters): 
    """
      update(self, table, data, filters)
      Update a single record with the data in the data dictionary and using the data in 
      the filters dictionary to limit it to one record
      @param table: database table
      @param data: a dictionary containing keys as column names and values as values for these columns
      @param filters: a dictionary containg keys as column names and values that are used to apply changes to only records with matching values
    """
    query = f'UPDATE {table} SET '
    query += ', '.join([f'{key}=?' for key, value in data.items()])
    query += ' WHERE '
    query += [f'{key}=?' for key, value in filters.items()][0]
    return self.exec_commit(query, list(data.values()) +  list(filters.values()))

  

