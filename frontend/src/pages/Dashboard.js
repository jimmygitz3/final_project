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
  Edit,
  Star,
  LocationOn
} from '@mui/icons-material';
import StatsCard from '../components/StatsCard';
import MockPayment from '../components/MockPayment';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEarnings: 0,
    activeListings: 0,
    avgRating: 4.2
  });
  const [mockPayment, setMockPayment] = useState({
    open: false,
    amount: 0,
    description: '',
    paymentType: '',
    listingId: null
  });

  const fetchData = React.useCallback(async () => {
    try {
      if (user?.userType === 'landlord') {
        const listingsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/listings/my/listings`);
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
            const reviewResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews/listing/${listing._id}/summary`);
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
      
      const paymentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/payments/history`);
      setPayments(paymentsResponse.data);
      
      // Fetch activity feed
      const activityResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/activity/feed`);
      setActivities(activityResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);



  const handlePayment = (listingId, amount, description, currentPaymentStatus) => {
    // Check if already paid
    if (currentPaymentStatus === 'paid') {
      alert('This listing has already been paid for and is active!');
      return;
    }

    // Open Mock payment dialog
    setMockPayment({
      open: true,
      amount,
      description,
      paymentType: 'listing_fee',
      listingId
    });
  };

  const handleMockPaymentSuccess = (paymentData) => {
    alert('Payment successful! Your listing is now active.');
    setMockPayment({ open: false, amount: 0, description: '', paymentType: '', listingId: null });
    fetchData(); // Refresh data
  };

  const handleMockPaymentClose = () => {
    setMockPayment({ open: false, amount: 0, description: '', paymentType: '', listingId: null });
  };

  const handleMarkUnavailable = async (listingId, listingTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark "${listingTitle}" as unavailable?\n\n` +
      `This will:\n` +
      `• Hide the listing from tenants immediately\n` +
      `• Automatically delete the listing in 24 hours\n` +
      `• You can restore it within 24 hours if needed`
    );

    if (!confirmed) return;

    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/api/listings/${listingId}/mark-unavailable`);
      
      alert(`✅ ${response.data.message}`);
      fetchData(); // Refresh data
    } catch (error) {
      alert('Failed to mark listing as unavailable: ' + error.response?.data?.message);
    }
  };

  const handleRestoreAvailability = async (listingId, listingTitle) => {
    const confirmed = window.confirm(
      `Restore availability for "${listingTitle}"?\n\n` +
      `This will make the listing visible to tenants again.`
    );

    if (!confirmed) return;

    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/api/listings/${listingId}/restore-availability`);
      
      alert(`✅ ${response.data.message}`);
      fetchData(); // Refresh data
    } catch (error) {
      alert('Failed to restore listing availability: ' + error.response?.data?.message);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 4, background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)', color: 'white' }}>
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
      


      {user.userType === 'landlord' && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Notifications />}>
          Pay KES 500 per listing to activate and make it visible to tenants. Each listing is active for 30 days.
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
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Total Views"
                  value={stats.totalViews.toLocaleString()}
                  subtitle="All time"
                  icon={<Visibility />}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Earnings"
                  value={`KES ${stats.totalEarnings.toLocaleString()}`}
                  subtitle="Total earned"
                  icon={<AccountBalance />}
                  color="success"
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
                      onClick={() => setTabValue(3)}
                      sx={{ py: 2 }}
                    >
                      Activity
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
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.icon === 'home' && <Home color={activity.color} />}
                        {activity.icon === 'payment' && <Payment color={activity.color} />}
                        {activity.icon === 'visibility' && <Visibility color={activity.color} />}
                        {activity.icon === 'star' && <Star color={activity.color} />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={`${activity.description} - ${new Date(activity.date).toLocaleDateString()}`}
                      />
                    </ListItem>
                    {index < activities.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No recent activity"
                    secondary="Start by creating your first property listing or making a payment"
                  />
                </ListItem>
              )}
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
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}>
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
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={listing.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'} 
                        color={listing.paymentStatus === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                      <Chip 
                        label={listing.isActive ? 'Active' : 'Inactive'} 
                        color={listing.isActive ? 'success' : 'default'}
                        size="small"
                      />
                      {listing.availabilityStatus && (
                        <Chip 
                          label={
                            listing.availabilityStatus === 'available' ? 'Available' :
                            listing.availabilityStatus === 'not_available' ? 'Not Available' :
                            'Pending Deletion'
                          }
                          color={
                            listing.availabilityStatus === 'available' ? 'success' :
                            listing.availabilityStatus === 'not_available' ? 'error' :
                            'warning'
                          }
                          size="small"
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Badge badgeContent={listing.views} color="secondary">
                        <Visibility fontSize="small" />
                      </Badge>
                      <Typography variant="body2">
                        views this month
                      </Typography>
                    </Box>

                    {listing.paymentStatus !== 'paid' ? (
                      <Button
                        variant="contained"
                        startIcon={<Payment />}
                        onClick={() => handlePayment(listing._id, 500, `Listing fee for ${listing.title}`, listing.paymentStatus)}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Pay KES 500 to Activate
                      </Button>
                    ) : (
                      <Box sx={{ mt: 2 }}>
                        {listing.availabilityStatus === 'not_available' ? (
                          <Box>
                            <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, mb: 2 }}>
                              <Typography variant="body2" color="error.dark" sx={{ textAlign: 'center', fontWeight: 600 }}>
                                🚫 Marked as Unavailable
                              </Typography>
                              <Typography variant="caption" color="error.dark" sx={{ textAlign: 'center', display: 'block' }}>
                                Will be deleted: {listing.scheduledDeletionAt ? new Date(listing.scheduledDeletionAt).toLocaleString() : 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Edit />}
                                onClick={() => navigate(`/edit-listing/${listing._id}`)}
                                size="small"
                                sx={{ flex: 1 }}
                              >
                                Edit
                              </Button>
                            </Box>
                            <Button
                              variant="outlined"
                              color="success"
                              onClick={() => handleRestoreAvailability(listing._id, listing.title)}
                              fullWidth
                              size="small"
                            >
                              Restore Availability
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, mb: 2 }}>
                              <Typography variant="body2" color="success.dark" sx={{ textAlign: 'center', fontWeight: 600 }}>
                                ✅ Listing Active - Payment Complete
                              </Typography>
                              <Typography variant="caption" color="success.dark" sx={{ textAlign: 'center', display: 'block' }}>
                                Expires: {listing.paymentExpiry ? new Date(listing.paymentExpiry).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Edit />}
                                onClick={() => navigate(`/edit-listing/${listing._id}`)}
                                size="small"
                                sx={{ flex: 1 }}
                              >
                                Edit
                              </Button>
                            </Box>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleMarkUnavailable(listing._id, listing.title)}
                              fullWidth
                              size="small"
                            >
                              Mark as Unavailable
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {/* Spacer to push content to consistent heights */}
                    <Box sx={{ flexGrow: 1 }} />
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
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.icon === 'home' && <Home color={activity.color} />}
                        {activity.icon === 'payment' && <Payment color={activity.color} />}
                        {activity.icon === 'visibility' && <Visibility color={activity.color} />}
                        {activity.icon === 'star' && <Star color={activity.color} />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={`${activity.description} - ${new Date(activity.date).toLocaleDateString()}`}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(activity.date).toLocaleTimeString()}
                      </Typography>
                    </ListItem>
                    {index < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No activity yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your activity will appear here as you use the platform
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Box>
      )}


      {/* Mock Payment Dialog */}
      <MockPayment
        open={mockPayment.open}
        onClose={handleMockPaymentClose}
        amount={mockPayment.amount}
        description={mockPayment.description}
        phoneNumber={user?.phone || ''}
        paymentType={mockPayment.paymentType}
        listingId={mockPayment.listingId}
        onSuccess={handleMockPaymentSuccess}
      />
    </Container>
  );
};

export default Dashboard;