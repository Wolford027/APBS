import * as React from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { Avatar } from '@mui/material'
import USDFlag from '../assets/Flags/1.png'
import PHPFlag from '../assets/Flags/3.png'
import JPYFlag from '../assets/Flags/2.png'
import EURFlag from '../assets/Flags/4.png'

const currencies = [
  {
    value: 'USD',
    label: '$',
    flag: USDFlag,
  },
  {
    value: 'EUR',
    label: '€',
    flag: EURFlag,
  },
  {
    value: 'JPY',
    label: '¥',
    flag: JPYFlag,
  },
  {
    value: 'PHP',
    label: ' ₱',
    flag: PHPFlag,
  },
];

export default function SelectTextFields() {
  const [currency, setCurrency] = React.useState('USD');

  const handleChange = (event) => {
    setCurrency(event.target.value);
  };

  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '12ch' },
        marginTop: 10, marginLeft: -10,
      }}
      noValidate
      autoComplete="off"
    >
      <div>
        <TextField
          id="outlined-select-currency"
          select
          label="Select"
          value={currency}
          onChange={handleChange}
          helperText="Please select your currency"
        >
          {currencies.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Avatar alt={option.value} src={option.flag} sx={{ width: 20, height: 20, marginRight: 1 }} />
              {option.label} ({option.value})
            </MenuItem>
          ))}
        </TextField>
      </div>
    </Box>
  );
}
