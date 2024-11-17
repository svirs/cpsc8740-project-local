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
    cur.execute("CREATE TABLE users (username TEXT PRIMARY KEY, password TEXT, onboarded BOOLEAN)")
    con.commit()