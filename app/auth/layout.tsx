import '../styles/auth.css';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header pentru Auth */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 mr-2">
              <Image
                src="/logo.png"
                alt="Terapie AI Logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-primary-dark">Terapie AI</span>
          </Link>
        </div>
      </header>
      
      {/* Conținutul principal */}
      <main className="flex-grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Footer pentru Auth */}
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Terapie AI. Toate drepturile rezervate.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <Link href="/terms" className="hover:text-gray-600">
                Termeni și Condiții
              </Link>
              <Link href="/privacy" className="hover:text-gray-600">
                Politica de Confidențialitate
              </Link>
              <Link href="/contact" className="hover:text-gray-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}