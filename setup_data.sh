mkdir data/
curl https://files.grouplens.org/datasets/movielens/ml-latest-small.zip  -o data/ml-latest-small.zip
unzip data/ml-latest-small.zip -d data/
rm data/ml-latest-small.zip