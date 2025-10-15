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
  Alert,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Badge
} from '@mui/material';
import { 
  Add, 
  Payment, 
  Visibility, 
  Home, 
  TrendingUp, 
  AccountBalance,
  Notifications,
  Star,
  LocationOn
} from '@mui/icons-material';
import StatsCard from '../components/StatsCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEarnings: 0,
    activeListings: 0,
    avgRating: 4.2
  });

  const fetchData = React.useCallback(async () => {
    try {
      if (user?.userType === 'landlord') {
        const listingsResponse = await axios.get('http://localhost:5000/api/listings/my/listings');
        const listingsData = listingsResponse.data;
        setListings(listingsData);
        
        // Calculate stats
        const totalViews = listingsData.reduce((sum, listing) => sum + listing.views, 0);
        const activeListings = listingsData.filter(listing => listing.isActive).length;
        
        // Calculate average rating from all landlord's properties
        let totalRating = 0;
        let totalReviews = 0;
        
        try {
          for (const listing of listingsData) {
            const reviewResponse = await axios.get(`http://localhost:5000/api/reviews/listing/${listing._id}/summary`);
            if (reviewResponse.data.totalReviews > 0) {
              totalRating += reviewResponse.data.averageRating * reviewResponse.data.totalReviews;
              totalReviews += reviewResponse.data.totalReviews;
            }
          }
        } catch (error) {
          console.error('Error fetching review data:', error);
        }
        
        const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        
        setStats({
          totalViews,
          totalEarnings: payments.reduce((sum, payment) => 
            payment.status === 'completed' ? sum + payment.amount : sum, 0
          ),
          activeListings,
          avgRating
        });
      }
      
      const paymentsResponse = await axios.get('http://localhost:5000/api/payments/history');
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [user, payments]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);



  const handlePayment = async (listingId, amount, description) => {
    try {
      await axios.post('http://localhost:5000/api/payments/mpesa/initiate', {
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
      {/* Welcome Header */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome back, {user.name}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {user.userType === 'landlord' ? 'Manage your properties' : 'Find your perfect home'}
            </Typography>
            <Chip 
              label={user.userType.toUpperCase()} 
              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Box>
      </Paper>
      
      {user.userType === 'landlord' && user.subscriptionStatus !== 'active' && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<Notifications />}>
          Your subscription is inactive. Upgrade to unlock all features and boost your listings!
          <Button variant="outlined" size="small" sx={{ ml: 2 }}>
            Upgrade Now
          </Button>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          {user.userType === 'landlord' && <Tab label="My Properties" />}
          <Tab label="Payments" />
          <Tab label="Activity" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {/* Stats Cards */}
          {user.userType === 'landlord' && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Total Properties"
                  value={listings.length}
                  subtitle={`${stats.activeListings} active`}
                  icon={<Home />}
                  color="primary"
                  trend={12}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Total Views"
                  value={stats.totalViews.toLocaleString()}
                  subtitle="This month"
                  icon={<Visibility />}
                  color="secondary"
                  trend={8}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Earnings"
                  value={`KES ${stats.totalEarnings.toLocaleString()}`}
                  subtitle="Total earned"
                  icon={<AccountBalance />}
                  color="success"
                  trend={15}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Rating"
                  value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'No reviews'}
                  subtitle={stats.avgRating > 0 ? 'Average rating' : 'Get your first review'}
                  icon={<Star />}
                  color="warning"
                  progress={stats.avgRating * 20}
                />
              </Grid>
            </Grid>
          )}

          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {user.userType === 'landlord' ? (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/create-listing')}
                      sx={{ py: 2 }}
                    >
                      Add Property
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setTabValue(1)}
                      sx={{ py: 2 }}
                    >
                      View Properties
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Payment />}
                      onClick={() => setTabValue(2)}
                      sx={{ py: 2 }}
                    >
                      Payments
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TrendingUp />}
                      sx={{ py: 2 }}
                    >
                      Analytics
                    </Button>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Home />}
                      onClick={() => navigate('/')}
                      sx={{ py: 2 }}
                    >
                      Browse Properties
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Star />}
                      onClick={() => navigate('/favorites')}
                      sx={{ py: 2 }}
                    >
                      My Favorites
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Payment />}
                      onClick={() => setTabValue(2)}
                      sx={{ py: 2 }}
                    >
                      Payment History
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {payments.slice(0, 3).map((payment, index) => (
                <ListItem key={payment._id}>
                  <ListItemIcon>
                    <Payment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={payment.description}
                    secondary={`KES ${payment.amount} - ${new Date(payment.createdAt).toLocaleDateString()}`}
                  />
                  <Chip 
                    label={payment.status} 
                    color={payment.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {tabValue === 1 && user.userType === 'landlord' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">My Properties ({listings.length})</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-listing')}
            >
              Add New Property
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid item xs={12} md={6} lg={4} key={listing._id}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {listing.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {listing.location.town}, {listing.location.county}
                      </Typography>
                    </Box>
                    
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
                      <Badge badgeContent={listing.views} color="secondary">
                        <Visibility fontSize="small" />
                      </Badge>
                      <Typography variant="body2">
                        views this month
                      </Typography>
                    </Box>

                    {listing.paymentStatus !== 'paid' && (
                      <Button
                        variant="contained"
                        startIcon={<Payment />}
                        onClick={() => handlePayment(listing._id, 500, `Listing fee for ${listing.title}`)}
                        fullWidth
                        sx={{ mt: 2 }}
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

      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Payment History ({payments.length})
          </Typography>
          <Grid container spacing={3}>
            {payments.map((payment) => (
              <Grid item xs={12} md={6} key={payment._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {payment.description}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      KES {payment.amount.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={payment.status} 
                        color={payment.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Activity Feed
          </Typography>
          <Paper sx={{ p: 3 }}>
            <List>
              <ListItem>
                <ListItemIcon><Home color="primary" /></ListItemIcon>
                <ListItemText
                  primary="New property listing created"
                  secondary="2 hours ago"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon><Payment color="success" /></ListItemIcon>
                <ListItemText
                  primary="Payment received - KES 500"
                  secondary="1 day ago"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon><Visibility color="info" /></ListItemIcon>
                <ListItemText
                  primary="Your property got 15 new views"
                  secondary="2 days ago"
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;