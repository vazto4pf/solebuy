# Paystack Integration Setup Guide

This application uses Paystack for secure payment processing. Follow the steps below to configure Paystack for your application.

## Prerequisites

- A Paystack account (sign up at [paystack.com](https://paystack.com))
- Access to your Paystack Dashboard

## Setup Instructions

### 1. Get Your Paystack API Keys

1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** and **Secret Key**
   - Use **Test Keys** for development
   - Use **Live Keys** for production

### 2. Configure Environment Variables

Update the `.env` file in your project root with your Paystack public key:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
```

**Important:** Replace `pk_test_your_paystack_public_key_here` with your actual Paystack public key.

### 3. Configure Paystack Secret Key (For Edge Function)

The payment verification edge function requires your Paystack secret key. This is automatically configured in your Supabase environment.

To set it manually if needed:

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - **Name:** `PAYSTACK_SECRET_KEY`
   - **Value:** Your Paystack secret key (e.g., `sk_test_xxxxx`)

### 4. Payment Flow

The payment flow works as follows:

1. User clicks "Pay" button in the checkout modal
2. Order is created in the database with status "pending"
3. Paystack payment popup opens
4. User completes payment through Paystack
5. Paystack callback triggers payment verification
6. Edge function verifies payment with Paystack API
7. Order status is updated to "completed"

### 5. Testing

To test the integration:

1. Use Paystack test cards (available in [Paystack documentation](https://paystack.com/docs/payments/test-payments))
2. Example test card:
   - **Card Number:** 5060 6666 6666 6666 669
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date
   - **PIN:** 1234

### 6. Going Live

When ready for production:

1. Switch from test keys to live keys in your `.env` file
2. Update the `PAYSTACK_SECRET_KEY` in Supabase with your live secret key
3. Complete Paystack's business verification process
4. Test thoroughly before accepting real payments

## Security Notes

- Never commit your secret keys to version control
- Keep your secret key secure and only use it server-side
- The public key can be safely used in client-side code
- All payment verification happens server-side through the edge function

## Troubleshooting

### Payment fails with "Paystack public key not configured"
- Ensure you've replaced the placeholder in `.env` with your actual public key
- Restart your development server after updating `.env`

### Payment verification fails
- Check that `PAYSTACK_SECRET_KEY` is set in Supabase Edge Function secrets
- Verify the secret key is correct and has not expired
- Check the Edge Function logs in Supabase Dashboard

### Order status not updating
- Verify the edge function is deployed correctly
- Check Edge Function logs for errors
- Ensure the order ID is being passed correctly to the verification endpoint

## Support

For Paystack-specific issues, visit [Paystack Support](https://paystack.com/contact)

For application issues, contact your development team.
