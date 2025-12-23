import { useState, useEffect } from 'react';
import { User as UserIcon, Mail, LogOut, Settings, ChevronRight, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  provider_name: string;
  data_amount: string;
  price: number;
  status: string;
  created_at: string;
}

export default function AccountPage() {
  const { user, signOut, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalSpent: 0, totalOrders: 0, completedOrders: 0 });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orderData = data || [];
      setOrders(orderData);

      const totalSpent = orderData.reduce((sum, p) => sum + Number(p.price), 0);
      const completedOrders = orderData.filter(p => p.status === 'completed').length;

      setStats({
        totalSpent,
        totalOrders: orderData.length,
        completedOrders
      });
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const { error } = await updateProfile(fullName);

      if (error) {
        setProfileError(error.message);
      } else {
        setProfileSuccess('Profile updated successfully!');
        setTimeout(() => {
          setShowProfileModal(false);
          setProfileSuccess('');
        }, 1500);
      }
    } catch (err) {
      setProfileError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (newPassword !== confirmNewPassword) {
      setSecurityError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError('Password must be at least 6 characters');
      return;
    }

    setSecurityLoading(true);

    try {
      const { error } = await updatePassword(currentPassword, newPassword);

      if (error) {
        setSecurityError(error.message);
      } else {
        setSecuritySuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          setShowSecurityModal(false);
          setSecuritySuccess('');
        }, 1500);
      }
    } catch (err) {
      setSecurityError('Failed to update password');
    } finally {
      setSecurityLoading(false);
    }
  };

  const openProfileModal = () => {
    setFullName(user?.full_name || '');
    setProfileError('');
    setProfileSuccess('');
    setShowProfileModal(true);
  };

  const openSecurityModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setSecurityError('');
    setSecuritySuccess('');
    setShowSecurityModal(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-800 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-black" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Account</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-gray-900 rounded-xl p-2 border border-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-green-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-green-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <p className="text-gray-400 text-sm mb-2">Total Spent</p>
                  <p className="text-3xl font-bold text-white">GH₵{stats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <p className="text-gray-400 text-sm mb-2">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                </div>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <p className="text-gray-400 text-sm mb-2">Completed Orders</p>
                  <p className="text-3xl font-bold text-white">{stats.completedOrders}</p>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">User ID</span>
                    <span className="text-white font-mono text-sm">{user?.id}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <button
                  onClick={openProfileModal}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <p className="text-white font-medium">Profile Settings</p>
                      <p className="text-gray-400 text-sm">Update your personal information</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <button
                  onClick={openSecurityModal}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <p className="text-white font-medium">Security</p>
                      <p className="text-gray-400 text-sm">Password and authentication</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <p className="text-gray-400 text-sm mt-1">Update your personal information</p>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              {profileError && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-500 text-sm">{profileError}</p>
                </div>
              )}

              {profileSuccess && (
                <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-500 text-sm">{profileSuccess}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              <p className="text-gray-400 text-sm mt-1">Update your account password</p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
              {securityError && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-500 text-sm">{securityError}</p>
                </div>
              )}

              {securitySuccess && (
                <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-500 text-sm">{securitySuccess}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="flex-1 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="flex-1 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {securityLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
