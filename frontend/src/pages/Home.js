import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Chip,
  Skeleton,
  Fade,
  Card,
  CardContent,
  Button
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
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/listings?${params}`);
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews/stats`);
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
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #0066CC 0%, #3385D6 50%, #FF6B35 100%)',
          color: 'white',
          py: 8,
          mb: 0
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Find Your Perfect Student Home
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Discover thousands of student-friendly apartments and houses near universities across Kenya
              </Typography>

              {/* Search Filters - Inline Hero Search */}
              <Box 
                sx={{ 
                  py: 4, 
                  px: 3,
                  maxWidth: 850, 
                  mx: 'auto',
                  mt: 4,
                  width: '80%'
                }}
              >
                <SearchFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onSearch={handleSearch}
                  onClearFilters={handleClearFilters}
                  compact={true}
                />
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>

        {/* Quick Stats */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.totalProperties}+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Student Properties
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.totalUniversities}+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Universities Covered
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.happyStudents}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {stats.happyStudents === 1 ? 'Happy Student' : 'Happy Students'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Popular Universities */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Popular University Areas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {popularUniversities.map((uni) => (
              <Chip
                key={uni}
                label={uni}
                onClick={() => handleFilterChange('university', uni)}
                variant={filters.university === uni ? 'filled' : 'outlined'}
                color="primary"
                size="medium"
                sx={{ 
                  cursor: 'pointer',
                  py: 2,
                  px: 1,
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: filters.university === uni ? 'primary.dark' : 'primary.light',
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Results Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          py: 3,
          borderBottom: '2px solid #E5E7EB'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {loading ? 'Loading Properties...' : `${listings.length} Student Properties Available`}
          </Typography>
          {listings.length > 0 && (
            <Chip 
              icon={<TrendingUp />} 
              label="Recently Updated" 
              color="secondary" 
              variant="filled"
              sx={{ px: 2, py: 1 }}
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
                <Skeleton variant="rectangular" height={220} />
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

        {listings.length === 0 && !loading && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No properties found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search criteria or browse all available properties
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleClearFilters}
              sx={{ px: 4, py: 1.5 }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;