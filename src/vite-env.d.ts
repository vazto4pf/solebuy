/// <reference types="vite/client" />

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string | number;
    }>;
  };
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

interface PaystackPop {
  newTransaction: () => void;
}

interface Window {
  PaystackPop: {
    setup: (options: PaystackOptions) => PaystackPop;
  };
}
