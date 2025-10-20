import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Paper,
  Chip
} from '@mui/material';
import { Favorite, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/PropertyCard';
import axios from 'axios';

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(new Set());
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadFavorites();
  }, [user, navigate]);

  const loadFavorites = async () => {
    try {
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavorites(new Set(favoriteIds));
        
        // Fetch favorite listings
        if (favoriteIds.length > 0) {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/listings`);
          const allListings = response.data;
          const favListings = allListings.filter(listing => 
            favoriteIds.includes(listing._id)
          );
          setFavoriteListings(favListings);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (listingId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(listingId)) {
      newFavorites.delete(listingId);
      setFavoriteListings(prev => prev.filter(listing => listing._id !== listingId));
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading favorites...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Favorite color="error" />
          My Favorite Properties
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Properties you've saved for later
        </Typography>
      </Box>

      {/* Stats */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {favoriteListings.length}
              </Typography>
              <Typography variant="h6">Saved Properties</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {favoriteListings.length > 0 ? 
                  `KES ${Math.min(...favoriteListings.map(l => l.price)).toLocaleString()}` : 
                  'N/A'
                }
              </Typography>
              <Typography variant="h6">Lowest Price</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {favoriteListings.length > 0 ? 
                  `KES ${Math.max(...favoriteListings.map(l => l.price)).toLocaleString()}` : 
                  'N/A'
                }
              </Typography>
              <Typography variant="h6">Highest Price</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Favorites Grid */}
      {favoriteListings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Home sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No favorites yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start browsing properties and save your favorites by clicking the heart icon
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
          >
            Browse Properties
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Saved Properties ({favoriteListings.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[...new Set(favoriteListings.map(l => l.location.county))].map(county => (
                <Chip key={county} label={county} variant="outlined" />
              ))}
            </Box>
          </Box>

          <Grid container spacing={3}>
            {favoriteListings.map((listing, index) => (
              <Grid item xs={12} sm={6} md={4} key={listing._id}>
                <PropertyCard
                  listing={listing}
                  index={index}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onShare={shareProperty}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Favorites;