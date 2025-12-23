import { useState } from 'react';
import { X, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Provider, Bundle } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckoutModalProps {
  provider: Provider;
  bundle: Bundle;
  recipientNumber: string;
  onClose: () => void;
}

const MOBILE_NETWORKS = ['MTN', 'Vodafone', 'AirtelTigo'];

export default function CheckoutModal({ provider, bundle, recipientNumber, onClose }: CheckoutModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'payment' | 'success'>('payment');
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!user) {
      setError('Please log in to complete your purchase');
      return;
    }

    if (!mobileMoneyNumber.trim()) {
      setError('Please enter your mobile money number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('orders').insert({
        user_id: user.id,
        provider_name: provider.name,
        provider_logo: provider.logo,
        provider_color: provider.color,
        bundle_id: bundle.id,
        data_amount: bundle.dataAmount,
        price: bundle.price,
        recipient_number: recipientNumber,
        mobile_money_number: mobileMoneyNumber,
        payment_network: selectedNetwork,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError('Failed to process payment. Please try again.');
      console.error('Payment error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 'success' ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400">Your order has been places successfully!</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Provider</span>
                <span className="text-white font-medium">{provider.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Data Amount</span>
                <span className="text-white font-medium">{bundle.dataAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Recipient</span>
                <span className="text-white font-medium">{recipientNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-white font-medium">{selectedNetwork}</span>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid</span>
                  <span className="text-green-500 font-bold text-xl">GH₵{bundle.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Complete Purchase</h2>
            </div>

            {/* Bundle Summary */}
            <div className="p-4 sm:p-6 bg-gray-800/30 border-b border-gray-800">
              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${provider.color}20` }}
                >
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{provider.name}</h3>
                  <p className="text-gray-400 text-sm">{bundle.dataAmount}</p>
                  <p className="text-gray-400 text-sm mt-1">To: {recipientNumber}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-green-500">GH₵{bundle.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="p-4 sm:p-6 space-y-6">
              {!user ? (
                <div className="space-y-6 text-center py-8">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-green-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Account Required</h3>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Please create an account or log in to complete your purchase and track your orders.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-left space-y-2">
                    <p className="text-gray-300 text-sm font-medium">Benefits of having an account:</p>
                    <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                      <li>Track your order history</li>
                      <li>View order status and receipts</li>
                      <li>Faster checkout for future purchases</li>
                      <li>Manage your account settings</li>
                    </ul>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Use the <span className="text-green-500 font-semibold">Sign Up</span> or <span className="text-green-500 font-semibold">Login</span> button in the top navigation to get started.
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Select Network</label>
                      <select
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      >
                        {MOBILE_NETWORKS.map((network) => (
                          <option key={network} value={network}>
                            {network}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Mobile Money Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={mobileMoneyNumber}
                          onChange={(e) => setMobileMoneyNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          placeholder="024 123 4567"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
                      <p className="text-gray-400 text-xs sm:text-sm">
                        You will receive a prompt on your mobile device to authorize this payment
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : `Pay GH₵${bundle.price.toFixed(2)}`}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
