import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Shield, Key, Smartphone, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser } from '../lib/auth';

export function Profile() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '+880-1234-567890',
    address: 'Dhaka, Bangladesh',
    bio: 'Environmental enthusiast committed to sustainable e-waste management.'
  });

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'from-blue-500 to-indigo-600';
      case 'user': return 'from-green-500 to-emerald-600';
      case 'collector': return 'from-cyan-500 to-blue-600';
      case 'recycling_center': return 'from-purple-500 to-pink-600';
      case 'center': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile Updated', {
      description: 'Your profile information has been saved successfully.'
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      phone: '+880-1234-567890',
      address: 'Dhaka, Bangladesh',
      bio: 'Environmental enthusiast committed to sustainable e-waste management.'
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

        {/* Profile Header */}
        <div className={`bg-gradient-to-r ${getRoleColor(user?.role)} rounded-3xl p-8 mb-6 shadow-xl text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center ring-4 ring-white/30">
              <User className="size-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user?.name || 'User'}</h1>
              <p className="text-white/90 mb-1">{user?.email || ''}</p>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                {user?.role?.toUpperCase() || 'USER'}
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all flex items-center gap-2 font-medium"
              >
                <Edit2 className="size-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User className="size-4 text-blue-600" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{formData.name}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="size-4 text-blue-600" />
                Email Address
              </label>
              <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{user?.email || ''}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="size-4 text-blue-600" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{formData.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="size-4 text-blue-600" />
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{formData.address}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">About Me</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{formData.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold flex items-center justify-center gap-2"
              >
                <X className="size-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
              >
                <Save className="size-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>

          <div className="space-y-4">
            <button
              onClick={() => toast.info('Change Password', { description: 'Password change feature coming soon' })}
              className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl hover:border-blue-400 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Key className="size-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900">Change Password</p>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <Shield className="size-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => toast.info('Two-Factor Authentication', { description: '2FA setup coming soon' })}
              className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl hover:border-green-400 transition-all group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Smartphone className="size-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Shield className="size-5 text-green-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
