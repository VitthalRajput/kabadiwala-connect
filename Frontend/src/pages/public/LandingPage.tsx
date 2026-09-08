import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { AshokaPillar } from '../../components/common/AshokaPillar';
import { Button } from '../../components/common/Button';
import {
  ShieldCheck,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Recycle,
  Scale,
  Award,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-dark-900 flex flex-col">
      <PublicNavbar />

      {/* ========================================================
          HERO SECTION (Matching Mockup Screen 1)
          Ashoka Pillar + Saffron Tricolor Accents + India Skyline
         ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-saffron-100/60">
        {/* Subtle Indian Tricolor Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-saffron-200/30 filter blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-green-200/25 filter blur-3xl pointer-events-none animate-pulse-slow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Subtitle, CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-fade-in-up">
              {/* National Initiative Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold shadow-xs hover-elevate cursor-default">
                <span className="w-2 h-2 rounded-full bg-saffron-500 animate-ping" />
                <span>India's AI-Powered Digital Scrap Marketplace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Clean Today.{' '}
                <span className="block text-saffron-500 mt-1">
                  Greener Tomorrow.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Connecting Kabadiwalas and Recyclers for a Smarter, Cleaner, Greener India.
                Transform unorganized scrap collection with instant AI material valuation,
                direct certified recycler matchmaking, and transparent digital payouts.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/join')}
                  className="w-full sm:w-auto shadow-lg shadow-saffron-500/25 px-8 font-bold tap-bounce"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto border-gray-300 hover:border-saffron-400 px-8 tap-bounce"
                >
                  Learn More
                </Button>
              </div>

              {/* Trust micro-metric */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Government EPR Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 text-saffron-500 animate-spin-slow" />
                  <span>Instant AI Recognition</span>
                </div>
              </div>
            </div>

            {/* Right Column: Lion Capital of Ashoka Visual */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative animate-fade-in">
              <AshokaPillar size="hero" className="filter drop-shadow-glow" />

              {/* Stylized Indian Heritage Skyline Silhouette */}
              <div className="w-full h-8 opacity-40 mt-2 bg-contain bg-bottom bg-no-repeat flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-saffron-800">
                🏛️ Delhi • Mumbai • Noida • Ghaziabad • Bengaluru • Hyderabad
              </div>
            </div>
          </div>

          {/* Bottom Hero Benefits Bar (Matching Mockup Screen 1) */}
          <div className="mt-14 pt-8 border-t border-saffron-100/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
              {/* Benefit 1 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 border border-saffron-100 shadow-card hover-elevate transition-all">
                <div className="w-10 h-10 rounded-xl bg-saffron-100 text-saffron-600 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Fair Prices</h4>
                  <p className="text-xs text-gray-500">AI-based valuation & market trends</p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 border border-saffron-100 shadow-card hover-elevate transition-all">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Easy & Secure</h4>
                  <p className="text-xs text-gray-500">End-to-end transparent process</p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 border border-saffron-100 shadow-card hover-elevate transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Verified Recyclers</h4>
                  <p className="text-xs text-gray-500">Authorized buyer network</p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 border border-saffron-100 shadow-card hover-elevate transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Recycle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Cleaner India</h4>
                  <p className="text-xs text-gray-500">Sustainable, circular tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          HOW IT WORKS SECTION
         ======================================================== */}
      <section id="how-it-works" className="py-20 bg-[#FFF8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600 bg-saffron-100/80 px-3 py-1 rounded-full">
            Seamless 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
            How Kabadiwala Connect Works
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-14">
            Bridging local informal collection with industrial recycling giants through artificial
            intelligence and real-time market matching.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card hover-elevate relative text-left group transition-all">
              <span className="w-8 h-8 rounded-full bg-saffron-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                1
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">Snap & Upload</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Take a photo of your scrap lot (PCBs, copper wire, motors, batteries). Drag & drop
                directly into our app.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card hover-elevate relative text-left group transition-all">
              <span className="w-8 h-8 rounded-full bg-saffron-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                2
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">AI Material Valuation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our vision model recognizes material purity, category, and fetches live state-level
                price recommendations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card hover-elevate relative text-left group transition-all">
              <span className="w-8 h-8 rounded-full bg-saffron-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                3
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">Recycler Match</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Smart matchmaking ranks nearby verified recyclers offering the highest bids and
                scheduled doorstep pickups.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card hover-elevate relative text-left group transition-all">
              <span className="w-8 h-8 rounded-full bg-saffron-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                4
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">Pickup & Instant Pay</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Handover with GPS verification and calibrated scale check. Payout is transferred
                instantly to your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          DUAL ROLES: FOR KABADIWALAS & FOR RECYCLERS
         ======================================================== */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Card 1: For Kabadiwala / Collector */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-saffron-50/70 to-white border-2 border-saffron-200 shadow-card hover-elevate flex flex-col justify-between transition-all">
              <div>
                <span className="text-xs font-bold text-saffron-700 uppercase tracking-widest bg-saffron-100 px-3 py-1 rounded-full">
                  SELLER PORTAL
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-4 mb-3">
                  For Kabadiwalas & Collectors
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Eliminate middlemen and low-ball estimates. Sell directly to industrial aggregators
                  at guaranteed transparent market rates.
                </p>

                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-saffron-500 shrink-0" />
                    <span>Free instant AI valuation for any scrap image</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-saffron-500 shrink-0" />
                    <span>Doorstep scheduled pickups right at your collection yard</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-saffron-500 shrink-0" />
                    <span>Instant digital payments with zero hidden commission</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto tap-bounce font-bold shadow-md shadow-saffron-500/20"
                  onClick={() => navigate('/join')}
                >
                  Join as Kabadiwala (Collector) →
                </Button>
              </div>
            </div>

            {/* Card 2: For Recycler / Aggregator */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-blue-50/60 to-white border-2 border-blue-200 shadow-card hover-elevate flex flex-col justify-between transition-all">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  BUYER PORTAL
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-4 mb-3">
                  For Recyclers & Aggregators
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Source verified, high-purity scrap lots at scale with documented digital chain of
                  custody for national compliance and EPR audits.
                </p>

                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Access bulk available lots filtered by purity, weight, & city</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Manage your custom buying price cards and bids</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Full GPS handover timestamping & tamper-proof ledger audit</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-gray-400 hover:border-gray-900 tap-bounce font-bold"
                  onClick={() => navigate('/join')}
                >
                  Join as Recycler (Buyer) →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FEATURES & TRACEABILITY
         ======================================================== */}
      <section id="features" className="py-20 bg-[#FFFDFB] border-t border-saffron-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600 bg-saffron-50 px-3 py-1 rounded-full">
            Cutting-Edge Technology
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
            Built for Transparency & Social Impact
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-14">
            Engineered from the ground up to empower millions of micro-entrepreneurs in India's
            circular economy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover-elevate transition-all">
              <div className="w-12 h-12 rounded-xl bg-saffron-100 text-saffron-600 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">Deep Learning Vision</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Trained specifically on Indian e-waste streams to distinguish between copper winding,
                aluminum alloys, cathode ray glass, and printed circuit boards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover-elevate transition-all">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">Live Mandi & Market Rates</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Real-time price indices updated daily across major scrap clusters in Maharashtra,
                Delhi-NCR, Uttar Pradesh, and Gujarat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover-elevate transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">Traceability & EPR Credit</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every lot is serialized and ledger-tracked from collection to smelting, satisfying
                pollution control board requirements and corporate ESG reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CALL TO ACTION
         ======================================================== */}
      <section className="py-16 bg-gradient-to-r from-saffron-600 via-saffron-500 to-amber-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Build a Cleaner, Greener India?
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto font-normal">
            Join thousands of collectors and recyclers already trading fairly and sustainably on
            Kabadiwala Connect.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/join')}
              className="bg-white text-saffron-700 hover:bg-gray-100 border-none px-8 font-bold tap-bounce shadow-lg"
            >
              Get Started Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-transparent text-white border-white hover:bg-white/10 px-8 tap-bounce"
            >
              Sign In to Account
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
