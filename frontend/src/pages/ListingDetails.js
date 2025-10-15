import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Box,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { LocationOn, School } from '@mui/icons-material';
import ReviewSection from '../components/ReviewSection';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ListingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactDialog, setContactDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);

  const fetchListing = React.useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
      setListing(response.data);
      
      // Check if user already has access to contact details
      if (user) {
        try {
          const connectionResponse = await axios.get(`http://localhost:5000/api/connections/check/${id}`);
          if (connectionResponse.data.hasAccess) {
            setContactUnlocked(true);
          }
        } catch (error) {
          // No existing connection, user needs to pay
          console.log('No existing connection found');
        }
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleContactLandlord = () => {
    if (!user) {
      alert('Please login to contact landlord');
      return;
    }
    
    if (user.userType === 'tenant') {
      setContactDialog(true);
    } else {
      alert('Only tenants can contact landlords');
    }
  };

  const handlePayConnectionFee = async () => {
    setPaymentLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payments/mpesa/initiate', {
        amount: 100,
        phoneNumber: phoneNumber || user.phone,
        paymentType: 'connection_fee',
        listingId: listing._id,
        description: `Connection fee for ${listing.title}`
      });
      
      // Mock successful payment
      setTimeout(async () => {
        await axios.post('http://localhost:5000/api/payments/mpesa/callback', {
          transactionId: response.data.transactionId,
          receiptNumber: `MP${Date.now()}`,
          status: 'completed'
        });
        
        setContactUnlocked(true);
        setContactDialog(false); // Close the payment dialog
        setPaymentLoading(false);
        
        // Show success message
        alert('Payment successful! Contact details are now unlocked.');
      }, 2000);

    } catch (error) {
      alert('Payment failed: ' + error.response?.data?.message);
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (!listing) {
    return (
      <Container>
        <Alert severity="error">Listing not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {listing.images.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="400"
                image={`http://localhost:5000/uploads/${listing.images[0]}`}
                alt={listing.title}
              />
            </Card>
          )}

          <Typography variant="h4" gutterBottom>
            {listing.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn color="action" sx={{ mr: 1 }} />
            <Typography variant="h6">
              {listing.location.address}, {listing.location.town}, {listing.location.county}
            </Typography>
          </Box>

          <Typography variant="h5" color="primary" gutterBottom>
            KES {listing.price.toLocaleString()}/month
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Chip 
              label={listing.propertyType.replace('-', ' ')} 
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip 
              label={`${listing.views} views`} 
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          </Box>

          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {listing.description}
          </Typography>

          {listing.amenities.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {listing.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {listing.nearbyUniversities.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Nearby Universities
              </Typography>
              {listing.nearbyUniversities.map((uni, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <School color="action" sx={{ mr: 1 }} />
                  <Typography>
                    {uni.name} - {uni.distance}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Landlord
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                {listing.landlord.name}
              </Typography>
            </Box>

            {contactUnlocked ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Contact details unlocked!
                </Alert>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Phone:
                  </Typography>
                  <Typography variant="h6">
                    {listing.landlord.phone}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body1">
                    {listing.landlord.email}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  href={`tel:${listing.landlord.phone}`}
                  sx={{ mb: 1 }}
                >
                  Call Now
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  href={`mailto:${listing.landlord.email}`}
                >
                  Send Email
                </Button>
              </Box>
            ) : (
              <Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleContactLandlord}
                  sx={{ mb: 2 }}
                >
                  Unlock Contact Details
                </Button>

                <Typography variant="body2" color="text.secondary">
                  Pay KES 100 to access landlord contact details and connect directly.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <ReviewSection listingId={listing._id} />

      {/* Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Unlock Contact Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Pay KES 100 to unlock landlord contact details and connect directly.
          </Alert>
          
          <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {listing?.title}
              </Typography>
              <Typography variant="body2">
                Landlord: {listing?.landlord.name}
              </Typography>
            </CardContent>
          </Card>

          <TextField
            fullWidth
            label="M-Pesa Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={user?.phone || "254XXXXXXXXX"}
            sx={{ mb: 3 }}
            helperText="Enter your M-Pesa registered phone number"
          />

          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              What you'll get:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Landlord's phone number
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Landlord's email address
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Direct contact buttons
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              💡 This is a demo payment. In production, you would receive an M-Pesa prompt.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setContactDialog(false)}
            disabled={paymentLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayConnectionFee} 
            variant="contained"
            disabled={paymentLoading || !phoneNumber}
            sx={{ px: 4 }}
          >
            {paymentLoading ? 'Processing...' : 'Pay KES 100'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListingDetails;