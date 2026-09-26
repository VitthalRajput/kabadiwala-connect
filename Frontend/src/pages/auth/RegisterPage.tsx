import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { extractErrorMessage } from '../../api/client';
import { UserRole } from '../../types/auth.types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Recycle, Phone, Lock, User, Mail, MapPin, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultRole = (searchParams.get('role') as UserRole) || 'collector';

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phoneNumber.trim() || !password) {
      toastError('Please fill in all required fields');
      return;
    }

    if (phoneNumber.length !== 10) {
      toastError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (password.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
        password,
        role,
        address: {
          street: street.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          pincode: pincode.trim() || undefined,
        },
      });

      success('Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to register. Please check your details.');
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-14 overflow-y-auto">
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

        <div className="max-w-md w-full mx-auto my-6">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{t('auth.createAccount', 'Create Account')}</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('auth.createAccountSubtitle', "Join India's verified sustainable scrap exchange.")}
            </p>
          </div>

          {/* Role Switcher */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t('auth.selectRole')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('collector')}
                className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  role === 'collector'
                    ? 'border-saffron-500 bg-saffron-50 text-saffron-800 ring-2 ring-saffron-200'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {t('auth.collectorSellerBtn')}
              </button>
              <button
                type="button"
                onClick={() => setRole('recycler')}
                className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  role === 'recycler'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {t('auth.recyclerBuyerBtn')}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label={t('auth.fullName')}
              placeholder={t('auth.fullNamePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label={t('auth.phoneLabel')}
              placeholder={t('auth.phonePlaceholder')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              leftIcon={<Phone className="w-4 h-4" />}
              prefixText="+91"
              required
            />

            <Input
              label={t('auth.emailOptional')}
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label={t('auth.createPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordMin')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            {/* Address Details */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-700 block mb-2">{t('auth.locationAddress')}</span>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder={t('auth.city')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  leftIcon={<MapPin className="w-3.5 h-3.5" />}
                />
                <Input
                  placeholder={t('auth.state')}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={t('auth.streetArea')}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <Input
                  placeholder={t('auth.pincode')}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 font-bold shadow-md shadow-saffron-500/20"
              isLoading={isLoading}
              loadingText={t('auth.creatingAccount')}
            >
              {t('auth.completeRegistration')}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-saffron-600 hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>{t('auth.ewasteNorms')}</span>
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

