import { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AccountPage from './components/AccountPage';
import DashboardPage from './components/DashboardPage';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'account' | 'admin'>('home');

  useEffect(() => {
    if (!user && (currentPage === 'dashboard' || currentPage === 'account' || currentPage === 'admin')) {
      setCurrentPage('home');
    }
  }, [user, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      <main className="flex-grow">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'dashboard' && user && <DashboardPage />}
        {currentPage === 'account' && user && <AccountPage />}
        {currentPage === 'admin' && user && isAdmin && <AdminDashboard />}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
