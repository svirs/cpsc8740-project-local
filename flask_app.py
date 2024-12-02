import sqlite3
import time
import bcrypt
from flask import Flask, request, redirect, make_response, session

import job

app = Flask(__name__)
app.secret_key = b"Y\xf1Xz\x00\xad|eQ\x80t \xca\x1a\x10K"  # for session


# http://localhost:3000/api/user
@app.route("/user", methods=["GET"])
def user_get():
    # validate user exists
    username = request.args.get("username")
    password = request.args.get("password")
    with sqlite3.connect("./db/database.db") as cnx:
        cursor = cnx.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if not user:
            return redirect("http://localhost:3000/login?failed=Unauthorized")
        id, _, hashed_password = user
        if bcrypt.checkpw(password.encode("utf-8"), hashed_password):
            session["id"] = id
        else:
            return redirect("http://localhost:3000/login?failed=Unauthorized")

    return redirect("http://localhost:3000")


# http://localhost:3000/api/user
@app.route("/user", methods=["POST"])
def user_post():
    # make user exists
    username = request.form.get("username")
    password = request.form.get("password")
    if len(password) < 4:
        return redirect("http://localhost:3000/signup?failed=true")
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    with sqlite3.connect("./db/database.db") as cnx:
        cursor = cnx.cursor()
        # check if user exists no duplicates (consider unique constraint)
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user:
            return redirect("http://localhost:3000/signup?failed=true")
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, hashed_password),
        )
        cnx.commit()
        cursor.execute("SELECT userId FROM users WHERE username = ?", (username,))
        data = cursor.fetchone()
        session["id"] = data[0]

    response = make_response(redirect("http://localhost:3000"))
    return response


# http://localhost:3000/api/home
@app.route("/home", methods=["GET"])
def data_get():
    # get data
    user = session.get("id")
    if not user:
        return make_response("user not logged in", 401)
    with sqlite3.connect("./db/database.db") as cnx:
        cursor = cnx.cursor()
        cursor.execute("SELECT * FROM users WHERE userId = ?", (user,))
        data = cursor.fetchone()
        if not data:
            return make_response("user not found", 404)
        cursor.execute("SELECT count(*) FROM new_ratings WHERE userId = ?", (user,))
        data = cursor.fetchone()
        if not data or data[0] < 5:
            return make_response("missing ratings for recommendations", 403)
        cursor.execute("SELECT count(*) FROM recommendations WHERE userId = ?", (user,))
        data = cursor.fetchone()
        if not data:
            return make_response("recommendations not ready", 204)
        # show reccomendations
        cursor.execute(
            """
            SELECT m.* FROM recommendations r
            JOIN movies m ON r.movieId = m.movieId
            WHERE r.userId = ?
            """,
            (user,),
        )
        data = cursor.fetchall()
        return [
            {"id": id, "title": title, "genres": genres.split("|")}
            for id, title, genres in data
        ]


# http://localhost:3000/api/onboarding
@app.route("/onboarding", methods=["GET"])
def onboarding_get():
    # get onboarding status
    user = session.get("id")
    if not user:
        return make_response("user not logged in", 401)
    with sqlite3.connect("./db/database.db") as cnx:
        cursor = cnx.cursor()
        cursor.execute("SELECT * FROM users WHERE userId = ?", (user,))
        data = cursor.fetchone()
        if not data:
            return make_response("user not found", 404)
        cursor.execute("SELECT count(*) FROM new_ratings WHERE userId = ?", (user,))
        data = cursor.fetchone()
        if not data:
            return make_response("user not found", 404)
        [ratings] = data

        if ratings >= 5:
            return make_response("user already onboarded", 403)
        return {"ratings": ratings}


# http://localhost:3000/api/movies
@app.route("/movies", methods=["GET"])
def movie_get():
    # get movie data by title
    user = session.get("id")
    if not user:
        return make_response("user not logged in", 401)
    title = request.args.get("title")
    if not title:
        return make_response("movie title not provided", 400)
    with sqlite3.connect("./db/database.db") as cnx:
        cursor = cnx.cursor()
        cursor.execute(
            """
            WITH user_ratings AS (
                SELECT movieId from new_ratings WHERE userId = ?
            )
            SELECT m.* FROM movies m
            LEFT JOIN user_ratings ur ON m.movieId = ur.movieId
            WHERE lower(m.title) like ? and ur.movieId is null
            limit 10""",
            (
                user,
                f"%{title.lower()}%",
            ),
        )
        data = cursor.fetchall()
        if not data:
            return make_response("movie not found", 404)
        return [
            {"id": id, "title": title, "genres": genres.split("|")}
            for id, title, genres in data
        ]


# http://localhost:3000/api/rating
@app.route("/rating", methods=["POST"])
def rating_post():
    # post rating for user
    user = session.get("id")
    if not user:
        return make_response("user not logged in", 401)
    movie_id = request.json["movieId"]
    if not movie_id:
        return make_response("movie id not provided", 400)
    rating = request.json["rating"]
    if rating is None or not 0 <= rating <= 5:
        return make_response("invalid rating", 400)
    with sqlite3.connect("./db/database.db") as cnx:
        cursor = cnx.cursor()
        # find if rating exists
        cursor.execute(
            "SELECT * FROM new_ratings WHERE userId = ? AND movieId = ?",
            (user, movie_id),
        )
        data = cursor.fetchone()
        if data:
            return make_response("rating already exists", 403)
        cursor.execute(
            "INSERT INTO new_ratings (userId, movieId, rating, timestamp) VALUES (?, ?, ?, ?)",
            (user, movie_id, rating, int(time.time())),
        )
        cnx.commit()
        return make_response("rating added", 200)

# @app.route("/logout", methods=["GET"])

@app.route("/job", methods=["GET"])
def job_get():
    # run job
    job.run()
    return make_response("job done", 200)