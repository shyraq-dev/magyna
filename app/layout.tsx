import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Maǵyna — оқы, жаз, бөліс',
  description: 'Кітаптар мен оқиғаларды оқуға, жазуға және бөлісуге арналған платформа.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className="dark">
      <body>
        <ServiceWorkerRegister />
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
