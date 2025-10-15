import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { LocationOn, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    county: '',
    town: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    university: ''
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await axios.get(`http://localhost:5000/api/listings?${params}`);
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    fetchListings();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Find Your Perfect Student Accommodation
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Discover affordable housing near universities across Kenya
      </Typography>

      {/* Search Filters */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="County"
              value={filters.county}
              onChange={(e) => handleFilterChange('county', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Town"
              value={filters.town}
              onChange={(e) => handleFilterChange('town', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="single-room">Single Room</MenuItem>
                <MenuItem value="bedsitter">Bedsitter</MenuItem>
                <MenuItem value="1-bedroom">1 Bedroom</MenuItem>
                <MenuItem value="2-bedroom">2 Bedroom</MenuItem>
                <MenuItem value="3-bedroom">3 Bedroom</MenuItem>
                <MenuItem value="shared-room">Shared Room</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Min Price (KES)"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Max Price (KES)"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Listings Grid */}
      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={listing.images[0] ? 
                  `http://localhost:5000/uploads/${listing.images[0]}` : 
                  '/placeholder-house.jpg'
                }
                alt={listing.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {listing.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {listing.description.substring(0, 100)}...
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {listing.location.town}, {listing.location.county}
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  KES {listing.price.toLocaleString()}/month
                </Typography>
                <Chip 
                  label={listing.propertyType.replace('-', ' ')} 
                  size="small" 
                  sx={{ mb: 1 }}
                />
                {listing.nearbyUniversities.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <School fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      Near {listing.nearbyUniversities[0].name}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => navigate(`/listing/${listing._id}`)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {listings.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No listings found. Try adjusting your search filters.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Home;