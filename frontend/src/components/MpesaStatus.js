import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Chip,
  Button,
  Collapse,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import axios from 'axios';

const MpesaStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkMpesaStatus();
  }, []);

  const checkMpesaStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payments/mpesa/test');
      setStatus(response.data);
    } catch (error) {
      setStatus({
        status: 'error',
        message: 'Unable to check M-Pesa status',
        configured: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">Checking M-Pesa configuration...</Typography>
      </Alert>
    );
  }

  if (!status) return null;

  const getSeverity = () => {
    switch (status.status) {
      case 'configured': return 'success';
      case 'demo_mode': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getIcon = () => {
    switch (status.status) {
      case 'configured': return <CheckCircle />;
      case 'demo_mode': return <Warning />;
      case 'error': return <Error />;
      default: return <Info />;
    }
  };

  const getTitle = () => {
    switch (status.status) {
      case 'configured': return 'M-Pesa Daraja API Active';
      case 'demo_mode': return 'Demo Payment Mode';
      case 'error': return 'M-Pesa Configuration Error';
      default: return 'M-Pesa Status';
    }
  };

  return (
    <Alert 
      severity={getSeverity()} 
      icon={getIcon()}
      sx={{ mb: 2 }}
      action={
        <IconButton
          color="inherit"
          size="small"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      }
    >
      <AlertTitle>{getTitle()}</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {status.message}
      </Typography>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip 
              label={`Environment: ${status.environment || 'Demo'}`}
              size="small"
              color={status.configured ? 'primary' : 'default'}
            />
            {status.businessShortCode && (
              <Chip 
                label={`Business: ${status.businessShortCode}`}
                size="small"
                variant="outlined"
              />
            )}
            <Chip 
              label={status.configured ? 'Real Payments' : 'Demo Payments'}
              size="small"
              color={status.configured ? 'success' : 'warning'}
            />
          </Box>

          {status.status === 'demo_mode' && (
            <Typography variant="body2" color="text.secondary">
              💡 Demo mode provides the full payment experience without real M-Pesa transactions. 
              Perfect for development and testing!
            </Typography>
          )}

          {status.status === 'configured' && (
            <Typography variant="body2" color="text.secondary">
              🎉 Real M-Pesa payments are active! Users will receive actual M-Pesa prompts on their phones.
            </Typography>
          )}

          {status.status === 'error' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                To enable real M-Pesa payments:
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div">
                1. Get M-Pesa Daraja API credentials from Safaricom<br/>
                2. Update environment variables in backend/.env<br/>
                3. Restart the server
              </Typography>
              <Button 
                size="small" 
                onClick={checkMpesaStatus}
                sx={{ mt: 1 }}
              >
                Recheck Status
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>
    </Alert>
  );
};

export default MpesaStatus;