"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";


export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    setQuery(value);

    if (value.trim() === "") {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/search/movie`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key,
            query: value,
            language: "en-US",
          },
        }
      );
      setResults(res.data.results.slice(0, 8));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-80 max-w-md">
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-300 
               bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-500
               shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 
               dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 
               dark:placeholder-gray-400 transition-all"
      />

      {loading && query && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-900 
                    rounded-xl shadow-lg p-3 z-20 text-center text-gray-500 dark:text-gray-400"
        >

        </div>
      )}

      {results.length > 0 && query && !loading && (
        <ul
          className="absolute left-0 right-0 mt-1 
                   bg-white dark:bg-gray-900 rounded-xl shadow-lg 
                   max-h-64 overflow-auto z-20 divide-y divide-gray-200 dark:divide-gray-700"
        >
          {results.map((movie) => (
            <li
              key={movie.id}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 
                     cursor-pointer transition-colors"
            >
              <Link
                href={`/Movies/${movie.id}`}
                onClick={() => setQuery("")}
                className="block"
              >
                <p className="font-medium">
                  {movie.title}{" "}
                  {movie.release_date ? (
                    <span className="text-sm text-gray-500">
                      ({movie.release_date.split("-")[0]})
                    </span>
                  ) : null}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && query && !loading && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-900 
                    rounded-xl shadow-lg p-3 z-20 text-center text-gray-500 dark:text-gray-400"
        >
          No results found
        </div>
      )}
    </div>
  );
}
