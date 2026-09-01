"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 font-mono">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-xs text-neutral-400">
            An unexpected root error occurred.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-full hover:bg-neutral-200 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
