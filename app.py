import sqlite3
import bcrypt
from flask import Flask, request, redirect, make_response, session

app = Flask(__name__)
app.secret_key = b'Y\xf1Xz\x00\xad|eQ\x80t \xca\x1a\x10K' # for session

@app.route("/user", methods=["GET"])
def user_get():
    # validate user exists
    username = request.args.get('username')
    password = request.args.get('password')
    with sqlite3.connect('./db/database.db') as cnx:
        cursor = cnx.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        _, hashed_password = user
        if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
            session["name"] = username
        else:
            return redirect('http://localhost:3000/login?failed=true')
    
    return redirect('http://localhost:3000')

@app.route("/user", methods=["POST"])
def user_post():
    # make user exists
    username = request.form.get('username')
    password = request.form.get('password')
    if len(password) < 4:
        return redirect('http://localhost:3000/signup?failed=true')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    with sqlite3.connect('./db/database.db') as cnx:
        cursor = cnx.cursor()
        # check if user exists no duplicates (consider unique constraint)
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        if user:
            return redirect('http://localhost:3000/signup?failed=true')
        cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_password))
        cnx.commit()
    
    response = make_response(redirect('http://localhost:3000'))
    response.set_cookie('username', username, domain="http://localhost:3000")
    return response
