import React, { useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Card, CardContent, Typography, Box } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function DepartmentFilter() {
  const [department, setDepartment] = useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setDepartment(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'start', mt: 10, marginLeft: -70 }}>
      <Card elevation={3} sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <strong>Department</strong>
          </Typography>
          <FormControl fullWidth size="medium">
            <InputLabel id="department-select-label">Select Department</InputLabel>
            <Select
              labelId="department-select-label"
              id="department-select"
              value={department}
              multiple
              onChange={handleChange}
              renderValue={(selected) => selected.join(', ')}
              label="Select Department"
            >
              <MenuItem value="All">
                <FormControlLabel control={<Checkbox checked={department.includes('All')} />} label="All" />
              </MenuItem>
              <MenuItem value="Required">
                <FormControlLabel control={<Checkbox checked={department.includes('Required')} />} label="Required" />
              </MenuItem>
              {/* Add more MenuItems here as needed */}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  );
}
