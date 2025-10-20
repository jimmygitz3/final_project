const axios = require('axios');
const moment = require('moment');

class MpesaDaraja {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.baseUrl = process.env.MPESA_ENVIRONMENT === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    // Log configuration status (without exposing secrets)
    console.log('🔧 M-Pesa Configuration:', {
      environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
      baseUrl: this.baseUrl,
      businessShortCode: this.businessShortCode,
      hasConsumerKey: !!this.consumerKey && this.consumerKey !== 'your_consumer_key_here',
      hasConsumerSecret: !!this.consumerSecret && this.consumerSecret !== 'your_consumer_secret_here',
      hasPasskey: !!this.passkey && this.passkey !== 'your_passkey_here',
      callbackUrl: this.callbackUrl
    });
  }

  // Check if M-Pesa is properly configured
  isConfigured() {
    // If in demo mode, always return false to use demo payments
    if (process.env.MPESA_ENVIRONMENT === 'demo') {
      return false;
    }
    
    return !!(
      this.consumerKey && 
      this.consumerSecret && 
      this.businessShortCode && 
      this.passkey &&
      this.consumerKey !== 'your_consumer_key_here' &&
      this.consumerSecret !== 'your_consumer_secret_here' &&
      this.passkey !== 'your_passkey_here'
    );
  }

  // Generate access token
  async getAccessToken() {
    try {
      // If in demo mode, throw error to trigger demo fallback
      if (process.env.MPESA_ENVIRONMENT === 'demo') {
        throw new Error('Demo mode - using mock payments');
      }
      
      // Check if credentials are configured
      if (!this.consumerKey || !this.consumerSecret || 
          this.consumerKey === 'your_consumer_key_here' || 
          this.consumerSecret === 'your_consumer_secret_here') {
        throw new Error('M-Pesa credentials not configured');
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      if (!response.data.access_token) {
        throw new Error('No access token received from M-Pesa API');
      }

      console.log('✅ M-Pesa access token obtained successfully');
      return response.data.access_token;
    } catch (error) {
      const errorMsg = error.response?.data?.errorMessage || 
                      error.response?.data?.error_description || 
                      error.message;
      
      console.error('❌ M-Pesa access token error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        error: errorMsg,
        baseUrl: this.baseUrl
      });
      
      throw new Error(`M-Pesa authentication failed: ${errorMsg}`);
    }
  }

  // Generate password for STK Push
  generatePassword() {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  // Initiate STK Push
  async stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      // Format phone number (remove + and ensure it starts with 254)
      let formattedPhone = phoneNumber.replace(/\+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      const stkPushData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        stkPushData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID
      };
    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Query STK Push status
  async stkQuery(checkoutRequestId) {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const queryData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        queryData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('STK Query error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Validate callback data
  validateCallback(callbackData) {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      if (stkCallback.ResultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata;
        const items = callbackMetadata.Item;
        
        const result = {
          success: true,
          merchantRequestId: stkCallback.MerchantRequestID,
          checkoutRequestId: stkCallback.CheckoutRequestID,
          resultCode: stkCallback.ResultCode,
          resultDesc: stkCallback.ResultDesc
        };

        // Extract payment details from metadata
        items.forEach(item => {
          switch (item.Name) {
            case 'Amount':
              result.amount = item.Value;
              break;
            case 'MpesaReceiptNumber':
              result.mpesaReceiptNumber = item.Value;
              break;
            case 'TransactionDate':
              result.transactionDate = item.Value;
              break;
            case 'PhoneNumber':
              result.phoneNumber = item.Value;
              break;
          }
        });

        return result;
      } else {
        // Payment failed
        return {
          success: false,
          merchantRequestId: stkCallback.MerchantRequestID,
          checkoutRequestId: stkCallback.CheckoutRequestID,
          resultCode: stkCallback.ResultCode,
          resultDesc: stkCallback.ResultDesc
        };
      }
    } catch (error) {
      console.error('Callback validation error:', error);
      return {
        success: false,
        error: 'Invalid callback data'
      };
    }
  }
}

module.exports = MpesaDaraja;