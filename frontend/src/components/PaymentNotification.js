import React from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { CheckCircle, Error, Info } from '@mui/icons-material';

const PaymentNotification = ({ 
  open, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  receiptNumber,
  amount 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'info': return <Info />;
      default: return <Info />;
    }
  };

  const getSeverity = () => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity={getSeverity()}
        icon={getIcon()}
        sx={{ 
          width: '100%', 
          minWidth: 350,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          {title}
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          {message}
        </Typography>

        {type === 'success' && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {amount && (
              <Chip 
                label={`KES ${amount.toLocaleString()}`} 
                size="small" 
                color="success"
                variant="outlined"
              />
            )}
            {receiptNumber && (
              <Chip 
                label={`Receipt: ${receiptNumber}`} 
                size="small" 
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {type === 'info' && (
          <Box sx={{ 
            mt: 1, 
            p: 1, 
            bgcolor: 'info.light', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="caption">
              📱 Check your phone for M-Pesa prompt
            </Typography>
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
};

export default PaymentNotification;