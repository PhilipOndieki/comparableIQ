import { MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-serif font-bold text-white text-lg">ComparableIQ</span>
            <span className="text-gray-400 text-xs">Property comparables. Instantly.</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Search</a>
            <span className="text-gray-600">|</span>
            <a href="/admin" className="hover:text-white transition-colors">Admin</a>
          </div>

          <a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Us
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} ComparableIQ. For professional land valuers in Kenya.
        </div>
      </div>
    </footer>
  );
}
