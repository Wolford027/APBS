import * as React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';

export default function SearchBar({ onSearchChange }) {

  const handleSearchChange = (event) => {
    if (onSearchChange) onSearchChange(event.target.value)
  }

  return (
    <TextField
      size="small"
      variant="outlined"
      placeholder="Search…"
      onChange={handleSearchChange}
      sx={{ minWidth: 260, bgcolor: 'background.paper' }}
      inputProps={{ 'aria-label': 'Search' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
}
