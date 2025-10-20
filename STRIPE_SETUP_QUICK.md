# Quick Stripe Setup Guide

## 🚀 Current Status: Demo Mode Active

Your Kejah platform is currently running in **Demo Mode** with simulated M-Pesa payments. This is perfect for development and testing!

## 🎯 Demo Mode Features

✅ **Fully Functional**: All payment flows work exactly like real payments
✅ **No Real Money**: Completely safe for testing
✅ **Realistic Flow**: Simulates M-Pesa STK push experience
✅ **Complete Integration**: All business logic executes properly

## 🔧 To Enable Real M-Pesa Payments

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete business verification

### Step 2: Get Your Test Keys
1. Go to **Developers > API keys** in your Stripe dashboard
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### Step 3: Update Environment Files

**Backend (.env):**
```env
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

**Frontend (.env):**
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

### Step 4: Enable M-Pesa
1. In your Stripe dashboard, go to **Settings > Payment methods**
2. Enable **M-Pesa** for Kenya
3. Complete any required verification

### Step 5: Restart Servers
```bash
# Backend will restart automatically (nodemon)
# Frontend: Ctrl+C and run npm start again
```

## 🧪 Testing with Real Stripe

Once configured, you can test with Stripe's test phone numbers:
- **Success**: `254700000000`
- **Failure**: `254700000001`

## 💡 Why Demo Mode is Great

- **Safe Development**: No risk of accidental charges
- **Complete Testing**: Test all features without Stripe account
- **Fast Setup**: Works immediately without configuration
- **Real Experience**: Identical to production flow

## 🎉 Ready to Go!

Your platform is fully functional in demo mode. You can:
- Create listings and pay activation fees
- Test connection fees for landlord contacts
- Try subscription upgrades
- Experience the complete user journey

**Demo payments work exactly like real ones - just without actual money transfer!**

---

*Need help? The demo mode provides the full Kejah experience while you decide on Stripe setup.*