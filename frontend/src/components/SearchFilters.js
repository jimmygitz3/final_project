import React from 'react';
import {
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Chip,
  Autocomplete
} from '@mui/material';
import { FilterList, Clear, LocationOn, School, Home } from '@mui/icons-material';
import { kenyanCounties, getTownsForCounty, getAllTowns, kenyanUniversities } from '../data/kenyanLocations';

const SearchFilters = ({ 
  filters, 
  onFilterChange, 
  onSearch, 
  onClearFilters,
  showAdvanced = false,
  compact = false 
}) => {
  const propertyTypes = [
    'single-room', 'bedsitter', '1-bedroom', 
    '2-bedroom', '3-bedroom', 'shared-room'
  ];

  const allTowns = getAllTowns();
  const townsForSelectedCounty = filters.county ? getTownsForCounty(filters.county) : allTowns;

  const priceRanges = [
    { label: 'Under 10K', min: 0, max: 10000 },
    { label: '10K - 20K', min: 10000, max: 20000 },
    { label: '20K - 30K', min: 20000, max: 30000 },
    { label: '30K - 50K', min: 30000, max: 50000 },
    { label: '50K+', min: 50000, max: 1000000 }
  ];

  const handlePriceRangeSelect = (range) => {
    onFilterChange('minPrice', range.min.toString());
    onFilterChange('maxPrice', range.max === 1000000 ? '' : range.max.toString());
  };

  if (compact) {
    return (
      <Box sx={{ width: '100%' }}>
        {/* Separated Search Fields - Airbnb Style */}
        <Box 
          sx={{ 
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          {/* Location Field */}
          <Box 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '32px',
              border: '1px solid #DDDDDD',
              minWidth: '200px',
              flex: 1,
              maxWidth: '250px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-1px)'
              },
              '&:focus-within': {
                boxShadow: '0 0 0 2px rgba(0, 102, 204, 0.2)',
                borderColor: '#0066CC'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2 }}>
              <LocationOn sx={{ color: '#717171', mr: 2, fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                  WHERE
                </Typography>
                <Autocomplete
                  options={kenyanCounties}
                  value={filters.county}
                  onChange={(_, value) => {
                    onFilterChange('county', value || '');
                    if (filters.town && value && !getTownsForCounty(value).includes(filters.town)) {
                      onFilterChange('town', '');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      placeholder="Search destinations"
                      variant="standard"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        sx: {
                          fontSize: '0.9rem',
                          '& input': {
                            fontSize: '0.9rem',
                            padding: 0,
                            color: '#717171',
                            '&::placeholder': {
                              color: '#B0B0B0',
                              opacity: 1
                            }
                          }
                        }
                      }}
                      InputLabelProps={{
                        shrink: false,
                        sx: { display: 'none' }
                      }}
                    />
                  )}
                  PopperComponent={(props) => (
                    <Box {...props} sx={{ zIndex: 9999 }} />
                  )}
                />
              </Box>
            </Box>
          </Box>

          {/* Property Type Field */}
          <Box 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '32px',
              border: '1px solid #DDDDDD',
              minWidth: '180px',
              flex: 1,
              maxWidth: '220px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-1px)'
              },
              '&:focus-within': {
                boxShadow: '0 0 0 2px rgba(0, 102, 204, 0.2)',
                borderColor: '#0066CC'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2 }}>
              <Home sx={{ color: '#717171', mr: 2, fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                  PROPERTY TYPE
                </Typography>
                <FormControl fullWidth variant="standard">
                  <Select
                    value={filters.propertyType}
                    onChange={(e) => onFilterChange('propertyType', e.target.value)}
                    displayEmpty
                    disableUnderline
                    sx={{ 
                      fontSize: '0.9rem',
                      '& .MuiSelect-select': {
                        fontSize: '0.9rem',
                        color: filters.propertyType ? '#717171' : '#B0B0B0',
                        padding: 0
                      }
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return <span>Add property type</span>;
                      }
                      return selected.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    }}
                  >
                    <MenuItem value="">All Property Types</MenuItem>
                    {propertyTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {/* University Field */}
          <Box 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '32px',
              border: '1px solid #DDDDDD',
              minWidth: '200px',
              flex: 1,
              maxWidth: '250px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-1px)'
              },
              '&:focus-within': {
                boxShadow: '0 0 0 2px rgba(0, 102, 204, 0.2)',
                borderColor: '#0066CC'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2 }}>
              <School sx={{ color: '#717171', mr: 2, fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#222', mb: 0.5 }}>
                  UNIVERSITY
                </Typography>
                <Autocomplete
                  options={kenyanUniversities}
                  value={filters.university}
                  onChange={(_, value) => onFilterChange('university', value || '')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      placeholder="Add university"
                      variant="standard"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        sx: {
                          fontSize: '0.9rem',
                          '& input': {
                            fontSize: '0.9rem',
                            padding: 0,
                            color: '#717171',
                            '&::placeholder': {
                              color: '#B0B0B0',
                              opacity: 1
                            }
                          }
                        }
                      }}
                      InputLabelProps={{
                        shrink: false,
                        sx: { display: 'none' }
                      }}
                    />
                  )}
                  freeSolo
                  PopperComponent={(props) => (
                    <Box {...props} sx={{ zIndex: 9999 }} />
                  )}
                />
              </Box>
            </Box>
          </Box>

          {/* Search Button */}
          <Button
            variant="contained"
            onClick={onSearch}
            sx={{ 
              borderRadius: '32px',
              minWidth: '120px',
              height: '56px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)',
              boxShadow: '0 2px 8px rgba(255, 56, 92, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E31C5F 0%, #C13584 100%)',
                boxShadow: '0 4px 16px rgba(255, 56, 92, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            🔍 Search
          </Button>
        </Box>

        {/* Quick Price Filters */}
        <Box sx={{ mt: 4, display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ color: '#717171', mr: 2, alignSelf: 'center' }}>
            Popular price ranges:
          </Typography>
          {priceRanges.slice(0, 4).map((range) => (
            <Chip
              key={range.label}
              label={range.label}
              onClick={() => handlePriceRangeSelect(range)}
              variant={
                filters.minPrice === range.min.toString() && 
                (filters.maxPrice === range.max.toString() || (range.max === 1000000 && !filters.maxPrice))
                  ? 'filled' : 'outlined'
              }
              color="primary"
              sx={{ 
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
                borderRadius: '16px',
                height: '32px',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          Advanced Search
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={onClearFilters}
          size="small"
        >
          Clear All
        </Button>
      </Box>

      {/* Quick Price Filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Price Ranges
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {priceRanges.map((range) => (
            <Chip
              key={range.label}
              label={range.label}
              onClick={() => handlePriceRangeSelect(range)}
              variant={
                filters.minPrice === range.min.toString() && 
                (filters.maxPrice === range.max.toString() || (range.max === 1000000 && !filters.maxPrice))
                  ? 'filled' : 'outlined'
              }
              color="primary"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {/* Main Filters */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            options={kenyanCounties}
            value={filters.county}
            onChange={(_, value) => {
              onFilterChange('county', value || '');
              // Clear town when county changes
              if (filters.town && value && !getTownsForCounty(value).includes(filters.town)) {
                onFilterChange('town', '');
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="County" 
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <LocationOn sx={{ mr: 2, color: 'action.active' }} />
                {option}
              </Box>
            )}
            filterOptions={(options, { inputValue }) =>
              options.filter(option =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            noOptionsText="No counties found"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            options={townsForSelectedCounty}
            value={filters.town}
            onChange={(_, value) => onFilterChange('town', value || '')}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label={filters.county ? `Towns in ${filters.county}` : "Town/City"} 
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <LocationOn sx={{ mr: 2, color: 'action.active' }} />
                {option}
              </Box>
            )}
            filterOptions={(options, { inputValue }) =>
              options.filter(option =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            noOptionsText={filters.county ? `No towns found in ${filters.county}` : "No towns found"}
            disabled={!filters.county && kenyanCounties.length > 0}
            placeholder={!filters.county ? "Select county first" : "Search towns..."}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Property Type</InputLabel>
            <Select
              value={filters.propertyType}
              onChange={(e) => onFilterChange('propertyType', e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {propertyTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            options={kenyanUniversities}
            value={filters.university}
            onChange={(_, value) => onFilterChange('university', value || '')}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Near University" 
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <School sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <School sx={{ mr: 2, color: 'action.active' }} />
                {option}
              </Box>
            )}
            filterOptions={(options, { inputValue }) =>
              options.filter(option =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            noOptionsText="No universities found"
            freeSolo
          />
        </Grid>

        {showAdvanced && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Min Price (KES)"
                type="number"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                size="small"
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Price (KES)"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                size="small"
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={onSearch}
              sx={{ minWidth: 120 }}
            >
              Search Properties
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Reset Search
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchFilters;