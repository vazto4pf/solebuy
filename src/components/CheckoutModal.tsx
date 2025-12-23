import { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Provider, Bundle } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckoutModalProps {
  provider: Provider;
  bundle: Bundle;
  recipientNumber: string;
  onClose: () => void;
}

export default function CheckoutModal({ provider, bundle, recipientNumber, onClose }: CheckoutModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'payment' | 'success'>('payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!user) {
      setError('Please log in to complete your purchase');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting payment process...');

      if (!window.PaystackPop) {
        throw new Error('Paystack is not loaded. Please refresh the page and try again.');
      }

      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      console.log('Paystack key available:', !!paystackKey);

      if (!paystackKey || paystackKey === 'pk_test_your_paystack_public_key_here') {
        throw new Error('Paystack public key not configured');
      }

      // Generate unique reference without creating order
      const uniqueRef = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log('Generated reference:', uniqueRef);
      console.log('Setting up Paystack handler...');

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: Math.round(bundle.price * 100),
        currency: 'GHS',
        ref: uniqueRef,
        metadata: {
          user_id: user.id,
          provider_name: provider.name,
          provider_color: provider.color,
          bundle_id: bundle.id,
          data_amount: bundle.dataAmount,
          price: bundle.price.toString(),
          recipient_number: recipientNumber,
          custom_fields: [
            {
              display_name: 'Provider',
              variable_name: 'provider',
              value: provider.name,
            },
            {
              display_name: 'Bundle',
              variable_name: 'bundle',
              value: bundle.dataAmount,
            },
            {
              display_name: 'Recipient',
              variable_name: 'recipient',
              value: recipientNumber,
            },
          ],
        },
        callback: function(response: any) {
          console.log('Payment successful, verifying and creating order...');
          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`;
          fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reference: response.reference,
            }),
          })
          .then(res => res.json())
          .then(verifyData => {
            console.log('Verification response:', verifyData);
            if (verifyData.verified) {
              setLoading(false);
              setStep('success');
            } else {
              setLoading(false);
              setError('Payment verification failed');
            }
          })
          .catch(err => {
            setLoading(false);
            setError('Payment verification failed. Please contact support.');
            console.error('Verification error:', err);
          });
        },
        onClose: function() {
          console.log('Payment popup closed');
          setLoading(false);
          setError('Payment cancelled');
        },
      });

      console.log('Opening Paystack popup...');
      handler.openIframe();

      // Turn off loading immediately - Paystack iframe handles its own state
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.';
      setError(errorMessage);
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
                <span className="text-white font-medium">Paystack</span>
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

                  <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 space-y-3">
                    <h3 className="text-base font-semibold text-white">Payment Method</h3>
                    <div className="flex items-center space-x-3">
                      <img
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAY1BMVEUBGzMJpdsJqeAAABsAAB0Im84AECkBGDAJreYCL0oFaZACNlIFZYsJodYAAB8JotkIlMYHjb0FXH8ACiQADSYAFCwHg7EHh7YEVHYHe6YCKkQETm8DRGMGbpYCJj8DPlwGdZ/B21UTAAADF0lEQVR4nO3d4XKiMBRAYUiBRNQUCUFFrb7/U66ubvtbzeVmO+d7gM6cQau5xFAUAAAAAAAAAAAAAAAAAIBfzDahUhEGO0vgUKzGWsXmNPkZAv3JGVOqMMaNUfwy+lEp7xFZW+HE4aQaeE3cVKKBtnC6gWXpjlGysFkpX8LrRRyDZGHYqheWtWhhVWv3leVnQyGFFGqjkEIKtfsopJBCCv//wixWT4NkYdOqF5qt6PrQTupTDLMTnWIUYa89ieqkR6ZNpztNLCfpgakdRqfWaFz3Jfsa/cuf991aRT0ewix3LmLw1YeCqgozXEAAQCI2NqqkPzNitehbTatDI7qACufOGV3OXBq57zahV18/lbfb+YVUYjzkEHhLlFoH+0/ttgezkhnXxF0el7AUu9mtvsT/4RYi70SfwTTxQWhek8O89MH0FFJIoTYKKaRQH4UUUqhPqNB32mHf3EGkcLhksz40XyLrw3jOZo3fCQ1qPnRvcv8QepHeNmNop925vdiGhbhY619F4y6COzJibGuny2yOsltOmqpYaJrCDPfzrSrxPACYw2//JzpUX0sVk59l4160p7XWl5lyP4luY78HLjW/lxqzE93lfWUXyt+7xVZN/2SwPpR9K8aj+hrftKJvxRzmNFLji7sqg1nbWnTLVw7zUn7ZRSGF2n0UUkghhRRSSKF8YQ57hNeyJw5ksM9bdn0Yd+qF5iK6Piz8Wr1QZo/+N/XfzLhWepwYeq3zWe+BkjfwHwbF3665ejfHMbuxmvqVin75MdMP8rV+Qyp/hjAAIJkYUhxPk/FhM/441p/vq8ejz/LzzTbbROdEGbfN8iM8JrzNbeoMX6hV0kW+2UsvhZ6W+sw9oZ+cv6FJ/PAHc5IdSTwvbBIXyh7z+ILk89INhXOjkEIK9VFIIYX6KKQw/8Lk9/GzKwyJn34o/Ji4F6R+dp7U2YCvszZxodgRli8b2pSDGtfmNsQobs8hTZfoxjnuWT/NtybJXoXrX2llHyn6siH2Y/e+sY8ZvkQfmuDfF3L7LwoAAAAAAAAAAAAAAAAAyMMfLaaOu1xmU6AAAAAASUVORK5CYII="
                        alt="Paystack"
                        className="w-10 h-10"
                      />
                      <div>
                        <p className="text-white font-medium">Paystack</p>
                        <p className="text-gray-400 text-xs">Secure payment powered by Paystack</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Pay with Mobile Money, Card, or Bank Transfer
                    </p>
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
