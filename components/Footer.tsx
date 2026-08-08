import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Мағына. Оқы. Түсін. Жаз. Бөліс.</p>
        <div className="flex gap-5">
          <Link href="/baptaular/kupiyalyk" className="hover:text-gold-600">
            Құпиялық саясаты
          </Link>
          <Link href="/baptaular/erezheler" className="hover:text-gold-600">
            Пайдалану шарты
          </Link>
        </div>
      </div>
    </footer>
  );
}
