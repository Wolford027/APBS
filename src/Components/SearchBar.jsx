import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';


export default function SearchBar({onSearchChange}) {

  const handleSearchChange = (event) => {
    onSearchChange(event.target.value)
  }


  return (
    <Box sx={{ flexGrow: 1 }} style={{display: 'flex'}}> 
        <Toolbar >
        <TextField size="small" variant="outlined" placeholder="Search..." onChange={handleSearchChange} > Search...</TextField>  
        <SearchIcon sx={{ marginLeft:-4 }}/>
        </Toolbar>
     
    </Box>
  );
}