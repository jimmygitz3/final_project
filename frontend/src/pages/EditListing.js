import React, { useState, useEffect } from 'react';
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
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Add, 
  Delete, 
  LocationOn, 
  School, 
  Save, 
  Cancel,
  PhotoCamera,
  Close
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { kenyanCounties, getTownsForCounty, kenyanUniversities } from '../data/kenyanLocations';
import axios from 'axios';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [newUniversity, setNewUniversity] = useState({ name: '', distance: '' });
  const [imagePreviewDialog, setImagePreviewDialog] = useState({ open: false, image: '' });

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        const listing = response.data;

        // Check if user is the landlord
        if (listing.landlord._id !== user.id) {
          setError('You can only edit your own listings');
          return;
        }

        setFormData({
          title: listing.title,
          description: listing.description,
          price: listing.price.toString(),
          county: listing.location.county,
          town: listing.location.town,
          address: listing.location.address,
          propertyType: listing.propertyType,
          amenities: listing.amenities || [],
          nearbyUniversities: listing.nearbyUniversities || []
        });

        setExistingImages(listing.images || []);
        setLoading(false);
      } catch (error) {
        setError('Failed to load listing: ' + error.response?.data?.message);
        setLoading(false);
      }
    };

    if (user && id) {
      fetchListing();
    }
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNewImageChange = (e) => {
    const files = [...e.target.files];
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length;
    
    if (totalImages > 5) {
      setError('Maximum 5 photos allowed per listing');
      return;
    }
    
    setNewImages([...newImages, ...files]);
    setError('');
  };

  const removeExistingImage = (imageToRemove) => {
    setImagesToDelete([...imagesToDelete, imageToRemove]);
  };

  const restoreExistingImage = (imageToRestore) => {
    setImagesToDelete(imagesToDelete.filter(img => img !== imageToRestore));
  };

  const removeNewImage = (index) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    const updatedAmenities = [...formData.amenities];
    updatedAmenities.splice(index, 1);
    setFormData({
      ...formData,
      amenities: updatedAmenities
    });
  };

  const addUniversity = () => {
    if (newUniversity.name.trim() && newUniversity.distance.trim()) {
      const universityExists = formData.nearbyUniversities.some(
        uni => uni.name.toLowerCase() === newUniversity.name.toLowerCase()
      );
      
      if (!universityExists) {
        setFormData({
          ...formData,
          nearbyUniversities: [...formData.nearbyUniversities, { ...newUniversity }]
        });
        setNewUniversity({ name: '', distance: '' });
      }
    }
  };

  const removeUniversity = (index) => {
    const updatedUniversities = [...formData.nearbyUniversities];
    updatedUniversities.splice(index, 1);
    setFormData({
      ...formData,
      nearbyUniversities: updatedUniversities
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'amenities' || key === 'nearbyUniversities') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add images to keep (existing images not marked for deletion)
      const imagesToKeep = existingImages.filter(img => !imagesToDelete.includes(img));
      formDataToSend.append('keepExistingImages', JSON.stringify(imagesToKeep));

      // Add new images
      newImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await axios.put(`http://localhost:5000/api/listings/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Listing updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      setError('Failed to update listing: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const getTotalImageCount = () => {
    return existingImages.length - imagesToDelete.length + newImages.length;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user || user.userType !== 'landlord') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Only landlords can edit listings.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Edit Property Listing
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

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

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={kenyanCounties}
                value={formData.county}
                onChange={(_, value) => setFormData({...formData, county: value || '', town: ''})}
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
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={formData.county ? getTownsForCounty(formData.county) : []}
                value={formData.town}
                onChange={(_, value) => setFormData({...formData, town: value || ''})}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    required 
                    label="Town/City"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                )}
                disabled={!formData.county}
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

            {/* Images */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  Property Photos
                </Typography>
                <Chip 
                  label={`${getTotalImageCount()}/5 photos`}
                  color={getTotalImageCount() === 5 ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Photos
                  </Typography>
                  <Grid container spacing={2}>
                    {existingImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Card sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="120"
                            image={`http://localhost:5000/uploads/${image}`}
                            alt={`Property ${index + 1}`}
                            sx={{ 
                              cursor: 'pointer',
                              opacity: imagesToDelete.includes(image) ? 0.5 : 1,
                              objectFit: 'cover',
                              width: '100%',
                              height: '120px'
                            }}
                            onClick={() => setImagePreviewDialog({ open: true, image })}
                          />
                          <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                            {imagesToDelete.includes(image) ? (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => restoreExistingImage(image)}
                                sx={{ minWidth: 'auto', p: 0.5 }}
                              >
                                Restore
                              </Button>
                            ) : (
                              <IconButton
                                size="small"
                                sx={{ bgcolor: 'error.main', color: 'white' }}
                                onClick={() => removeExistingImage(image)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {imagesToDelete.includes(image) && (
                            <Box sx={{ 
                              position: 'absolute', 
                              top: '50%', 
                              left: '50%', 
                              transform: 'translate(-50%, -50%)',
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1
                            }}>
                              Will be deleted
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    New Photos to Add
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {newImages.map((image, index) => (
                      <Chip
                        key={index}
                        label={`New: ${image.name.substring(0, 20)}...`}
                        onDelete={() => removeNewImage(index)}
                        deleteIcon={<Delete />}
                        variant="outlined"
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Add New Images */}
              {getTotalImageCount() < 5 && (
                <Box>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageChange}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      sx={{ mb: 2 }}
                    >
                      Add More Photos ({5 - getTotalImageCount()} remaining)
                    </Button>
                  </label>
                </Box>
              )}
            </Grid>

            {/* Amenities */}
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
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

            {/* Nearby Universities */}
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

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  disabled={saving}
                  sx={{ px: 4 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreviewDialog.open}
        onClose={() => setImagePreviewDialog({ open: false, image: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Image Preview
          <IconButton onClick={() => setImagePreviewDialog({ open: false, image: '' })}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <img
            src={`http://localhost:5000/uploads/${imagePreviewDialog.image}`}
            alt="Preview"
            style={{ 
              width: '100%', 
              height: 'auto',
              maxHeight: '70vh',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default EditListing;