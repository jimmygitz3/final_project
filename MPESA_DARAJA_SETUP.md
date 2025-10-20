# M-Pesa Daraja API Integration Setup Guide

## 🚀 Overview

The Kejah platform now uses **M-Pesa Daraja API** for real M-Pesa payments, providing authentic mobile money transactions for Kenyan users.

## 📋 Prerequisites

1. **Safaricom Developer Account**: Create account at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. **M-Pesa Business Account**: Required for live payments
3. **SSL Certificate**: Required for production callback URLs
4. **Public IP/Domain**: For receiving M-Pesa callbacks

## 🔧 Setup Instructions

### 1. Safaricom Developer Portal Setup

1. **Create Developer Account**
   - Visit [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Sign up and verify your account
   - Complete KYC verification

2. **Create New App**
   - Go to "My Apps" and click "Create New App"
   - Choose "Lipa Na M-Pesa Online" product
   - Fill in app details and submit for approval

3. **Get API Credentials**
   - Once approved, get your:
     - **Consumer Key**
     - **Consumer Secret**
     - **Passkey** (for STK Push)

### 2. Environment Configuration

**Backend (.env)**
```env
# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

**For Production:**
```env
MPESA_ENVIRONMENT=production
MPESA_BUSINESS_SHORTCODE=your_live_shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
```

### 3. Callback URL Setup

**Important**: Your callback URL must be:
- **HTTPS** (SSL required)
- **Publicly accessible** (no localhost in production)
- **Whitelisted** in Safaricom developer portal

**Example Production URLs:**
```
https://kejah.co.ke/api/payments/mpesa/callback
https://api.kejah.co.ke/payments/mpesa/callback
```

## 💳 Payment Flow

### 1. Payment Initiation
```javascript
// Frontend initiates payment
const response = await axios.post('/api/payments/mpesa/initiate', {
  amount: 500,
  phoneNumber: '254712345678',
  paymentType: 'listing_fee',
  listingId: 'listing_id',
  description: 'Property listing fee'
});
```

### 2. STK Push Process
1. Backend calls Daraja API STK Push
2. User receives M-Pesa prompt on phone
3. User enters M-Pesa PIN to complete payment
4. M-Pesa sends callback to your server
5. Backend processes callback and updates payment status

### 3. Payment Confirmation
```javascript
// Query payment status
const status = await axios.post('/api/payments/mpesa/query', {
  checkoutRequestId: 'ws_CO_123456789'
});
```

## 🔄 API Endpoints

### Payment Initiation
```
POST /api/payments/mpesa/initiate
```
**Request:**
```json
{
  "amount": 500,
  "phoneNumber": "254712345678",
  "paymentType": "listing_fee",
  "listingId": "listing_id",
  "description": "Payment description"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "payment_id",
  "checkoutRequestId": "ws_CO_123456789",
  "merchantRequestId": "merchant_id",
  "message": "M-Pesa payment initiated"
}
```

### Payment Callback
```
POST /api/payments/mpesa/callback
```
**Safaricom sends callback with payment result**

### Payment Query
```
POST /api/payments/mpesa/query
```
**Request:**
```json
{
  "checkoutRequestId": "ws_CO_123456789"
}
```

## 🛡️ Security Features

### 1. Callback Validation
- Validates callback structure and data
- Verifies payment amounts and phone numbers
- Prevents duplicate payment processing

### 2. Phone Number Validation
```javascript
// Formats: 0712345678, +254712345678, 254712345678
// All converted to: 254712345678
```

### 3. Transaction Tracking
- Unique checkout request IDs
- Merchant request ID tracking
- Complete audit trail

## 🧪 Testing

### 1. Sandbox Testing
- Use sandbox credentials
- Test phone numbers: `254708374149`, `254711111111`
- Test amounts: Any amount (no real money charged)

### 2. Test Scenarios
```javascript
// Successful payment
{
  phoneNumber: "254708374149",
  amount: 100
}

// User cancellation
{
  phoneNumber: "254711111111", 
  amount: 50
}

// Insufficient funds
{
  phoneNumber: "254708374149",
  amount: 100000
}
```

## 📊 Payment Types Supported

### 1. Listing Fee (KES 500)
- Activates property listing for 30 days
- Required for listing visibility

### 2. Connection Fee (KES 100)
- Unlocks landlord contact information
- 30-day access period

### 3. Subscription Fee (KES 1000+)
- Premium landlord features
- Monthly subscription

## 🚀 Production Deployment

### 1. SSL Certificate
```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 2. Callback URL Whitelisting
- Add your production callback URL in Safaricom portal
- Test callback URL accessibility
- Monitor callback logs

### 3. Environment Variables
```bash
# Set production environment variables
export MPESA_ENVIRONMENT=production
export MPESA_CONSUMER_KEY=live_key
export MPESA_CONSUMER_SECRET=live_secret
export MPESA_BUSINESS_SHORTCODE=live_shortcode
```

## 📈 Monitoring & Analytics

### 1. Payment Logs
```javascript
// Backend logs all M-Pesa interactions
console.log('M-Pesa Callback received:', callbackData);
console.log('Payment completed:', paymentId);
```

### 2. Error Tracking
- Failed payment attempts
- Callback validation errors
- API communication issues

### 3. Success Metrics
- Payment completion rates
- Average payment time
- User payment patterns

## 🔧 Troubleshooting

### Common Issues

1. **Callback Not Received**
   - Check callback URL accessibility
   - Verify SSL certificate
   - Check firewall settings

2. **STK Push Fails**
   - Verify phone number format
   - Check API credentials
   - Ensure sufficient M-Pesa balance

3. **Payment Timeout**
   - User didn't complete payment
   - Network connectivity issues
   - M-Pesa service downtime

### Debug Commands
```bash
# Test callback URL
curl -X POST https://yourdomain.com/api/payments/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{"test": "callback"}'

# Check SSL certificate
openssl s_client -connect yourdomain.com:443
```

## 📞 Support

- **Safaricom Support**: [developer.safaricom.co.ke/support](https://developer.safaricom.co.ke/support)
- **API Documentation**: [developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs)
- **Status Page**: [status.safaricom.co.ke](https://status.safaricom.co.ke)

## 🎉 Benefits

✅ **Real M-Pesa Integration**: Authentic mobile money processing
✅ **Secure Transactions**: Bank-level security and encryption
✅ **Instant Confirmation**: Real-time payment notifications
✅ **User Friendly**: Familiar M-Pesa experience for Kenyan users
✅ **Reliable**: Built on Safaricom's robust infrastructure
✅ **Scalable**: Handles high transaction volumes
✅ **Compliant**: Meets Kenyan financial regulations

The M-Pesa Daraja integration provides a production-ready payment solution for the Kejah platform! 🚀