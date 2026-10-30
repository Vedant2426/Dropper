# Assignment 6: Movie Rating Prediction using Embedding-based DNN
# Dataset: MovieLens Latest Small
# Keep ratings.csv and movies.csv in the same folder as this notebook/script.

# 1. Import libraries
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    Input, Embedding, Flatten, Dense, Concatenate, Dropout
)

# 2. Load datasets
# If the CSV files are not in the current working directory, replace these
# filenames with the full paths to your ratings.csv and movies.csv.
ratings = pd.read_csv("ratings.csv")
movies = pd.read_csv("movies.csv")

# 3. Explore datasets
print("Ratings information:")
ratings.info()
print("\nMovies information:")
movies.info()

print("\nRatings preview:")
print(ratings.head())
print("\nMovies preview:")
print(movies.head())

# 4. Check missing values
print("\nMissing values in ratings:")
print(ratings.isnull().sum())
print("\nMissing values in movies:")
print(movies.isnull().sum())

# 5. Encode user and movie IDs
# Save a copy of original ratings to support recommendations later.
ratings_original = ratings[["userId", "movieId", "rating"]].copy()

ue = LabelEncoder()
me = LabelEncoder()

ratings["user"] = ue.fit_transform(ratings["userId"])
ratings["movie"] = me.fit_transform(ratings["movieId"])

# Keep encoded user/movie indices and the target rating.
# Original IDs and timestamp are not model inputs.
ratings = ratings[["rating", "user", "movie"]].copy()

# 6. Define model inputs and target
X_user = ratings["user"].values
X_movie = ratings["movie"].values
y = ratings["rating"].values.astype("float32")

# 7. Split data into training and testing sets
(
    X_user_train, X_user_test,
    X_movie_train, X_movie_test,
    y_train, y_test
) = train_test_split(
    X_user,
    X_movie,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTraining shapes:")
print(X_user_train.shape)
print(X_movie_train.shape)
print(y_train.shape)

print("\nTesting shapes:")
print(X_user_test.shape)
print(X_movie_test.shape)
print(y_test.shape)

# 8. Count unique users and movies
num_users = ratings["user"].nunique()
num_movies = ratings["movie"].nunique()

print("\nNumber of Users:", num_users)
print("Number of Movies:", num_movies)

# 9. Define input layers
user_input = Input(shape=(1,), name="User_Input")
movie_input = Input(shape=(1,), name="Movie_Input")

# 10. Embedding layers (50-dimensional embeddings, as in the practical)
user_embedding = Embedding(
    input_dim=num_users,
    output_dim=50,
    name="user_embedding"
)(user_input)

movie_embedding = Embedding(
    input_dim=num_movies,
    output_dim=50,
    name="movie_embedding"
)(movie_input)

# 11. Flatten embedding outputs
user_vector = Flatten()(user_embedding)
movie_vector = Flatten()(movie_embedding)

# 12. Concatenate user and movie vectors
merged = Concatenate()([user_vector, movie_vector])

# 13. Dense layers and Dropout
x = Dense(128, activation="relu")(merged)
x = Dropout(0.3)(x)

x = Dense(64, activation="relu")(x)
x = Dropout(0.3)(x)

x = Dense(32, activation="relu")(x)

# One continuous value: predicted rating
output = Dense(1, name="predicted_rating")(x)

# 14. Create and compile the model
model = Model(inputs=[user_input, movie_input], outputs=output)
model.compile(
    optimizer="adam",
    loss="mse",
    metrics=["mae"]
)

model.summary()

# 15. Train the model
history = model.fit(
    [X_user_train, X_movie_train],
    y_train,
    epochs=10,
    batch_size=64,
    validation_split=0.2
)

# 16. Evaluate on test data
loss, mae = model.evaluate(
    [X_user_test, X_movie_test],
    y_test,
    verbose=1
)

print("\nTest Loss:", loss)
print("Test MAE:", mae)

# 17. Predict the rating for one test example
sample_user = int(X_user_test[0])
sample_movie = int(X_movie_test[0])
actual_rating = float(y_test[0])

predicted_rating = model.predict(
    [
        np.array([sample_user], dtype=np.int32),
        np.array([sample_movie], dtype=np.int32)
    ],
    verbose=0
)[0][0]

print("\nSample prediction:")
print("Actual Rating:", actual_rating)
print("Predicted Rating:", float(predicted_rating))

# 18. Recommend the top 10 unseen movies for one user.
# Select the first original user in the dataset.
original_user_id = ratings_original["userId"].iloc[0]
encoded_user_id = int(ue.transform([original_user_id])[0])

# Predict ratings for every movie represented in ratings.csv.
all_movie_indices = np.arange(num_movies, dtype=np.int32)
user_indices = np.full(num_movies, encoded_user_id, dtype=np.int32)

all_predictions = model.predict(
    [user_indices, all_movie_indices],
    batch_size=1024,
    verbose=0
).flatten()

recommendations = pd.DataFrame({
    "movie_index": all_movie_indices,
    "predicted_rating": all_predictions
})

# Exclude movies already rated by the selected user.
rated_original_movie_ids = ratings_original.loc[
    ratings_original["userId"] == original_user_id, "movieId"
].unique()

rated_movie_indices = me.transform(rated_original_movie_ids)
recommendations = recommendations[
    ~recommendations["movie_index"].isin(rated_movie_indices)
].sort_values("predicted_rating", ascending=False)

# Map encoded indices back to original movie IDs and titles.
recommendations["movieId"] = me.inverse_transform(
    recommendations["movie_index"].to_numpy(dtype=int)
)

recommendations = recommendations.merge(
    movies[["movieId", "title", "genres"]],
    on="movieId",
    how="left"
)

print("\nTop 10 recommended movies for original userId:", original_user_id)
print(recommendations[["title", "genres", "predicted_rating"]].head(10).to_string(index=False))
