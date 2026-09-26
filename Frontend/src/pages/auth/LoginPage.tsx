import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { extractErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Recycle, Phone, Lock, Eye, EyeOff, ShieldCheck, Sparkles, UserCheck, Factory } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginDemo } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');

  // 1-Click Instant Demo Login (opens dashboard directly)
  const handleQuickDemo = (role: 'collector' | 'recycler') => {
    const user = loginDemo(role);
    success(`Welcome, ${user.fullName}! Dashboard opened.`);
    const targetPath = role === 'recycler' ? '/recycler/dashboard' : '/seller/dashboard';
    navigate(targetPath, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber) {
      toastError('Please enter your phone number');
      return;
    }

    if (!otpMode && !password) {
      toastError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await login({
        phoneNumber: phoneNumber.trim(),
        password: password || 'Default@123',
      });

      success(`Welcome back, ${loggedInUser.fullName}!`);

      const fromPath = (location.state as any)?.from?.pathname;
      const isRecyclerPath = fromPath && fromPath.startsWith('/recycler');
      const isSellerPath = fromPath && fromPath.startsWith('/seller');

      let targetPath = loggedInUser.role === 'recycler' ? '/recycler/dashboard' : '/seller/dashboard';
      if (loggedInUser.role === 'recycler' && isRecyclerPath) {
        targetPath = fromPath;
      } else if (loggedInUser.role === 'collector' && isSellerPath) {
        targetPath = fromPath;
      }

      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Invalid credentials. Please try again.');
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Brand & Language Switcher */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-saffron-500 flex items-center justify-center text-white shadow-sm">
              <Recycle className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              {t('brand.name')} <span className="text-saffron-500">{t('brand.nameHighlight')}</span>
            </span>
          </Link>
          <LanguageSwitcher variant="compact" />
        </div>

        {/* Center Form Container */}
        <div className="max-w-md w-full mx-auto my-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{t('auth.loginTitle')}</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Quick 1-Click Access for Instant Dashboard Entry */}
          <div className="mb-6 p-3.5 bg-gradient-to-br from-saffron-50 to-orange-50/50 rounded-2xl border border-saffron-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-saffron-500 animate-pulse" />
              <span>{t('auth.quickDemo')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('collector')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white border border-saffron-300 text-saffron-800 hover:bg-saffron-500 hover:text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('brand.sellerPortal')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('recycler')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white border border-blue-300 text-blue-800 hover:bg-blue-600 hover:text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Factory className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('brand.buyerPortal')}</span>
              </button>
            </div>
          </div>

          {/* Tab Switcher (Login vs Sign Up) */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              className="py-2 text-xs font-bold rounded-lg bg-white text-gray-900 shadow-xs transition-all"
            >
              {t('nav.login')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="py-2 text-xs font-bold rounded-lg text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
            >
              {t('auth.registerHere')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number */}
            <Input
              label={t('auth.phoneLabel')}
              placeholder={t('auth.phonePlaceholder')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              leftIcon={<Phone className="w-4 h-4" />}
              prefixText="+91"
              required
            />

            {!otpMode ? (
              /* Password */
              <div>
                <Input
                  label={t('auth.passwordLabel')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                />
                <div className="flex justify-end mt-1.5">
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      setOtpMode(true);
                    }}
                    className="text-xs font-medium text-saffron-600 hover:text-saffron-700 hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </a>
                </div>
              </div>
            ) : (
              /* OTP Field */
              <div>
                <Input
                  label={t('auth.enterOtp')}
                  placeholder={t('auth.otpPlaceholder')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  required
                />
                <div className="flex justify-between items-center mt-1.5 text-xs">
                  <span className="text-gray-500">{t('auth.otpSentTo')} +91 {phoneNumber || '...'}</span>
                  <button
                    type="button"
                    onClick={() => setOtpMode(false)}
                    className="text-saffron-600 hover:underline font-medium cursor-pointer"
                  >
                    {t('auth.usePasswordInstead')}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold shadow-md shadow-saffron-500/20"
              isLoading={isLoading}
              loadingText={t('auth.loggingIn')}
            >
              {otpMode ? t('auth.verifyAndLogin') : t('auth.loginBtn')}
            </Button>

            {/* OR Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">
                  {t('auth.or')}
                </span>
              </div>
            </div>

            {/* OTP Toggle Option */}
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full text-xs font-bold border-gray-300 hover:border-gray-400"
              onClick={() => setOtpMode(!otpMode)}
              leftIcon={<Phone className="w-4 h-4 text-saffron-600" />}
            >
              {otpMode ? t('auth.loginWithPassword') : t('auth.continueWithOtp')}
            </Button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-gray-500 mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/join" className="font-bold text-saffron-600 hover:underline">
              {t('auth.registerHere')}
            </Link>
          </p>
        </div>

        {/* Security badge */}
        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>{t('auth.securityBadge')}</span>
        </div>
      </div>

      {/* Right Hero Panel */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden bg-cover bg-center items-center justify-center p-16"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80')`,
        }}
      >
        <div className="max-w-md text-white space-y-4 relative z-10 text-left">
          <div className="w-12 h-1.5 bg-saffron-500 rounded-full mb-6" />
          <h2 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight uppercase">
            {t('auth.recycle')}<br />
            {t('auth.reuse')}<br />
            {t('auth.rebuild')}<br />
            <span className="text-saffron-400">{t('auth.cleanerIndia')}</span>
          </h2>
          <p className="text-sm text-gray-200 leading-relaxed font-light pt-2">
            {t('auth.registerHeroDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};
