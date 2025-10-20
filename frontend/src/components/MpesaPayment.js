import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  LinearProgress
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Phone,
  CreditCard,
  Error,
  Cancel
} from '@mui/icons-material';
import axios from 'axios';

const MpesaPayment = ({ 
  open, 
  onClose, 
  amount, 
  description, 
  phoneNumber,
  paymentType,
  listingId,
  onSuccess 
}) => {
  const [processing, setProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [queryAttempts, setQueryAttempts] = useState(0);
  const [maxQueryAttempts] = useState(30); // 30 attempts = 5 minutes

  const steps = ['Confirm Details', 'M-Pesa Prompt', 'Payment Status', 'Complete'];

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setProcessing(false);
      setError('');
      setPaymentData(null);
      setQueryAttempts(0);
    }
  }, [open]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    setActiveStep(1);

    try {
      // Initiate M-Pesa payment
      const response = await axios.post('http://localhost:5000/api/payments/mpesa/initiate', {
        amount,
        phoneNumber,
        paymentType,
        listingId,
        description
      });

      if (response.data.success) {
        setPaymentData(response.data);
        
        if (response.data.demoMode) {
          // Handle demo mode
          console.log('💡 Using demo payment mode');
          setTimeout(async () => {
            await handleDemoPayment(response.data.transactionId);
          }, 3000);
        } else {
          // Real M-Pesa mode - start querying payment status
          console.log('📱 Real M-Pesa payment initiated');
          setActiveStep(2);
          startPaymentStatusQuery(response.data.checkoutRequestId);
        }
      } else {
        throw new Error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
      setProcessing(false);
      setActiveStep(0);
    }
  };

  const handleDemoPayment = async (transactionId) => {
    try {
      // Simulate demo payment callback
      await axios.post('http://localhost:5000/api/payments/mpesa/demo-callback', {
        transactionId,
        receiptNumber: `MP${Date.now()}`,
        status: 'completed'
      });

      setActiveStep(3);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            transactionId,
            receiptNumber: `MP${Date.now()}`,
            amount: amount
          });
        }
        onClose();
      }, 2000);
    } catch (error) {
      setError('Demo payment processing failed');
      setProcessing(false);
      setActiveStep(0);
    }
  };

  const startPaymentStatusQuery = (checkoutRequestId) => {
    const queryInterval = setInterval(async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/payments/mpesa/query', {
          checkoutRequestId
        });

        if (response.data.success) {
          const { status, mpesaReceiptNumber, resultDesc } = response.data;

          if (status === 'completed') {
            clearInterval(queryInterval);
            setActiveStep(3);
            setTimeout(() => {
              if (onSuccess) {
                onSuccess({
                  checkoutRequestId,
                  receiptNumber: mpesaReceiptNumber,
                  amount: amount
                });
              }
              onClose();
            }, 2000);
          } else if (status === 'failed' || status === 'cancelled') {
            clearInterval(queryInterval);
            setError(resultDesc || `Payment ${status}`);
            setProcessing(false);
            setActiveStep(0);
          }
        }

        setQueryAttempts(prev => prev + 1);

        // Stop querying after max attempts
        if (queryAttempts >= maxQueryAttempts) {
          clearInterval(queryInterval);
          setError('Payment timeout. Please check your M-Pesa messages or try again.');
          setProcessing(false);
          setActiveStep(0);
        }
      } catch (error) {
        console.error('Payment query error:', error);
        setQueryAttempts(prev => prev + 1);
      }
    }, 10000); // Query every 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(queryInterval);
  };

  const handleClose = () => {
    if (!processing || activeStep === 3) {
      setActiveStep(0);
      setError('');
      setPaymentData(null);
      setQueryAttempts(0);
      onClose();
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 0: return <Payment />;
      case 1: return <Phone />;
      case 2: return <CircularProgress size={20} />;
      case 3: return <CheckCircle />;
      default: return <Payment />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          M-Pesa Payment
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel icon={getStepIcon(index)}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Details
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  KES {amount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {description}
                </Typography>
              </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                M-Pesa Phone Number
              </Typography>
              <TextField
                fullWidth
                value={phoneNumber}
                disabled
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="info.dark">
                💡 This will initiate an M-Pesa payment. In demo mode, the payment will be simulated.
              </Typography>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Sending M-Pesa Prompt...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please wait while we send the payment request to your phone
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="body2" color="warning.dark">
                📱 Check your phone for the M-Pesa payment prompt
              </Typography>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Waiting for Payment Confirmation...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Complete the payment on your phone using your M-Pesa PIN
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Checking payment status... ({queryAttempts}/{maxQueryAttempts})
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(queryAttempts / maxQueryAttempts) * 100} 
              />
            </Box>

            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="body2" color="info.dark">
                📱 Enter your M-Pesa PIN to complete the payment
              </Typography>
            </Box>
          </Box>
        )}

        {activeStep === 3 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Successful! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your M-Pesa payment has been processed successfully
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip icon={<CheckCircle />} label="Payment Confirmed" color="success" />
              <Chip icon={<CreditCard />} label="M-Pesa" color="primary" />
            </Box>
          </Box>
        )}
      </DialogContent>

      {activeStep === 0 && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            disabled={processing}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={processing}
            variant="contained"
            startIcon={processing ? <CircularProgress size={20} /> : <Payment />}
            sx={{ flex: 2 }}
          >
            {processing ? 'Processing...' : `Pay KES ${amount.toLocaleString()}`}
          </Button>
        </DialogActions>
      )}

      {activeStep === 2 && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            startIcon={<Cancel />}
          >
            Cancel Payment
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default MpesaPayment;