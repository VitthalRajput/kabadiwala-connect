import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { AshokaPillar } from '../../components/common/AshokaPillar';
import { Button } from '../../components/common/Button';
import { useTranslation } from '../../context/LanguageContext';
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
  const { t } = useTranslation();

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
                <span>{t('hero.badge')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                {t('hero.titleLine1')}{' '}
                <span className="block text-saffron-500 mt-1">
                  {t('hero.titleLine2')}
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t('hero.subheading')}
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
                  {t('hero.getStarted')}
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
                  {t('hero.learnMore')}
                </Button>
              </div>

              {/* Trust micro-metric */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>{t('hero.eprCompliant')}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 text-saffron-500 animate-spin-slow" />
                  <span>{t('hero.instantAi')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Lion Capital of Ashoka Visual */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative animate-fade-in">
              <AshokaPillar size="hero" className="filter drop-shadow-glow" />

              {/* Stylized Indian Heritage Skyline Silhouette */}
              <div className="w-full h-8 opacity-40 mt-2 bg-contain bg-bottom bg-no-repeat flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-saffron-800">
                🏛️ {t('hero.cities')}
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
                  <h4 className="text-sm font-bold text-gray-900">{t('benefits.fairPricesTitle')}</h4>
                  <p className="text-xs text-gray-500">{t('benefits.fairPricesDesc')}</p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 border border-saffron-100 shadow-card hover-elevate transition-all">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t('benefits.secureTitle')}</h4>
                  <p className="text-xs text-gray-500">{t('benefits.secureDesc')}</p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 border border-saffron-100 shadow-card hover-elevate transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t('benefits.verifiedTitle')}</h4>
                  <p className="text-xs text-gray-500">{t('benefits.verifiedDesc')}</p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 border border-saffron-100 shadow-card hover-elevate transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Recycle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t('benefits.cleanerIndiaTitle')}</h4>
                  <p className="text-xs text-gray-500">{t('benefits.cleanerIndiaDesc')}</p>
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
            {t('howItWorks.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-14">
            {t('howItWorks.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card hover-elevate relative text-left group transition-all">
              <span className="w-8 h-8 rounded-full bg-saffron-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                1
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">{t('howItWorks.step1Title')}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('howItWorks.step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card hover-elevate relative text-left group transition-all">
              <span className="w-8 h-8 rounded-full bg-saffron-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                2
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">{t('howItWorks.step2Title')}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('howItWorks.step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card hover-elevate relative text-left group transition-all">
              <span className="w-8 h-8 rounded-full bg-saffron-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                3
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">{t('howItWorks.step3Title')}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('howItWorks.step3Desc')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-saffron-100 shadow-card hover-elevate relative text-left group transition-all">
              <span className="w-8 h-8 rounded-full bg-saffron-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                4
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">{t('howItWorks.step4Title')}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('howItWorks.step4Desc')}
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
                  {t('landing.roles.sellerBadge')}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-4 mb-3">
                  {t('landing.roles.sellerTitle')}
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {t('landing.roles.sellerDesc')}
                </p>

                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-saffron-500 shrink-0" />
                    <span>{t('landing.roles.sellerPoint1')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-saffron-500 shrink-0" />
                    <span>{t('landing.roles.sellerPoint2')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-saffron-500 shrink-0" />
                    <span>{t('landing.roles.sellerPoint3')}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto tap-bounce font-bold shadow-md shadow-saffron-500/20"
                  onClick={() => navigate('/join')}
                >
                  {t('landing.roles.sellerBtn')}
                </Button>
              </div>
            </div>

            {/* Card 2: For Recycler / Aggregator */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-blue-50/60 to-white border-2 border-blue-200 shadow-card hover-elevate flex flex-col justify-between transition-all">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {t('landing.roles.buyerBadge')}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-4 mb-3">
                  {t('landing.roles.buyerTitle')}
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {t('landing.roles.buyerDesc')}
                </p>

                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{t('landing.roles.buyerPoint1')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{t('landing.roles.buyerPoint2')}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{t('landing.roles.buyerPoint3')}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-gray-400 hover:border-gray-900 tap-bounce font-bold"
                  onClick={() => navigate('/join')}
                >
                  {t('landing.roles.buyerBtn')}
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
            {t('landing.features.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-14">
            {t('landing.features.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover-elevate transition-all">
              <div className="w-12 h-12 rounded-xl bg-saffron-100 text-saffron-600 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">{t('landing.features.aiTitle')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('landing.features.aiDesc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover-elevate transition-all">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">{t('landing.features.mandiTitle')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('landing.features.mandiDesc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover-elevate transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">{t('landing.features.eprTitle')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('landing.features.eprDesc')}
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
            {t('landing.cta.title')}
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto font-normal">
            {t('landing.cta.subtitle')}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/join')}
              className="bg-white text-saffron-700 hover:bg-gray-100 border-none px-8 font-bold tap-bounce shadow-lg"
            >
              {t('landing.cta.startBtn')}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-saffron-700 hover:bg-gray-100 border-none px-8 font-bold tap-bounce shadow-lg"
            >
              {t('landing.cta.loginBtn')}
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
