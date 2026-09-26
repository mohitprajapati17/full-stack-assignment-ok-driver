import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="text-sm text-sky-400 hover:underline">
        Back to home
      </Link>
    </section>
  );
}
