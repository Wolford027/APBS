import * as React from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import USDFlag from '../assets/Flags/1.png'
import PHPFlag from '../assets/Flags/3.png'
import JPYFlag from '../assets/Flags/2.png'
import EURFlag from '../assets/Flags/4.png'
import { Avatar } from '@mui/material'

const currencies = [
  {
    value: 'USD',
    label: '$',
  },
  {
    value: 'EUR',
    label: '€',
  },
  {
    value: 'JPY',
    label: '¥',
  },
  {
    value: 'PHP',
    label: ' ₱',
  },
];

export default function SelectTextFields() {
  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' }, marginTop:10,
      }}
      noValidate
      autoComplete="off"
    >
      <div>
        <TextField
          id="outlined-select-currency"
          select
          label="Select"
          defaultValue="USD"
          helperText="Please select your currency"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Avatar alt='USDFlag' src={USDFlag} sx={{width:30, height:30}} />
              </InputAdornment>
            ),
          }}
        >
          {currencies.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}    
            </MenuItem>
          ))}
        </TextField>
      </div>
    </Box>
  );
}