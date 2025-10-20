import React, { useState } from 'react';
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
  StepLabel
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Phone,
  CreditCard
} from '@mui/icons-material';
import axios from 'axios';

const MockPayment = ({ 
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

  const steps = ['Confirm Details', 'Process Payment', 'Complete'];

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    setActiveStep(1);

    try {
      // Initiate payment
      const response = await axios.post('http://localhost:5000/api/payments/mpesa/initiate', {
        amount,
        phoneNumber,
        paymentType,
        listingId,
        description
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful payment callback
      await axios.post('http://localhost:5000/api/payments/mpesa/callback', {
        transactionId: response.data.transactionId,
        receiptNumber: `MP${Date.now()}`,
        status: 'completed'
      });

      setActiveStep(2);
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            transactionId: response.data.transactionId,
            receiptNumber: `MP${Date.now()}`,
            amount: amount
          });
        }
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
      setActiveStep(0);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setActiveStep(0);
      setError('');
      onClose();
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
          Complete Payment
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
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

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                💡 This is a demo payment. In production, you would receive an M-Pesa prompt on your phone.
              </Typography>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Processing M-Pesa Payment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please complete the payment on your phone
            </Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="body2">
                📱 Check your phone for M-Pesa prompt
              </Typography>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Successful! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your payment has been processed successfully
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
    </Dialog>
  );
};

export default MockPayment;