import sqlite3
import pandas as pd
import os

# relies on setup.py to download the data

# load "historic" data
parent_path = './data/ml-latest-small/'
tables = ['movies', 'ratings', 'tags', 'links']

#ensure folder db exists
if not os.path.exists('./db'):
    os.makedirs('./db')

# init historical databases
with sqlite3.connect("./db/database.db") as con:
    cur = con.cursor()
    for table in tables:
        df = pd.read_csv(f'./{parent_path}/{table}.csv')
        #delete table if it exists
        cur.execute(f"DROP TABLE IF EXISTS {table}")
        con.commit()
        # drop data into database
        df.to_sql(table, con, schema=None, if_exists='replace', index=False)

# init user database
with sqlite3.connect("./db/database.db") as con:
    cur = con.cursor()
    cur.execute(f"DROP TABLE IF EXISTS users")
    cur.execute("CREATE TABLE users (userId INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)")
    con.commit()

# init recs database
with sqlite3.connect("./db/database.db") as con:
    cur = con.cursor()
    cur.execute(f"DROP TABLE IF EXISTS recommendations")
    cur.execute("CREATE TABLE IF NOT EXISTS recommendations (userId INT, movieId INT, rating REAL, timestamp INT, UNIQUE(userId, movieId) ON CONFLICT REPLACE)")
    con.commit()

# init new_ratings db
with sqlite3.connect("./db/database.db") as con:
    cur = con.cursor()
    cur.execute(f"DROP TABLE IF EXISTS new_ratings")
    cur.execute("CREATE TABLE IF NOT EXISTS new_ratings (userId INT, movieId INT, rating REAL, timestamp INT)")
    con.commit()