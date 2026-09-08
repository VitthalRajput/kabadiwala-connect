import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDFB] via-[#FFF8F2] to-white flex flex-col justify-between">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-600 to-saffron-400 flex items-center justify-center text-white shadow-sm">
            <Recycle className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            Kabadiwala <span className="text-saffron-500">Connect</span>
          </span>
        </Link>
        <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-saffron-600">
          Sign In
        </Link>
      </div>

      {/* Main Selection Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Join as
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-2 mb-12">
          Choose your role to continue
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center max-w-3xl mx-auto">
          {/* Card 1: Kabadiwala / Collector (Seller) */}
          <div className="bg-white rounded-3xl p-8 border-2 border-saffron-100 hover:border-saffron-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between items-center group">
            <div className="flex flex-col items-center">
              {/* Illustrated Character Avatar */}
              <div className="w-28 h-28 rounded-full bg-saffron-50 border-4 border-saffron-200 flex items-center justify-center text-saffron-600 mb-6 group-hover:scale-105 transition-transform shadow-inner">
                <svg
                  className="w-16 h-16"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="40" cy="30" r="14" fill="#F4A261" />
                  {/* Turban / Bandana */}
                  <path d="M26 24 C26 15 54 15 54 24 Z" fill="#E76F51" />
                  <path d="M22 28 C30 20 50 20 58 28 Z" fill="#FFB703" />
                  {/* Body & Kurta */}
                  <path d="M22 70 C22 48 58 48 58 70 Z" fill="#2A9D8F" />
                  {/* Smartphone in hand */}
                  <rect x="52" y="44" width="12" height="20" rx="2" fill="#264653" />
                  <rect x="54" y="46" width="8" height="13" rx="1" fill="#FFFFFF" />
                </svg>
              </div>

              <h3 className="text-xl font-black text-gray-900">Kabadiwala</h3>
              <span className="text-xs font-bold text-saffron-600 uppercase tracking-wider mb-3">
                (Collector)
              </span>

              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mb-8">
                Create lots, get instant AI price estimates, and connect directly with certified recyclers.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full py-3 text-sm font-bold shadow-md shadow-saffron-500/20"
              onClick={() => navigate('/register?role=collector')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue as Kabadiwala
            </Button>
          </div>

          {/* Card 2: Recycler / Aggregator (Buyer) */}
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between items-center group">
            <div className="flex flex-col items-center">
              {/* Illustrated Character Avatar */}
              <div className="w-28 h-28 rounded-full bg-blue-50 border-4 border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform shadow-inner">
                <svg
                  className="w-16 h-16"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="40" cy="30" r="14" fill="#E09F67" />
                  {/* Hair */}
                  <path d="M26 26 C26 14 54 14 54 26 C50 18 30 18 26 26 Z" fill="#1D2A44" />
                  {/* Shirt / Business wear */}
                  <path d="M22 70 C22 48 58 48 58 70 Z" fill="#1D4ED8" />
                  <path d="M36 48 L40 56 L44 48 Z" fill="#FFFFFF" />
                  {/* Tablet device in hand */}
                  <rect x="48" y="42" width="16" height="22" rx="2" fill="#334155" />
                  <rect x="50" y="44" width="12" height="15" rx="1" fill="#93C5FD" />
                </svg>
              </div>

              <h3 className="text-xl font-black text-gray-900">Recycler</h3>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                (Buyer)
              </span>

              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mb-8">
                Find quality material, place competitive offers, and manage doorstep fleet pickups.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full py-3 text-sm font-bold border-gray-300 hover:border-blue-500 hover:text-blue-600"
              onClick={() => navigate('/register?role=recycler')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue as Recycler
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-12">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-saffron-600 hover:underline">
            Login
          </Link>
        </p>
      </div>

      {/* Heritage Silhouette Footer Accent */}
      <div className="w-full py-6 border-t border-saffron-100 text-center text-xs text-gray-400">
        🇮🇳 Designed for Swachh & Circular India
      </div>
    </div>
  );
};

