import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import { Home, AccountCircle, Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ py: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            mr: 4
          }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0066CC 0%, #3385D6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <Home sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: '#0066CC',
              letterSpacing: '-0.5px'
            }}
          >
            Kejah
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { backgroundColor: 'rgba(0, 102, 204, 0.08)' }
              }}
            >
              Dashboard
            </Button>
            
            {user.userType === 'tenant' && (
              <Button
                variant="text"
                onClick={() => navigate('/favorites')}
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'rgba(0, 102, 204, 0.08)' }
                }}
                startIcon={
                  <Badge badgeContent={JSON.parse(localStorage.getItem('favorites') || '[]').length} color="secondary">
                    <Favorite />
                  </Badge>
                }
              >
                Favorites
              </Button>
            )}
            
            {user.userType === 'landlord' && (
              <Button 
                variant="contained"
                onClick={() => navigate('/create-listing')}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
              >
                List Property
              </Button>
            )}
            
            <IconButton
              onClick={handleMenu}
              sx={{ 
                ml: 1,
                border: '2px solid #E5E7EB',
                '&:hover': { borderColor: '#0066CC' }
              }}
            >
              <AccountCircle sx={{ color: 'text.primary' }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                {user.name} ({user.userType})
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { backgroundColor: 'rgba(0, 102, 204, 0.08)' }
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;