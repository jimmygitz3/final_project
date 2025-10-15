import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent
} from '@mui/material';
import { Add, Delete, LocationOn, School } from '@mui/icons-material';
import { kenyanCounties, getTownsForCounty, kenyanUniversities } from '../data/kenyanLocations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    county: '',
    town: '',
    address: '',
    propertyType: '',
    amenities: [],
    nearbyUniversities: []
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newUniversity, setNewUniversity] = useState({ name: '', distance: '' });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdListing, setCreatedListing] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  const addUniversity = () => {
    if (newUniversity.name.trim() && newUniversity.distance.trim()) {
      setFormData({
        ...formData,
        nearbyUniversities: [...formData.nearbyUniversities, newUniversity]
      });
      setNewUniversity({ name: '', distance: '' });
    }
  };

  const removeUniversity = (index) => {
    setFormData({
      ...formData,
      nearbyUniversities: formData.nearbyUniversities.filter((_, i) => i !== index)
    });
  };

  const handlePayment = async () => {
    // Check if already paid
    if (createdListing?.paymentStatus === 'paid') {
      alert('This listing has already been paid for and is active!');
      navigate('/dashboard');
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payments/mpesa/initiate', {
        amount: 500,
        phoneNumber: user.phone,
        paymentType: 'listing_fee',
        listingId: createdListing._id,
        description: `Listing activation fee for ${createdListing.title}`
      });

      // Mock successful payment
      setTimeout(async () => {
        await axios.post('http://localhost:5000/api/payments/mpesa/callback', {
          transactionId: response.data.transactionId || `TXN${Date.now()}`,
          receiptNumber: `MP${Date.now()}`,
          status: 'completed'
        });
        
        alert('Payment successful! Your listing is now active.');
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      setError('Payment failed: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'amenities' || key === 'nearbyUniversities') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post('http://localhost:5000/api/listings', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setCreatedListing(response.data.listing);
      setShowPayment(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (user?.userType !== 'landlord') {
    return (
      <Container>
        <Alert severity="error">
          Only landlords can create listings.
        </Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Create New Listing
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="title"
                  label="Property Title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="price"
                  label="Monthly Rent (KES)"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                  >
                    <MenuItem value="single-room">Single Room</MenuItem>
                    <MenuItem value="bedsitter">Bedsitter</MenuItem>
                    <MenuItem value="1-bedroom">1 Bedroom</MenuItem>
                    <MenuItem value="2-bedroom">2 Bedroom</MenuItem>
                    <MenuItem value="3-bedroom">3 Bedroom</MenuItem>
                    <MenuItem value="shared-room">Shared Room</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={kenyanCounties}
                  value={formData.county}
                  onChange={(_, value) => {
                    setFormData(prev => ({
                      ...prev,
                      county: value || '',
                      town: '' // Clear town when county changes
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      required
                      label="County"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <LocationOn sx={{ mr: 2, color: 'action.active' }} />
                      {option}
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={formData.county ? getTownsForCounty(formData.county) : []}
                  value={formData.town}
                  onChange={(_, value) => {
                    setFormData(prev => ({
                      ...prev,
                      town: value || ''
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      required
                      label={formData.county ? `Town in ${formData.county}` : "Town"}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <LocationOn sx={{ mr: 2, color: 'action.active' }} />
                      {option}
                    </Box>
                  )}
                  disabled={!formData.county}
                  noOptionsText={!formData.county ? "Select county first" : "No towns found"}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Amenities
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Amenity"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                  />
                  <Button variant="outlined" onClick={addAmenity}>
                    <Add />
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.amenities.map((amenity, index) => (
                    <Chip
                      key={index}
                      label={amenity}
                      onDelete={() => removeAmenity(index)}
                      deleteIcon={<Delete />}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Nearby Universities
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Autocomplete
                    options={kenyanUniversities}
                    value={newUniversity.name}
                    onChange={(_, value) => setNewUniversity({...newUniversity, name: value || ''})}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="University Name"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <School sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <School sx={{ mr: 2, color: 'action.active' }} />
                        {option}
                      </Box>
                    )}
                    freeSolo
                    sx={{ minWidth: 300 }}
                  />
                  <TextField
                    label="Distance (e.g., 2km, 15 min walk)"
                    value={newUniversity.distance}
                    onChange={(e) => setNewUniversity({...newUniversity, distance: e.target.value})}
                    sx={{ minWidth: 200 }}
                  />
                  <Button variant="outlined" onClick={addUniversity}>
                    <Add />
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.nearbyUniversities.map((uni, index) => (
                    <Chip
                      key={index}
                      label={`${uni.name} (${uni.distance})`}
                      onDelete={() => removeUniversity(index)}
                      deleteIcon={<Delete />}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Images
                </Typography>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ width: '100%' }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Payment Dialog */}
      <Dialog open={showPayment} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Activate Your Listing
          </Typography>
        </DialogTitle>
        <DialogContent>
          {createdListing && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Listing created successfully! Pay KES 500 to make it visible to tenants.
              </Alert>
              
              <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {createdListing.title}
                  </Typography>
                  <Typography variant="body2">
                    {createdListing.location?.town}, {createdListing.location?.county}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                    KES {createdListing.price?.toLocaleString()}/month
                  </Typography>
                </CardContent>
              </Card>

              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Activation Fee: KES 500
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Your listing will be active for 30 days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Visible to all tenants searching in your area
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Includes priority placement in search results
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  💡 This is a demo payment. In production, you would receive an M-Pesa prompt.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setShowPayment(false);
              navigate('/dashboard');
            }}
            disabled={paymentLoading}
          >
            Skip Payment
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePayment}
            disabled={paymentLoading}
            sx={{ px: 4 }}
          >
            {paymentLoading ? 'Processing...' : 'Pay KES 500'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateListing;