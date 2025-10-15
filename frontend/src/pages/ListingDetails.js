import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
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

  const fetchListing = React.useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
      setListing(response.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    try {
      await axios.post('http://localhost:5000/api/payments/mpesa/initiate', {
        amount: 100,
        phoneNumber: phoneNumber || user.phone,
        paymentType: 'connection_fee',
        listingId: listing._id,
        description: `Connection fee for ${listing.title}`
      });
      
      alert('Payment initiated! Please complete on your phone.');
      setContactDialog(false);
    } catch (error) {
      alert('Payment failed: ' + error.response?.data?.message);
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

            <Button
              fullWidth
              variant="contained"
              onClick={handleContactLandlord}
              sx={{ mb: 2 }}
            >
              Contact Landlord
            </Button>

            <Typography variant="body2" color="text.secondary">
              A connection fee of KES 100 is required to access landlord contact details.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <ReviewSection listingId={listing._id} />

      {/* Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)}>
        <DialogTitle>Contact Landlord</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            To contact the landlord, you need to pay a connection fee of KES 100.
            This helps maintain the quality of our platform.
          </Typography>
          <TextField
            fullWidth
            label="Phone Number for Payment"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={user?.phone}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialog(false)}>Cancel</Button>
          <Button onClick={handlePayConnectionFee} variant="contained">
            Pay KES 100
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListingDetails;