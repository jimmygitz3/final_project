import React, { useState, useEffect } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Rating,
  Badge,
  Tooltip,
  Fab,
  Fade,
  IconButton,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  LocationOn,
  School,
  Star,
  Wifi,
  LocalParking,
  Security,
  Pool,
  PhotoLibrary,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PropertyCard = ({ listing, index, favorites, onToggleFavorite, onShare }) => {
  const navigate = useNavigate();
  const [imageDialog, setImageDialog] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0
  });

  const amenityIcons = {
    'WiFi': <Wifi />,
    'Parking': <LocalParking />,
    'Security': <Security />,
    'Swimming Pool': <Pool />
  };

  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews/listing/${listing._id}/summary`);
        setReviewSummary(response.data);
      } catch (error) {
        console.error('Error fetching review summary:', error);
      }
    };

    fetchReviewSummary();
  }, [listing._id]);

  return (
    <>
      <Fade in timeout={300 + index * 100}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
          }
        }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="220"
              image={listing.images[0] ? 
                `${process.env.REACT_APP_API_URL}/uploads/${listing.images[0]}` : 
                'https://via.placeholder.com/400x220?text=No+Image'
              }
              alt={listing.title}
              sx={{ 
                objectFit: 'cover',
                cursor: 'pointer', 
                borderRadius: '16px 16px 0 0',
                width: '100%',
                height: '220px'
              }}
              onClick={() => navigate(`/listing/${listing._id}`)}
            />
            
            {/* Image count indicator */}
            {listing.images.length > 1 && (
              <Chip
                icon={<PhotoLibrary />}
                label={listing.images.length}
                size="small"
                sx={{ 
                  position: 'absolute', 
                  bottom: 8, 
                  left: 8,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageDialog(true);
                }}
              />
            )}
            
            {/* Action buttons */}
            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
              <Tooltip title="Add to favorites">
                <Fab
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(listing._id);
                  }}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.95)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                  }}
                >
                  {favorites.has(listing._id) ? 
                    <Favorite color="error" /> : 
                    <FavoriteBorder />
                  }
                </Fab>
              </Tooltip>
              <Tooltip title="Share property">
                <Fab
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(listing);
                  }}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.95)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                  }}
                >
                  <Share />
                </Fab>
              </Tooltip>
            </Box>

            {/* Status badges */}
            <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {listing.views > 50 && (
                <Chip
                  label="🔥 Popular"
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              {new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                <Chip
                  label="✨ New"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Box>

          <CardContent sx={{ 
            flexGrow: 1, 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 280 // Ensure minimum content height
          }}>
            <Typography 
              gutterBottom 
              variant="h6" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '3.2em', // Ensure consistent title height
                lineHeight: 1.6
              }}
              onClick={() => navigate(`/listing/${listing._id}`)}
            >
              {listing.title}
            </Typography>
            
            {/* Rating and reviews */}
            {reviewSummary.totalReviews > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={reviewSummary.averageRating} precision={0.1} size="small" readOnly />
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={0} size="small" readOnly />
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  (No reviews yet)
                </Typography>
              </Box>
            )}

            {/* Location */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
                {listing.location.town}, {listing.location.county}
              </Typography>
            </Box>

            {/* Price */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', display: 'inline' }}>
                KES {listing.price.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'inline', ml: 1 }}>
                /month
              </Typography>
            </Box>

            {/* Property type and views */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              <Chip 
                label={listing.propertyType.replace('-', ' ')} 
                size="small" 
                color="primary"
                variant="outlined"
              />
              <Badge badgeContent={listing.views} color="secondary" max={999}>
                <Chip label="👁️ Views" size="small" variant="outlined" />
              </Badge>
            </Box>

            {/* Amenities preview */}
            {listing.amenities.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Amenities:
                </Typography>
                {listing.amenities.slice(0, 3).map((amenity, idx) => (
                  <Tooltip key={idx} title={amenity}>
                    <Box sx={{ color: 'primary.main' }}>
                      {amenityIcons[amenity] || <Star fontSize="small" />}
                    </Box>
                  </Tooltip>
                ))}
                {listing.amenities.length > 3 && (
                  <Typography variant="body2" color="text.secondary">
                    +{listing.amenities.length - 3}
                  </Typography>
                )}
              </Box>
            )}

            {/* Nearby university */}
            {listing.nearbyUniversities.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <School fontSize="small" color="action" />
                <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  Near {listing.nearbyUniversities[0].name}
                </Typography>
              </Box>
            )}
            
            {/* Spacer to push actions to bottom */}
            <Box sx={{ flexGrow: 1 }} />
          </CardContent>
          
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button 
              fullWidth
              variant="contained"
              onClick={() => navigate(`/listing/${listing._id}`)}
              sx={{ 
                borderRadius: 2,
                py: 1,
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              View Details
            </Button>
          </CardActions>
        </Card>
      </Fade>

      {/* Image Gallery Dialog */}
      <Dialog
        open={imageDialog}
        onClose={() => setImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogActions sx={{ p: 1 }}>
          <IconButton onClick={() => setImageDialog(false)}>
            <Close />
          </IconButton>
        </DialogActions>
        <DialogContent sx={{ p: 2 }}>
          <ImageList cols={2} gap={8}>
            {listing.images.map((image, index) => (
              <ImageListItem key={index}>
                <img
                  src={`${process.env.REACT_APP_API_URL}/uploads/${image}`}
                  alt={`${listing.title} ${index + 1}`}
                  loading="lazy"
                  style={{ 
                    borderRadius: 8,
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyCard;