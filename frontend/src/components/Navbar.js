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
  Badge,
  Tooltip
} from '@mui/material';
import { Home, AccountCircle, Favorite, Dashboard } from '@mui/icons-material';
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
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          <Home />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Kejah
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Dashboard">
              <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
                <Dashboard />
              </IconButton>
            </Tooltip>
            
            {user.userType === 'tenant' && (
              <Tooltip title="My Favorites">
                <IconButton color="inherit" onClick={() => navigate('/favorites')}>
                  <Badge badgeContent={JSON.parse(localStorage.getItem('favorites') || '[]').length} color="error">
                    <Favorite />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            {user.userType === 'landlord' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/create-listing')}
                sx={{ textTransform: 'none' }}
              >
                + Add Property
              </Button>
            )}
            
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
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
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;