import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Chip,
  Skeleton,
  Fade,
  Card,
  CardContent
} from '@mui/material';
import { 
  TrendingUp
} from '@mui/icons-material';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';

import axios from 'axios';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy] = useState('newest');
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUniversities: 50,
    happyStudents: 0
  });
  const [filters, setFilters] = useState({
    county: '',
    town: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    university: ''
  });

  const popularUniversities = [
    'University of Nairobi', 'Kenyatta University', 'JKUAT', 
    'Strathmore University', 'Moi University', 'Egerton University'
  ];

  const fetchListings = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await axios.get(`http://localhost:5000/api/listings?${params}`);
      let sortedListings = response.data;
      
      // Sort listings
      switch (sortBy) {
        case 'price-low':
          sortedListings = sortedListings.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          sortedListings = sortedListings.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          sortedListings = sortedListings.sort((a, b) => b.views - a.views);
          break;
        default:
          sortedListings = sortedListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setListings(sortedListings);
      
      // Update total properties count
      setStats(prev => ({ ...prev, totalProperties: sortedListings.length }));
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  const fetchStats = React.useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reviews/stats');
      setStats(prev => ({
        ...prev,
        happyStudents: response.data.happyStudents
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, [fetchListings, fetchStats]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    fetchListings();
  };

  const handleClearFilters = () => {
    setFilters({
      county: '',
      town: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      university: ''
    });
  };

  const toggleFavorite = (listingId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(listingId)) {
      newFavorites.delete(listingId);
    } else {
      newFavorites.add(listingId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  const shareProperty = (listing) => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this property: ${listing.title} - KES ${listing.price.toLocaleString()}/month`,
        url: window.location.origin + `/listing/${listing._id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/listing/${listing._id}`);
      alert('Link copied to clipboard!');
    }
  };



  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Fade in timeout={1000}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2E7D32 30%, #FF6F00 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Find Your Perfect Student Home
          </Typography>
          
          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
            🏠 Discover affordable housing near universities across Kenya 🎓
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
            <Grid item>
              <Paper sx={{ p: 3, textAlign: 'center', minWidth: 140, borderRadius: 3 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {stats.totalProperties}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Properties</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 3, textAlign: 'center', minWidth: 140, borderRadius: 3 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {stats.totalUniversities}+
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Universities</Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ p: 3, textAlign: 'center', minWidth: 140, borderRadius: 3 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {stats.happyStudents}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {stats.happyStudents === 1 ? 'Happy Student' : 'Happy Students'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Popular Universities */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Popular Universities</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {popularUniversities.map((uni) => (
                <Chip
                  key={uni}
                  label={uni}
                  onClick={() => handleFilterChange('university', uni)}
                  variant={filters.university === uni ? 'filled' : 'outlined'}
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Search Filters */}
      <SearchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        showAdvanced={true}
      />

      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {loading ? 'Loading...' : `${listings.length} Properties Found`}
        </Typography>
        {listings.length > 0 && (
          <Chip 
            icon={<TrendingUp />} 
            label="Updated Today" 
            color="success" 
            variant="outlined" 
          />
        )}
      </Box>

      {/* Listings Grid */}
      <Grid container spacing={3}>
        {loading ? (
          // Loading skeletons
          Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          listings.map((listing, index) => (
            <Grid item xs={12} sm={6} md={4} key={listing._id}>
              <PropertyCard
                listing={listing}
                index={index}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onShare={shareProperty}
              />
            </Grid>
          ))
        )}
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