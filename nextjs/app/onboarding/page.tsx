"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MovieCard from "../components/moviesViewer";

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [todos, setTodos] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState<
    { id: number; title: string; genres: string[] }[]
  >([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  useEffect(() => {
    fetch("/api/onboarding")
      .then(async (res) => {
        switch (res.status) {
          case 200:
            // get movies in front of user
            return res.json();
          case 401:
            // not logged in
            router.push("/login");
          case 403:
            // onboarding is done
            router.push("/");
            setRedirecting(true);
            break;
          case 404:
            router.push("/login?failed=Unauthorized");
            setRedirecting(true);
            break;
          default:
            router.push("/error?code=" + res.status);
            setRedirecting(true);
            break;
        }
        if (res.status === 200) {
        } else {
          setError(res.statusText);
          setLoading(false);
        }
      })
      .then((data) => {
        if (!data) return;
        if (typeof data?.ratings === "number") {
          setTodos(5 - data.ratings);
        }
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (!loading && search.length >= 3) {
      fetch("/api/movies?title=" + search)
        .then((res) => res.json())
        .then((data) => {
          setMovies(data);
          setCurrentMovieIndex(0);
        })
        .catch(() => setMovies([]));
    }
  }, [loading, search]);

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
      })
        .then((res) => {
          if (res.status === 200) {
            if (typeof todos === "number") {
              setTodos(todos - 1);
              setRating(null);
              // remove rated movie from list
              setMovies(movies.filter((_, i) => i !== currentMovieIndex));
              setCurrentMovieIndex(
                currentMovieIndex === movies.length - 1 ? 0 : currentMovieIndex
              );
            }
          } else if (res.status === 403) {
            // rating exists already
            // re-fetch search
            fetch("/api/movies?title=" + search)
              .then((res) => res.json())
              .then((data) => {
                setMovies(data);
                setCurrentMovieIndex(0);
              })
              .catch(() => setMovies([]));
          } else {
            setError(res.statusText);
          }
        })
        .catch(() => setError("An error occurred"));
    },
    [todos, rating, currentMovieIndex, movies, search]
  );

  if (todos === 0 && !redirecting) {
    router.push("/");
  }

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  } else if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h2 className="text-2xl font-bold text-center">Rate Movies</h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Rate some movies to get started
        </p>
        <MovieCard
          currentMovieIndex={currentMovieIndex}
          setCurrentMovieIndex={setCurrentMovieIndex}
          movies={movies}
          setSearch={setSearch}
          rating={rating}
          setRating={setRating}
          handleRating={handleRating}
        />
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {todos} movies left to rate
        </p>
      </main>
    </div>
  );
}
