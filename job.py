import sqlite3
import pandas as pd

def run():
  # load dataframe
  dfs = []
  with sqlite3.connect('./db/database.db') as cnx:
      try:
          # pre-pend 99000 to userId to avoid conflicts
          dfs.append(pd.read_sql_query("SELECT (99000 + userId) as userId, movieId, rating FROM ratings", cnx))
      except:
          print("Unable to get historical data")
          exit(1)
      try:
          dfs.append(pd.read_sql_query("SELECT userId, movieId, rating FROM new_ratings", cnx))
      except:
          print("No new data")

  rating_data = pd.concat(dfs)

  from surprise import Dataset
  from surprise import Reader
  from surprise import SVD
  from surprise.model_selection import cross_validate

  reader = Reader(rating_scale=(0.5, 5))
  data = Dataset.load_from_df(rating_data[['userId', 'movieId', 'rating']], reader)

  # trainset, testset = train_test_split(data, test_size=.20)
  trainset = data.build_full_trainset()
  algo = SVD()
  cross_validate(algo, data, measures=['RMSE', 'MAE'], cv=5, verbose=True)

  algo.fit(data.build_full_trainset())
  predictions = algo.test(trainset.build_anti_testset())

  import time
  from collections import defaultdict

  top_n = defaultdict(list)
  for uid, iid, true_r, est, _ in predictions:
    if uid > 90000:
      continue
    top_n[uid].append((iid, est))

  k = 10
  for uid, user_ratings in top_n.items():
    user_ratings.sort(key=lambda x: x[1], reverse=True)
    top_n[uid] = user_ratings[:k]

  now = int(time.time()) # seconds since epoch
  with sqlite3.connect('./db/database.db') as cnx:
    for idx, [uid, user_ratings] in enumerate(top_n.items()):
      for (iid, rating) in user_ratings:
        cnx.execute(f"""
                    INSERT INTO recommendations (userId, movieId, rating, timestamp) 
                    VALUES ({uid}, {iid}, {rating}, {now})
                    ON CONFLICT(userId, movieId) DO UPDATE SET rating = {rating}, timestamp = {now}""")
      cnx.commit()

