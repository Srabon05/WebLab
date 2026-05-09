import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Globe, Bell, BellOff, Mail, MessageSquare, Volume2, VolumeX, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState('english');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(70);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    toast.success('Theme Updated', {
      description: `Theme changed to ${newTheme} mode. (Refresh to see changes)`
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast.success('Language Updated', {
      description: `Language changed to ${newLanguage}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft className="size-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-6 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center ring-4 ring-white/30">
              <SettingsIcon className="size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-purple-100">Customize your experience</p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance</h2>

          <div className="space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-transparent shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sun className={`size-6 mx-auto mb-2 ${theme === 'light' ? 'text-white' : 'text-yellow-500'}`} />
                  <p className="text-sm font-bold">Light</p>
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white border-transparent shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Moon className={`size-6 mx-auto mb-2 ${theme === 'dark' ? 'text-white' : 'text-indigo-500'}`} />
                  <p className="text-sm font-bold">Dark</p>
                </button>

                <button
                  onClick={() => handleThemeChange('auto')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === 'auto'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Monitor className={`size-6 mx-auto mb-2 ${theme === 'auto' ? 'text-white' : 'text-blue-500'}`} />
                  <p className="text-sm font-bold">Auto</p>
                </button>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Globe className="size-4 text-purple-600" />
                Language
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              >
                <option value="english">English</option>
                <option value="bangla">বাংলা (Bangla)</option>
                <option value="hindi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Mail className="size-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-14 h-8 rounded-full transition-all ${
                  emailNotifications ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  emailNotifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  {pushNotifications ? <Bell className="size-5 text-white" /> : <BellOff className="size-5 text-white" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Get browser notifications</p>
                </div>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`w-14 h-8 rounded-full transition-all ${
                  pushNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  pushNotifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="size-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive SMS updates</p>
                </div>
              </div>
              <button
                onClick={() => setSmsNotifications(!smsNotifications)}
                className={`w-14 h-8 rounded-full transition-all ${
                  smsNotifications ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  smsNotifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Security</h2>

          <div className="space-y-4">
            {/* Profile Visibility */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  {profileVisible ? <Eye className="size-5 text-white" /> : <EyeOff className="size-5 text-white" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Public Profile</p>
                  <p className="text-sm text-gray-600">Make profile visible to others</p>
                </div>
              </div>
              <button
                onClick={() => setProfileVisible(!profileVisible)}
                className={`w-14 h-8 rounded-full transition-all ${
                  profileVisible ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  profileVisible ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Show Email */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Mail className="size-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Show Email Address</p>
                  <p className="text-sm text-gray-600">Display email on profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmail(!showEmail)}
                className={`w-14 h-8 rounded-full transition-all ${
                  showEmail ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  showEmail ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Show Phone */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="size-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Show Phone Number</p>
                  <p className="text-sm text-gray-600">Display phone on profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhone(!showPhone)}
                className={`w-14 h-8 rounded-full transition-all ${
                  showPhone ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  showPhone ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Sound & Volume */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sound & Volume</h2>

          <div className="space-y-6">
            {/* Enable Sounds */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  {soundEnabled ? <Volume2 className="size-5 text-white" /> : <VolumeX className="size-5 text-white" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Enable Sounds</p>
                  <p className="text-sm text-gray-600">Play notification sounds</p>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-14 h-8 rounded-full transition-all ${
                  soundEnabled ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Volume Slider */}
            {soundEnabled && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
                  <span>Volume Level</span>
                  <span className="text-orange-600">{volume}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-orange-200 to-orange-400 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(249 115 22) 0%, rgb(249 115 22) ${volume}%, rgb(254 215 170) ${volume}%, rgb(254 215 170) 100%)`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
