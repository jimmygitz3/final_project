import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Button,
  TextField,
  Card,
  CardContent,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  LinearProgress,
  Grid,
  IconButton
} from '@mui/material';
import {
  Star,
  ThumbUp,
  Add,
  Verified
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ReviewSection = ({ listingId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchReviewSummary();
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/listing/${listingId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchReviewSummary = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/listing/${listingId}/summary`);
      setReviewSummary(response.data);
    } catch (error) {
      console.error('Error fetching review summary:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      setError('Please login to leave a review');
      return;
    }

    if (newReview.rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (newReview.comment.trim().length < 10) {
      setError('Please write at least 10 characters in your review');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/reviews', {
        listingId,
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });

      setNewReview({ rating: 0, comment: '' });
      setShowAddReview(false);
      fetchReviews();
      fetchReviewSummary();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await axios.patch(`http://localhost:5000/api/reviews/${reviewId}/helpful`);
      fetchReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const getRatingPercentage = (rating) => {
    return reviewSummary.totalReviews > 0 
      ? (reviewSummary.ratingDistribution[rating] / reviewSummary.totalReviews) * 100 
      : 0;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Reviews & Ratings
      </Typography>

      {/* Rating Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="primary" sx={{ fontWeight: 'bold' }}>
                  {reviewSummary.averageRating.toFixed(1)}
                </Typography>
                <Rating 
                  value={reviewSummary.averageRating} 
                  precision={0.1} 
                  readOnly 
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  Based on {reviewSummary.totalReviews} reviews
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 20 }}>
                      {rating}
                    </Typography>
                    <Star fontSize="small" sx={{ mx: 1, color: 'gold' }} />
                    <LinearProgress
                      variant="determinate"
                      value={getRatingPercentage(rating)}
                      sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 30 }}>
                      {reviewSummary.ratingDistribution[rating]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Review Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddReview(true)}
          disabled={!user}
        >
          {user ? 'Write a Review' : 'Login to Write a Review'}
        </Button>
      </Box>

      {/* Reviews List */}
      <Box>
        {reviews.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No reviews yet. Be the first to review this property!
          </Typography>
        ) : (
          reviews.map((review) => (
            <Card key={review._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {review.user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {review.user.name}
                      </Typography>
                      {review.isVerified && (
                        <Chip
                          icon={<Verified />}
                          label="Verified"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {review.comment}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleHelpful(review._id)}
                        disabled={!user}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        Helpful ({review.helpfulVotes})
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Add Review Dialog */}
      <Dialog open={showAddReview} onClose={() => setShowAddReview(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rating *
            </Typography>
            <Rating
              value={newReview.rating}
              onChange={(_, value) => setNewReview(prev => ({ ...prev, rating: value || 0 }))}
              size="large"
            />
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review *"
            placeholder="Share your experience with this property..."
            value={newReview.comment}
            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            helperText={`${newReview.comment.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddReview(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={loading || newReview.rating === 0 || newReview.comment.trim().length < 10}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewSection;