import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <p className="font-display text-6xl text-gold-500">404</p>
      <h1 className="mt-4 font-display text-2xl">Бұл парақ табылмады</h1>
      <p className="mt-2 text-muted">
        Іздеген парағыңыз жойылған немесе орны ауысқан болуы мүмкін.
      </p>
      <Link
        href="/"
        className="btn-primary mt-8 inline-block px-6 py-3"
      >
        Басты бетке оралу
      </Link>
    </div>
  );
}
