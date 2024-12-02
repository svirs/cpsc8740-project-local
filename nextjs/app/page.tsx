"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import MovieRater from "./components/moviesViewer";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<
    {
      id: number;
      title: string;
      genres: string[];
    }[]
  >([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/home").then((res) => {
      switch (res.status) {
        case 200:
          // get data in front of user
          res.json().then((data) => {
            setMovies(data);
          });
          break;
        case 204:
          // no data
          break;
        case 401:
          router.push("/signup");
          break;
        case 403:
          router.push("/onboarding");
          break;
        case 404:
          router.push("/login?failed=Unauthorized");
          break;
        default:
          router.push("/error?code=" + res.status);
          break;
      }
      setLoading(false);
    });
  }, [router]);

  const handleRating = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      fetch(`/api/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: movies[currentMovieIndex].id,
          rating,
        }),
      }).then((res) => {
        if (res.status === 200) {
          // remove rated movie from list
          setMovies(movies.filter((_, i) => i !== currentMovieIndex));
          setCurrentMovieIndex(
            currentMovieIndex === movies.length - 1 ? 0 : currentMovieIndex
          );
        }
      });
    },
    [rating, currentMovieIndex, movies]
  );

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p>No movies recommendations ready yet.</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.currentTarget.disabled = true;
            e.currentTarget.innerText =
              "[DEV] Starting job, may take a while...";
            fetch("/api/job").then((res) => {
              if (res.status === 200) {
                window.location.reload();
              }
            });
          }}
          className="btn btn-primary"
        >
          Start recommendations job
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {movies.length > 0 && (
          <div className="flex justify-center gap-4 flex-col">
            <MovieRater
              movies={movies}
              currentMovieIndex={currentMovieIndex}
              setCurrentMovieIndex={setCurrentMovieIndex}
              rating={rating}
              setRating={setRating}
              handleRating={handleRating}
            />
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/*
          todo footer
        */}
      </footer>
    </div>
  );
}
