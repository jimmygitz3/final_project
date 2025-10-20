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
  Divider,
  Alert,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Star,
  Visibility,
  TrendingUp,
  Support,
  Security,
  Speed
} from '@mui/icons-material';
import MpesaPayment from './MpesaPayment';
import axios from 'axios';

const UpgradeModal = ({ open, onClose, user, onUpgradeSuccess }) => {
  const [step, setStep] = useState(1); // 1: Plan Selection, 2: Payment Details, 3: Processing, 4: Success
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [paymentData, setPaymentData] = useState({
    phoneNumber: user?.phone || '',
    amount: 1000
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripePayment, setStripePayment] = useState({
    open: false,
    amount: 1000,
    description: '',
    paymentType: 'subscription',
    listingId: null
  });

  const plans = {
    premium: {
      name: 'Premium Plan',
      price: 1000,
      duration: '1 Month',
      features: [
        'Unlimited property listings',
        'Priority listing placement',
        'Advanced analytics dashboard',
        'Customer support priority',
        'Featured property badges',
        'Social media promotion'
      ],
      color: 'primary'
    },
    pro: {
      name: 'Pro Plan',
      price: 2500,
      duration: '3 Months',
      features: [
        'Everything in Premium',
        'Professional photography tips',
        'Market insights & trends',
        'Bulk listing management',
        'Custom branding options',
        'Dedicated account manager'
      ],
      color: 'secondary'
    }
  };

  const handlePayment = () => {
    // Open Stripe payment dialog
    setStripePayment({
      open: true,
      amount: paymentData.amount,
      description: `${plans[selectedPlan].name} - ${plans[selectedPlan].duration}`,
      paymentType: 'subscription',
      listingId: null
    });
  };

  const handleStripePaymentSuccess = (paymentData) => {
    setStep(4);
    if (onUpgradeSuccess) {
      onUpgradeSuccess();
    }
  };

  const handleStripePaymentClose = () => {
    setStripePayment({ 
      open: false, 
      amount: 1000, 
      description: '', 
      paymentType: 'subscription', 
      listingId: null 
    });
  };

  const handleClose = () => {
    if (step !== 3) { // Don't allow closing during payment processing
      setStep(1);
      setError('');
      onClose();
    }
  };

  const renderPlanSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Choose Your Subscription Plan
      </Typography>
      
      <Grid container spacing={3}>
        {Object.entries(plans).map(([key, plan]) => (
          <Grid item xs={12} md={6} key={key}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedPlan === key ? '2px solid' : '1px solid #E0E0E0',
                borderColor: selectedPlan === key ? `${plan.color}.main` : '#E0E0E0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => {
                setSelectedPlan(key);
                setPaymentData(prev => ({ ...prev, amount: plan.price }));
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" color={`${plan.color}.main`} sx={{ fontWeight: 700 }}>
                    KES {plan.price.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.duration}
                  </Typography>
                </Box>

                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItem>
                  ))}
                </List>

                {selectedPlan === key && (
                  <Chip 
                    label="Selected" 
                    color={plan.color}
                    sx={{ mt: 2, width: '100%' }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderPaymentDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Payment Details
      </Typography>

      <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {plans[selectedPlan].name}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            KES {plans[selectedPlan].price.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            {plans[selectedPlan].duration} subscription
          </Typography>
        </CardContent>
      </Card>

      <TextField
        fullWidth
        label="M-Pesa Phone Number"
        value={paymentData.phoneNumber}
        onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
        placeholder="254XXXXXXXXX"
        sx={{ mb: 3 }}
        helperText="Enter your M-Pesa registered phone number"
      />

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
  );

  const renderProcessing = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Processing Payment...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we process your M-Pesa payment
      </Typography>
      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="body2">
          📱 Check your phone for M-Pesa confirmation
        </Typography>
      </Box>
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Payment Successful! 🎉
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your {plans[selectedPlan].name} subscription is now active
      </Typography>
      
      <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', mb: 3 }}>
        <CardContent>
          <Typography variant="h6">
            Welcome to {plans[selectedPlan].name}!
          </Typography>
          <Typography variant="body2">
            You now have access to all premium features
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Chip icon={<Star />} label="Priority Support" color="primary" />
        <Chip icon={<Visibility />} label="Advanced Analytics" color="primary" />
        <Chip icon={<TrendingUp />} label="Featured Listings" color="primary" />
      </Box>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Upgrade Subscription
        </Typography>
        {step !== 3 && (
          <Button onClick={handleClose} sx={{ minWidth: 'auto', p: 1 }}>
            <Close />
          </Button>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        {step === 1 && renderPlanSelection()}
        {step === 2 && renderPaymentDetails()}
        {step === 3 && renderProcessing()}
        {step === 4 && renderSuccess()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {step === 1 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => setStep(2)}
              sx={{ px: 4 }}
            >
              Continue
            </Button>
          </>
        )}
        
        {step === 2 && (
          <>
            <Button onClick={() => setStep(1)}>Back</Button>
            <Button 
              variant="contained" 
              onClick={handlePayment}
              disabled={!paymentData.phoneNumber || loading}
              sx={{ px: 4 }}
            >
              Pay KES {paymentData.amount.toLocaleString()}
            </Button>
          </>
        )}

        {step === 4 && (
          <Button 
            variant="contained" 
            onClick={handleClose}
            sx={{ px: 4 }}
          >
            Get Started
          </Button>
        )}
      </DialogActions>

      {/* M-Pesa Payment Dialog */}
      <MpesaPayment
        open={stripePayment.open}
        onClose={handleStripePaymentClose}
        amount={stripePayment.amount}
        description={stripePayment.description}
        phoneNumber={paymentData.phoneNumber}
        paymentType={stripePayment.paymentType}
        listingId={stripePayment.listingId}
        onSuccess={handleStripePaymentSuccess}
      />
    </Dialog>
  );
};

export default UpgradeModal;