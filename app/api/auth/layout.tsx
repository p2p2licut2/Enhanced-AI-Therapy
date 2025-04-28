import './auth.css';
import Image from 'next/image';

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
          <div className="flex items-center">
            <Image
              src="/logo.png" // Adaugă un logo pentru aplicația ta
              alt="Terapie AI Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <span className="text-xl font-bold text-primary-dark">Terapie AI</span>
          </div>
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
              <a href="/terms" className="hover:text-gray-600">Termeni și Condiții</a>
              <a href="/privacy" className="hover:text-gray-600">Politica de Confidențialitate</a>
              <a href="/contact" className="hover:text-gray-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}