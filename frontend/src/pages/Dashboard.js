import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { Add, Payment, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      if (user.userType === 'landlord') {
        const listingsResponse = await axios.get('http://localhost:5000/api/listings/my/listings');
        setListings(listingsResponse.data);
      }
      
      const paymentsResponse = await axios.get('http://localhost:5000/api/payments/history');
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (listingId, amount, description) => {
    try {
      const response = await axios.post('http://localhost:5000/api/payments/mpesa/initiate', {
        amount,
        phoneNumber: user.phone,
        paymentType: 'listing_fee',
        listingId,
        description
      });
      
      alert('Payment initiated! Please complete on your phone.');
      fetchData(); // Refresh data
    } catch (error) {
      alert('Payment failed: ' + error.response?.data?.message);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name}!
      </Typography>
      
      {user.userType === 'landlord' && user.subscriptionStatus !== 'active' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your subscription is inactive. Some features may be limited.
        </Alert>
      )}

      {user.userType === 'landlord' && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">My Listings</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-listing')}
            >
              Add New Listing
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid item xs={12} md={6} key={listing._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {listing.title}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {listing.location.town}, {listing.location.county}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      KES {listing.price.toLocaleString()}/month
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={listing.paymentStatus} 
                        color={listing.paymentStatus === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                      <Chip 
                        label={listing.isActive ? 'Active' : 'Inactive'} 
                        color={listing.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Visibility fontSize="small" />
                      <Typography variant="body2">
                        {listing.views} views
                      </Typography>
                    </Box>

                    {listing.paymentStatus !== 'paid' && (
                      <Button
                        variant="outlined"
                        startIcon={<Payment />}
                        onClick={() => handlePayment(listing._id, 500, `Listing fee for ${listing.title}`)}
                        fullWidth
                      >
                        Pay KES 500 to Activate
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box>
        <Typography variant="h5" gutterBottom>
          Payment History
        </Typography>
        <Grid container spacing={2}>
          {payments.map((payment) => (
            <Grid item xs={12} md={6} key={payment._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {payment.description}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    KES {payment.amount}
                  </Typography>
                  <Chip 
                    label={payment.status} 
                    color={payment.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;