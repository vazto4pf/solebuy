import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Smartphone, ShoppingCart } from 'lucide-react';
import { Provider, Bundle } from '../types';
import CheckoutModal from './CheckoutModal';
import { useAuth } from '../contexts/AuthContext';

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [recipientNumber, setRecipientNumber] = useState('');

  useEffect(() => {
    if (user === null) {
      setRecipientNumber('');
    }
  }, [user]);

  const handleBuyBundle = (bundle: Bundle) => {
    if (!recipientNumber.trim()) {
      alert('Please enter a recipient phone number');
      return;
    }
    setSelectedBundle(bundle);
  };

  return (
    <>
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all">
        {/* Provider Header */}
        <div
          className="p-6 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Provider Logo Placeholder */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${provider.color}20` }}
              >
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{provider.name}</h3>
                <p className="text-gray-400 text-sm">{provider.bundles.length} bundles available</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-800">
            {/* Recipient Number Input */}
            <div className="p-6 bg-gray-800/30">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="e.g., 0241234567"
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">Enter the phone number to receive the bundle</p>
            </div>

            {/* Bundles Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {provider.bundles.map((bundle) => (
                  <button
                    key={bundle.id}
                    onClick={() => handleBuyBundle(bundle)}
                    className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 border-2 border-gray-700 hover:border-green-500 transition-all group"
                  >
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-green-500">{bundle.dataAmount}</div>
                      <div className="text-xl font-bold text-white">GH₵{bundle.price.toFixed(2)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedBundle && (
        <CheckoutModal
          provider={provider}
          bundle={selectedBundle}
          recipientNumber={recipientNumber}
          onClose={() => setSelectedBundle(null)}
        />
      )}
    </>
  );
}
