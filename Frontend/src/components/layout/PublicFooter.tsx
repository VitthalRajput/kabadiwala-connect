import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Heart, ShieldCheck, Award } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#111827] text-white pt-16 pb-12 border-t-4 border-saffron-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Column 1: Brand & National Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-saffron-500 flex items-center justify-center text-white shadow-md shadow-saffron-500/30">
                <Recycle className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Kabadiwala <span className="text-saffron-500">Connect</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering India's grassroots scrap collectors with AI-driven material recognition,
              transparent market valuations, and direct verified recycler partnerships.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700 text-xs text-saffron-400 font-medium">
              <Award className="w-3.5 h-3.5 text-saffron-400" />
              <span>Supporting Swachh & Circular India</span>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-saffron-400 mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link to="/join" className="hover:text-white transition-colors">
                  Join as Kabadiwala (Seller)
                </Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-white transition-colors">
                  Join as Recycler (Buyer)
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  AI Material Valuation
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Traceable Recycling
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Member Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Materials & Standards */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-saffron-400 mb-4">
              Materials Supported
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>E-Waste (PCBs, Motherboards)</li>
              <li>Batteries & Energy Storage</li>
              <li>CRT & LCD/LED Displays</li>
              <li>Electric Motors & Windings</li>
              <li>Copper, Brass, & Insulated Wires</li>
              <li>Industrial Grade Plastics</li>
            </ul>
          </div>

          {/* Column 4: Trust & Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-saffron-400 mb-4">
              Trust & Security
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              Compliant with E-Waste Management Rules and Government EPR guidelines.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-400 mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Buyer Network</span>
            </div>
            <p className="text-xs text-gray-400">
              Support Helpline: <span className="text-gray-200">+91 1800-KABADI-CONNECT</span>
              <br />
              Email: <span className="text-gray-200">support@kabadiwalaconnect.in</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar with Tricolor Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-saffron-500 fill-saffron-500" />
            <span>for a Cleaner, Greener India</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            <span className="ml-2">© {new Date().getFullYear()} Kabadiwala Connect. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

