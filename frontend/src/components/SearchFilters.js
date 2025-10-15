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
import { FilterList, Clear, LocationOn, School } from '@mui/icons-material';
import { kenyanCounties, getTownsForCounty, getAllTowns, kenyanUniversities } from '../data/kenyanLocations';

const SearchFilters = ({ 
  filters, 
  onFilterChange, 
  onSearch, 
  onClearFilters,
  showAdvanced = false 
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

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          Search Filters
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