import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const usePaymentStatus = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/payments/history');
      setPaymentHistory(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  }, []);

  const initiatePayment = async (paymentData) => {
    try {
      setError(null);
      
      // Validate phone number format
      const phoneRegex = /^254[17]\d{8}$/;
      const cleanPhone = paymentData.phoneNumber.replace(/\s+/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Invalid phone number format. Use 254XXXXXXXXX');
      }

      const response = await axios.post(
        'http://localhost:5000/api/payments/mpesa/initiate', 
        {
          ...paymentData,
          phoneNumber: cleanPhone
        }
      );

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Payment initiation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const simulatePaymentSuccess = async (transactionId, amount) => {
    try {
      // Simulate M-Pesa callback with realistic delay
      const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const receiptNumber = `MP${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
      
      await axios.post('http://localhost:5000/api/payments/mpesa/callback', {
        transactionId,
        receiptNumber,
        status: 'completed'
      });

      // Refresh payment history
      await fetchPaymentHistory();

      return { receiptNumber, amount };
    } catch (err) {
      throw new Error('Payment confirmation failed');
    }
  };

  const checkListingPaymentStatus = async (listingId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/payments/listing/${listingId}/status`);
      return response.data;
    } catch (err) {
      return { paid: false, message: 'Unable to check payment status' };
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  return {
    paymentHistory,
    loading,
    error,
    initiatePayment,
    simulatePaymentSuccess,
    checkListingPaymentStatus,
    refreshPaymentHistory: fetchPaymentHistory
  };
};

export default usePaymentStatus;