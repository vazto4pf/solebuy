import { useState } from 'react';
import { User, ShoppingCart, Menu, X, Shield } from 'lucide-react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: 'home' | 'dashboard' | 'account' | 'admin') => void;
  currentPage: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { user, isAdmin } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <ShoppingCart className="w-8 h-8 text-green-500" />
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sole<span className="text-green-500">Buy</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'text-green-500'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Home
              </button>
              {user && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`text-sm font-medium transition-colors ${
                      currentPage === 'dashboard'
                        ? 'text-green-500'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('account')}
                    className={`text-sm font-medium transition-colors ${
                      currentPage === 'account'
                        ? 'text-green-500'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Account
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                        currentPage === 'admin'
                          ? 'text-green-500'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </button>
                  )}
                </>
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium truncate max-w-[150px]">{user.email}</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:text-green-500 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="px-6 py-2 rounded-lg bg-green-500 text-black font-medium text-sm hover:bg-green-400 transition-all transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Home
              </button>

              {user && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('account');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Account
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </button>
                  )}
                </>
              )}

              <div className="pt-3 border-t border-gray-800">
                {!user && (
                  <>
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-white bg-gray-800 rounded-lg mb-2"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setShowSignupModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 bg-green-500 text-black font-medium rounded-lg"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}
