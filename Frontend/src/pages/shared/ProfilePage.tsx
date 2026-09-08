import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/auth.api';
import { getBrowserLocation } from '../../utils/geolocation';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { extractErrorMessage } from '../../api/client';
import {
  User as UserIcon,
  MapPin,
  Lock,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<string>('profile');

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address & Location fields
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  const [lat, setLat] = useState<number>(user?.address?.coordinates?.coordinates[1] || 28.6139);
  const [lng, setLng] = useState<number>(user?.address?.coordinates?.coordinates[0] || 77.209);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await authApi.updateProfile({
        fullName,
        email: email || undefined,
      });
      if (res.data) {
        updateUser(res.data);
      }
      success('Profile details updated successfully');
    } catch (err: any) {
      toastError(extractErrorMessage(err, 'Failed to update profile'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Location Update
  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingLocation(true);
    try {
      const addressString = `${street ? street + ', ' : ''}${city}, ${state} - ${pincode}`.trim();
      const res = await authApi.updateLocation({
        latitude: lat,
        longitude: lng,
        address: addressString,
      });
      if (res.data) {
        updateUser(res.data);
      }
      success('Location coordinates saved successfully');
    } catch (err: any) {
      toastError(extractErrorMessage(err, 'Failed to update location'));
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // GPS Auto-detect
  const handleDetectGPS = async () => {
    try {
      info('Requesting browser location...');
      const coords = await getBrowserLocation();
      setLat(coords.latitude);
      setLng(coords.longitude);
      success('GPS coordinates fetched!');
    } catch (err: any) {
      toastError(err.message || 'Could not fetch GPS');
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toastError('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toastError(extractErrorMessage(err, 'Failed to change password'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.fullName || (role === 'recycler' ? 'Amit Kumar' : 'Ramesh Kumar');
  const displayRole = role === 'recycler' ? 'Recycler (Buyer)' : 'Kabadiwala (Collector)';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* User Card Header matching Screen 10 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-saffron-100 border-2 border-saffron-300 flex items-center justify-center text-saffron-800 font-extrabold text-xl shrink-0 shadow-inner">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={displayName} className="w-full h-full object-cover rounded-full" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900 truncate">{displayName}</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              Verified
            </span>
          </div>
          <p className="text-xs text-saffron-600 font-semibold">{displayRole}</p>
          <p className="text-xs text-gray-400 mt-0.5">{user?.phoneNumber || '+91 9876543210'}</p>
        </div>
      </div>

      {/* Main Container: Settings Tabs & Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Menu matching Screen 10 */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'profile' ? 'bg-saffron-50 text-saffron-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserIcon className="w-4 h-4" />
              <span>My Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => setActiveTab('location')}
            className={`w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'location' ? 'bg-saffron-50 text-saffron-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Address & Location</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'security' ? 'bg-saffron-50 text-saffron-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4" />
              <span>Security (Change Password)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'support' ? 'bg-saffron-50 text-saffron-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </div>
          </button>
        </div>

        {/* Right Details Panel */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Personal Information
              </h3>

              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Phone Number"
                value={user?.phoneNumber || ''}
                disabled
                helperText="Phone number cannot be changed once registered"
                prefixText="+91"
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdatingProfile}
                loadingText="Updating..."
                className="mt-2"
              >
                Save Changes
              </Button>
            </form>
          )}

          {/* TAB 2: ADDRESS & LOCATION */}
          {activeTab === 'location' && (
            <form onSubmit={handleUpdateLocation} className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Address & GPS Coordinates</h3>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="text-xs font-bold text-saffron-600 hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" /> Use Current Location
                </button>
              </div>

              <Input
                label="Street / Yard Address"
                placeholder="e.g. 123 Industrial Area, Phase 2"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  placeholder="e.g. Noida"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="State"
                  placeholder="e.g. Uttar Pradesh"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <Input
                label="Pincode"
                placeholder="e.g. 201301"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.slice(0, 6))}
              />

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-semibold text-gray-600 block mb-2">
                  Geospatial Coordinates (Used for distance scoring)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Latitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Longitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdatingLocation}
                loadingText="Saving..."
                className="mt-2"
              >
                Save Location
              </Button>
            </form>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Change Account Password
              </h3>

              <Input
                label="Current Password"
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Minimum 6 characters"
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isChangingPassword}
                loadingText="Updating Password..."
                className="mt-2"
              >
                Change Password
              </Button>
            </form>
          )}

          {/* TAB 4: HELP & SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-4 text-xs sm:text-sm text-gray-600">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Help & Safety
              </h3>
              <p>
                Have questions about material classification, price disputes, or pickup
                scheduling?
              </p>
              <div className="p-4 rounded-xl bg-saffron-50 border border-saffron-200 text-saffron-900 space-y-2">
                <p className="font-bold">National Support Desk</p>
                <p className="text-xs">Toll-Free Helpline: 1800-KABADI-CONNECT</p>
                <p className="text-xs">Email: support@kabadiwalaconnect.in</p>
                <p className="text-xs">Operating Hours: Monday – Saturday (8:00 AM to 8:00 PM IST)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

