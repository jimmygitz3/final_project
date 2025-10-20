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
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Error,
  Phone,
  CreditCard
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Demo Payment Mode Component
const DemoPaymentMode = ({ amount, description, phoneNumber, onSuccess, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Confirm Details', 'Process Payment', 'Complete'];

  const handleDemoPayment = async () => {
    setProcessing(true);
    setActiveStep(1);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the backend to create a mock payment record
      const response = await axios.post('http://localhost:5000/api/payments/mpesa/callback', {
        transactionId: `DEMO${Date.now()}`,
        receiptNumber: `MP${Date.now()}`,
        status: 'completed'
      });

      setActiveStep(2);
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            id: `pi_demo_${Date.now()}`,
            status: 'succeeded',
            amount: amount,
            receiptNumber: `MP${Date.now()}`
          });
        }
      }, 1500);

    } catch (error) {
      console.error('Demo payment error:', error);
      setProcessing(false);
      setActiveStep(0);
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Demo Payment Mode
            </Typography>
            <Typography variant="body2">
              This is a demonstration of the M-Pesa payment flow. No real money will be charged.
            </Typography>
          </Alert>

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

          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              💡 This is a demo payment. In production, you would receive an M-Pesa prompt on your phone.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={onCancel}
              disabled={processing}
              variant="outlined"
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDemoPayment}
              disabled={processing}
              variant="contained"
              startIcon={processing ? <CircularProgress size={20} /> : <Payment />}
              sx={{ flex: 2 }}
            >
              {processing ? 'Processing...' : `Pay KES ${amount.toLocaleString()} (Demo)`}
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 1 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Processing Demo Payment...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Simulating M-Pesa payment flow
          </Typography>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="body2">
              📱 In production, you would check your phone for M-Pesa prompt
            </Typography>
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Demo Payment Successful! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your demo payment has been processed successfully
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip icon={<CheckCircle />} label="Demo Payment" color="success" />
            <Chip icon={<CreditCard />} label="M-Pesa Simulation" color="primary" />
          </Box>
        </Box>
      )}
    </Box>
  );
};

const PaymentForm = ({ 
  clientSecret, 
  amount, 
  description, 
  phoneNumber,
  onSuccess, 
  onError,
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Confirm Details', 'Process Payment', 'Complete'];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');
    setActiveStep(1);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setProcessing(false);
        setActiveStep(0);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            billing_details: {
              phone: phoneNumber
            }
          }
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
        setActiveStep(0);
        if (onError) onError(confirmError);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setActiveStep(2);
        setTimeout(() => {
          if (onSuccess) onSuccess(paymentIntent);
        }, 1500);
      }
    } catch (err) {
      setError('Payment processing failed: ' + err.message);
      setProcessing(false);
      setActiveStep(0);
      if (onError) onError(err);
    }
  };

  return (
    <Box>
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
              Contact Phone Number
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

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              M-Pesa is not yet enabled in this Stripe account. You can use card payments for testing.
            </Typography>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <PaymentElement 
              options={{
                layout: 'tabs',
                fields: {
                  billingDetails: {
                    phone: 'auto'
                  }
                }
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                onClick={onCancel}
                disabled={processing}
                variant="outlined"
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || processing}
                variant="contained"
                startIcon={processing ? <CircularProgress size={20} /> : <Payment />}
                sx={{ flex: 2 }}
              >
                {processing ? 'Processing...' : `Pay KES ${amount.toLocaleString()}`}
              </Button>
            </Box>
          </form>
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
    </Box>
  );
};

const StripePayment = ({ 
  open, 
  onClose, 
  amount, 
  description, 
  phoneNumber,
  paymentType,
  listingId,
  onSuccess 
}) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && amount && phoneNumber) {
      initiatePayment();
    }
  }, [open, amount, phoneNumber]);

  const initiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/payments/mpesa/initiate', {
        amount,
        phoneNumber,
        paymentType,
        listingId,
        description
      });

      console.log('Payment initiation response:', response.data);
      setClientSecret(response.data.clientSecret);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (paymentIntent) => {
    if (onSuccess) {
      onSuccess({
        paymentIntent,
        amount,
        description
      });
    }
    onClose();
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed');
  };

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0066CC',
      colorBackground: '#ffffff',
      colorText: '#2C3E50',
      colorDanger: '#df1b41',
      fontFamily: 'Poppins, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
        {!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY === 'pk_test_51234567890abcdef' ? (
          <DemoPaymentMode 
            amount={amount}
            description={description}
            phoneNumber={phoneNumber}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        ) : loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2">
              Initializing payment...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button 
              onClick={initiatePayment} 
              sx={{ mt: 1, display: 'block' }}
              variant="outlined"
              size="small"
            >
              Retry
            </Button>
          </Alert>
        ) : clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <PaymentForm
              clientSecret={clientSecret}
              amount={amount}
              description={description}
              phoneNumber={phoneNumber}
              onSuccess={handleSuccess}
              onError={handleError}
              onCancel={onClose}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default StripePayment;