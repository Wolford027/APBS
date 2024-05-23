import * as React from 'react'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { Card, CardContent, Typography } from '@mui/material'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

export default function DepartmentFilter() {
  const [age, setAge] = React.useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <div>
        <Card elevation={2} sx={{maxWidth: 345, marginLeft:35, marginTop:-10}}>
            <CardContent>
                <Typography><strong>Department</strong></Typography>
                <FormControl sx={{ m: 1, minWidth: 300 }} size="meduim">
                        <InputLabel id="demo-select-small-label">All</InputLabel>
                            <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={age}
                                label="Age"
                                onChange={handleChange}
                            >
                                <FormGroup sx={{marginLeft:2}}>
                                <FormControlLabel control={<Checkbox />} label="All" />
                                <FormControlLabel required control={<Checkbox />} label="Required" />
                                </FormGroup>
                            </Select>
                    </FormControl>
            </CardContent>
        </Card>
    </div>
  );
}