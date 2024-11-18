export default function MovieCard({
  rating,
  setRating,
  handleRating,
  currentMovieIndex,
  setCurrentMovieIndex,
  movies,
  setSearch,
}: {
  rating: number | null;
  setRating: (rating: number | null) => void;
  handleRating: (e: { preventDefault: () => void }) => void;
  currentMovieIndex: number;
  setCurrentMovieIndex: (index: number) => void;
  movies: { id: number; title: string; genres: string[] }[];
  setSearch?: (search: string) => void;
}) {
  return (
    <>
      {movies.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <button
            className="btn btn-outline btn-circle"
            onClick={() => {
              setCurrentMovieIndex(
                currentMovieIndex === 0
                  ? movies.length - 1
                  : currentMovieIndex - 1
              );
              setRating(null);
            }}
          >
            {"<"}
          </button>
          <div className="flex flex-col items-center gap-4 w-[50vw] h-[100px] justify-between">
            <h3 className="text-xl font-bold text-center line-clamp-2 text-ellipsis">
              {movies[currentMovieIndex].title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {movies[currentMovieIndex].genres.join(", ")}
            </p>
          </div>
          <button
            className="btn btn-outline btn-circle"
            onClick={() => {
              setCurrentMovieIndex(
                currentMovieIndex === movies.length - 1
                  ? 0
                  : currentMovieIndex + 1
              );
              setRating(null);
            }}
          >
            {">"}
          </button>
        </div>
      )}

      <form className="space-y-4" action="/api/movies" method="GET">
        {setSearch && (
          <div className="form-control">
            <label className="label">
              <span className="label-text dark:text-white">
                Search for a movie
              </span>
            </label>
            <input
              type="text"
              name="movie"
              placeholder="Search for a movie"
              className="input input-bordered w-full"
              onInput={(e) => setSearch(e.currentTarget.value)}
            />
          </div>
        )}

        {movies.length >= 0 && (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text dark:text-white">Rating</span>
              </label>
              <input
                type="number"
                name="rating"
                placeholder="Rating"
                step={0.5}
                min={0}
                max={5}
                value={rating ?? ""}
                onChange={(e) =>
                  setRating(
                    e.currentTarget.value === ""
                      ? null
                      : Number(e.currentTarget.value)
                  )
                }
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control mt-6">
              <button
                onClick={handleRating}
                disabled={
                  rating === null || rating < 0 || rating > 5 || isNaN(rating)
                }
                className="btn btn-primary w-full"
              >
                Rate Movie
              </button>
            </div>
          </>
        )}
      </form>
    </>
  );
}
