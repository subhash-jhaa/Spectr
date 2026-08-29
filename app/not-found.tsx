import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tighter text-white sm:text-8xl">404</h1>
      <p className="mt-4 text-lg text-neutral-400">Page not found</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
      >
        Back to Home
      </Link>
    </div>
  );
}
