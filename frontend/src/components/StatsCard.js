import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary', 
  trend = null,
  progress = null 
}) => {
  return (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color === 'primary' ? '#2E7D32' : color === 'secondary' ? '#FF6F00' : '#1976d2'} 0%, ${color === 'primary' ? '#4CAF50' : color === 'secondary' ? '#FFA726' : '#42A5F5'} 100%)`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {trend > 0 ? (
              <TrendingUp sx={{ mr: 1, fontSize: 20 }} />
            ) : (
              <TrendingDown sx={{ mr: 1, fontSize: 20 }} />
            )}
            <Typography variant="body2">
              {Math.abs(trend)}% from last month
            </Typography>
          </Box>
        )}

        {progress !== null && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'rgba(255,255,255,0.8)'
                }
              }} 
            />
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              {progress}% of target
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;